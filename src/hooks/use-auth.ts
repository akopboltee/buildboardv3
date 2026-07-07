import * as React from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

type UserProfile = {
  role: string
  is_banned: boolean
  is_shadowbanned: boolean
  warning_count: number
  ban_until: string | null
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  displayName: string
  profile: UserProfile | null
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  loading: true,
  displayName: "",
  profile: null,
  signOut: async () => {},
})

// Session timeout: 7 days of inactivity
const SESSION_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000
const ACTIVITY_KEY = "makra_last_activity"

function updateActivity() {
  localStorage.setItem(ACTIVITY_KEY, Date.now().toString())
}

function getLastActivity(): number {
  const stored = localStorage.getItem(ACTIVITY_KEY)
  return stored ? parseInt(stored, 10) : 0
}

function isSessionExpired(): boolean {
  const lastActivity = getLastActivity()
  if (!lastActivity) return false
  return Date.now() - lastActivity > SESSION_TIMEOUT_MS
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Fetch profile data
  const fetchProfile = React.useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("role, is_banned, is_shadowbanned, warning_count, ban_until")
      .eq("user_id", userId)
      .maybeSingle()

    if (data) {
      setProfile(data as UserProfile)

      // Check if user is banned
      if (data.is_banned) {
        // Check if temp ban has expired
        if (data.ban_until && new Date(data.ban_until as string) < new Date()) {
          // Ban expired, update profile
          await supabase
            .from("profiles")
            .update({ is_banned: false, ban_until: null, banned_at: null })
            .eq("user_id", userId)
          setProfile((prev) => prev ? { ...prev, is_banned: false, ban_until: null } : null)
        } else {
          // User is banned, sign them out
          await supabase.auth.signOut()
          return
        }
      }
    }
  }, [])

  React.useEffect(() => {
    // Check session expiration on mount
    if (isSessionExpired()) {
      localStorage.removeItem(ACTIVITY_KEY)
      supabase.auth.signOut()
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        updateActivity()
        fetchProfile(data.session.user.id)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        updateActivity()
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [fetchProfile])

  // Update activity on user interaction
  React.useEffect(() => {
    if (!user) return

    const events = ["mousedown", "keydown", "touchstart", "scroll"]
    let lastUpdate = Date.now()

    const handleActivity = () => {
      const now = Date.now()
      // Throttle updates to once per minute
      if (now - lastUpdate > 60000) {
        lastUpdate = now
        updateActivity()
      }
    }

    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }))

    // Check for session expiration every 5 minutes
    const interval = setInterval(() => {
      if (isSessionExpired()) {
        localStorage.removeItem(ACTIVITY_KEY)
        supabase.auth.signOut()
      }
    }, 5 * 60 * 1000)

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity))
      clearInterval(interval)
    }
  }, [user])

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut()
    localStorage.removeItem(ACTIVITY_KEY)
  }, [])

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? ""

  const value = React.useMemo(
    () => ({ user, loading, displayName, profile, signOut }),
    [user, loading, displayName, profile, signOut]
  )

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  return React.useContext(AuthContext)
}
