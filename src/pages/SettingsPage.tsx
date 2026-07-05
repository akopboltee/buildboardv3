import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Moon, Sun, Monitor, Eye, EyeOff, Loader as Loader2, Trash2, Camera, Check, TriangleAlert as AlertTriangle, Lock, User, Globe, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "@/components/theme-provider"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
  sanitizeBio,
  sanitizeText,
} from "@/lib/sanitize"
import { uploadMedia, validateAvatarFile } from "@/lib/media-upload"

interface Profile {
  id: string
  user_id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  pronouns: string | null
  github_url: string | null
  youtube_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  website_url: string | null
  profile_public: boolean
  show_real_name: boolean
  default_anonymous: boolean
  email_notifications: boolean
  weekly_digest: boolean
  created_at: string
  updated_at: string
}

interface BlockedUser {
  id: string
  blocked_id: string
  profiles: { display_name: string | null; avatar_url: string | null }
}

type SettingsTab = "profile" | "account" | "appearance" | "notifications" | "privacy"

const THEMES = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
]

export function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [pronouns, setPronouns] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [twitterUrl, setTwitterUrl] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")

  // Account state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")

  // Email change state
  const [newEmail, setNewEmail] = useState("")
  const [emailChangeOpen, setEmailChangeOpen] = useState(false)

  // Privacy state
  const [profilePublic, setProfilePublic] = useState(true)
  const [showRealName, setShowRealName] = useState(true)
  const [defaultAnonymous, setDefaultAnonymous] = useState(false)

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])

  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)

  // Success/error states
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Validation states
  const [displayNameError, setDisplayNameError] = useState<string | null>(null)
  const [bioError, setBioError] = useState<string | null>(null)
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null)
  const [newEmailError, setNewEmailError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak")
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth")
  }, [user, authLoading, navigate])

  // Load profile
  useEffect(() => {
    if (!user) return

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
        setDisplayName(data.display_name || "")
        setBio(data.bio || "")
        setAvatarUrl(data.avatar_url ?? null)
        setPronouns(data.pronouns || "")
        setGithubUrl(data.github_url || "")
        setYoutubeUrl(data.youtube_url || "")
        setTwitterUrl(data.twitter_url || "")
        setInstagramUrl(data.instagram_url || "")
        setLinkedinUrl(data.linkedin_url || "")
        setWebsiteUrl(data.website_url || "")
        setProfilePublic(data.profile_public)
        setShowRealName(data.show_real_name)
        setDefaultAnonymous(data.default_anonymous || false)
        setEmailNotifications(data.email_notifications)
        setWeeklyDigest(data.weekly_digest)
      }
      setLoadingProfile(false)
    }

    async function loadBlockedUsers() {
      const { data } = await supabase
        .from("blocks")
        .select("id, blocked_id, profiles!blocked_id(display_name, avatar_url)")
        .eq("blocker_id", user!.id)

      if (data) {
        setBlockedUsers(data as unknown as BlockedUser[])
      }
    }

    loadProfile()
    loadBlockedUsers()
  }, [user])

  // Validation on change
  useEffect(() => {
    if (displayName) {
      const result = validateDisplayName(displayName)
      setDisplayNameError(result.valid ? null : (result.error ?? null))
    } else {
      setDisplayNameError(null)
    }
  }, [displayName])

  useEffect(() => {
    if (bio) {
      const result = sanitizeBio(bio)
      setBioError(result.valid ? null : (result.error ?? null))
    } else {
      setBioError(null)
    }
  }, [bio])

  useEffect(() => {
    if (newPassword) {
      const result = validatePassword(newPassword)
      setNewPasswordError(result.valid ? null : (result.error ?? null))
      setPasswordStrength(result.strength)
    } else {
      setNewPasswordError(null)
      setPasswordStrength("weak")
    }
  }, [newPassword])

  useEffect(() => {
    if (newEmail) {
      const result = validateEmail(newEmail)
      setNewEmailError(result.valid ? null : (result.error ?? null))
    } else {
      setNewEmailError(null)
    }
  }, [newEmail])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarError(null)
    const validation = await validateAvatarFile(file)
    if (!validation.valid) {
      setAvatarError(validation.error || "Invalid image")
      return
    }

    // Moderate image with OpenAI
    const imageData = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })

    const { data: { session } } = await supabase.auth.getSession()
    const modRes = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/moderate-content`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ imageData }),
      }
    )
    const modResult = await modRes.json()

    if (!modResult.allowed) {
      setAvatarError(modResult.reason || "Image violates our guidelines")
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user || displayNameError || bioError) return

    setSavingProfile(true)
    setProfileError(null)
    setProfileSuccess(false)

    let avatarPath = avatarUrl

    // Upload new avatar if selected
    if (avatarFile) {
      const uploadResult = await uploadMedia(avatarFile, user.id, "avatars")
      if (!uploadResult.success) {
        setAvatarError(uploadResult.error || "Failed to upload avatar")
        setSavingProfile(false)
        return
      }
      avatarPath = uploadResult.url ?? null
      setAvatarUrl(uploadResult.signedUrl ?? null)
    }

    const sanitizedName = displayName ? sanitizeText(displayName).trim() : null
    const bioResult = sanitizeBio(bio)
    const sanitizedBio = bioResult.value

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: sanitizedName,
        bio: sanitizedBio,
        avatar_url: avatarPath,
        pronouns: pronouns.trim() || null,
        github_url: githubUrl.trim() || null,
        youtube_url: youtubeUrl.trim() || null,
        twitter_url: twitterUrl.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        website_url: websiteUrl.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (error) {
      setProfileError("Failed to save changes. Please try again.")
    } else {
      // Also update auth metadata
      if (sanitizedName) {
        await supabase.auth.updateUser({
          data: { full_name: sanitizedName },
        })
      }
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    }

    setSavingProfile(false)
    setAvatarFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!user || newPasswordError || newPassword !== confirmNewPassword) return

    setSavingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-actions?action=change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
            "Apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok || data.error) {
        setPasswordError(data.error || "Failed to change password")
      } else {
        setPasswordSuccess(true)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
        setTimeout(() => setPasswordSuccess(false), 3000)
      }
    } catch {
      setPasswordError("Network error. Please try again.")
    }

    setSavingPassword(false)
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!user || newEmailError) return

    setSavingEmail(true)
    setEmailError(null)
    setEmailSuccess(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-actions?action=change-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
            "Apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ newEmail }),
        }
      )

      const data = await res.json()

      if (!res.ok || data.error) {
        setEmailError(data.error || "Failed to change email")
      } else {
        setEmailSuccess(true)
        setNewEmail("")
        setEmailChangeOpen(false)
        setTimeout(() => setEmailSuccess(false), 5000)
      }
    } catch {
      setEmailError("Network error. Please try again.")
    }

    setSavingEmail(false)
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE" || !user) return

    setDeletingAccount(true)
    setDeleteError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-actions?action=delete-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
            "Apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ confirmation: deleteConfirm }),
        }
      )

      const data = await res.json()

      if (!res.ok || data.error) {
        setDeleteError(data.error || "Failed to delete account")
      } else {
        // Sign out and redirect
        await supabase.auth.signOut()
        navigate("/")
      }
    } catch {
      setDeleteError("Network error. Please try again.")
    }

    setDeletingAccount(false)
  }

  async function handleSaveNotifications() {
    if (!user) return

    await supabase
      .from("profiles")
      .update({
        email_notifications: emailNotifications,
        weekly_digest: weeklyDigest,
      })
      .eq("user_id", user.id)
  }

  async function handleSavePrivacy() {
    if (!user) return

    await supabase
      .from("profiles")
      .update({
        profile_public: profilePublic,
        show_real_name: showRealName,
        default_anonymous: defaultAnonymous,
      })
      .eq("user_id", user.id)
  }

  async function handleUnblock(blockId: string) {
    await supabase.from("blocks").delete().eq("id", blockId)
    setBlockedUsers((prev) => prev.filter((b) => b.id !== blockId))
  }

  async function handleDownloadData() {
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user!.id)

    const { data: comments } = await supabase
      .from("comments")
      .select("*")
      .eq("user_id", user!.id)

    const data = {
      profile,
      posts: posts || [],
      comments: comments || [],
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `buildboard-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (authLoading || !user || loadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </main>
      </div>
    )
  }

  const displayAvatar = avatarPreview || avatarUrl

  const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="size-4" /> },
    { id: "account", label: "Account", icon: <Lock className="size-4" /> },
    { id: "appearance", label: "Appearance", icon: <Moon className="size-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="size-4" /> },
    { id: "privacy", label: "Privacy", icon: <Globe className="size-4" /> },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-3" />
          Feed
        </Link>

        <div className="mb-7">
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences.</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          {!isMobile && (
            <nav className="w-48 shrink-0">
              <div className="space-y-1 sticky top-20">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left",
                      activeTab === tab.id
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Tabs - Mobile */}
            {isMobile && (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className="mb-6">
                <TabsList className="w-full grid grid-cols-5 h-auto p-1">
                  {TABS.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="p-2">
                      {tab.icon}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            {/* Profile Settings */}
            {activeTab === "profile" && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <User className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium">Profile Settings</h2>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* Avatar */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Profile picture</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {displayAvatar ? (
                          <img
                            src={displayAvatar}
                            alt="Avatar"
                            className="size-16 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="size-16 rounded-full bg-muted border border-border flex items-center justify-center">
                            <User className="size-6 text-muted-foreground" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 size-6 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Camera className="size-3" />
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Change avatar
                        </button>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">Max 5MB, image only</p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    {avatarError && <p className="text-xs text-destructive">{avatarError}</p>}
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="display-name" className="text-xs text-muted-foreground">
                        Display name
                      </Label>
                      <span className="text-xs text-muted-foreground/40">
                        {displayName.length}/20
                      </span>
                    </div>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Letters, numbers, underscores"
                      className={cn("bg-transparent h-9 text-sm", displayNameError && "border-destructive")}
                      maxLength={20}
                    />
                    {displayNameError && <p className="text-xs text-destructive">{displayNameError}</p>}
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bio" className="text-xs text-muted-foreground">
                        Bio
                      </Label>
                      <span className="text-xs text-muted-foreground/40">
                        {bio.length}/150
                      </span>
                    </div>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className={cn("bg-transparent text-sm resize-none min-h-20", bioError && "border-destructive")}
                      maxLength={150}
                    />
                    {bioError && <p className="text-xs text-destructive">{bioError}</p>}
                  </div>

                  {/* Pronouns */}
                  <div className="space-y-2">
                    <Label htmlFor="pronouns" className="text-xs text-muted-foreground">
                      Pronouns
                    </Label>
                    <Input
                      id="pronouns"
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      placeholder="e.g. they/them, she/her, he/him"
                      className="bg-transparent h-9 text-sm"
                      maxLength={20}
                    />
                  </div>

                  {/* Social Links */}
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">Social Links</Label>
                    <div className="grid gap-2">
                      <Input
                        placeholder="GitHub username or URL"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="bg-transparent h-9 text-sm"
                        maxLength={100}
                      />
                      <Input
                        placeholder="YouTube handle or URL"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="bg-transparent h-9 text-sm"
                        maxLength={100}
                      />
                      <Input
                        placeholder="X (Twitter) handle or URL"
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        className="bg-transparent h-9 text-sm"
                        maxLength={100}
                      />
                      <Input
                        placeholder="Instagram handle or URL"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        className="bg-transparent h-9 text-sm"
                        maxLength={100}
                      />
                      <Input
                        placeholder="LinkedIn profile or URL"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="bg-transparent h-9 text-sm"
                        maxLength={100}
                      />
                      <Input
                        placeholder="Website URL"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="bg-transparent h-9 text-sm"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Email address</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{user.email}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setEmailChangeOpen(true)}
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  {profileError && <p className="text-xs text-destructive">{profileError}</p>}
                  {profileSuccess && (
                    <p className="text-xs text-green-500 flex items-center gap-1.5">
                      <Check className="size-3" />
                      Profile updated successfully
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="sm"
                    disabled={savingProfile || !!displayNameError || !!bioError}
                    className="h-8 text-xs"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="size-3 animate-spin mr-1.5" />
                        Saving...
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </form>

                {/* Email change dialog */}
                <AlertDialog open={emailChangeOpen} onOpenChange={setEmailChangeOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Change email address</AlertDialogTitle>
                      <AlertDialogDescription>
                        Enter your new email address. You'll need to verify both your current and new email.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form onSubmit={handleChangeEmail}>
                      <div className="space-y-3 py-4">
                        <Input
                          type="email"
                          placeholder="New email address"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className={cn("h-9 text-sm", newEmailError && "border-destructive")}
                        />
                        {newEmailError && <p className="text-xs text-destructive">{newEmailError}</p>}
                        {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                        {emailSuccess && (
                          <p className="text-xs text-green-500">Verification emails sent. Check both inboxes.</p>
                        )}
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction type="submit" disabled={savingEmail || !!newEmailError || !newEmail}>
                          {savingEmail ? "Sending..." : "Send verification"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </form>
                  </AlertDialogContent>
                </AlertDialog>
              </section>
            )}

            {/* Account Settings */}
            {activeTab === "account" && (
              <section className="space-y-8">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium">Account Settings</h2>
                </div>

                {/* Password change */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</h3>
                    <p className="text-xs text-muted-foreground">Change your password</p>
                  </div>
                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-xs text-muted-foreground">
                        Current password
                      </Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-transparent h-9 text-sm pr-9"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-xs text-muted-foreground">
                        New password
                      </Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={cn("bg-transparent h-9 text-sm pr-9", newPasswordError && "border-destructive")}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      {newPassword && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all",
                                passwordStrength === "weak" && "w-1/3 bg-red-500",
                                passwordStrength === "medium" && "w-2/3 bg-yellow-500",
                                passwordStrength === "strong" && "w-full bg-green-500"
                              )}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground capitalize">{passwordStrength}</span>
                        </div>
                      )}
                      {newPasswordError && <p className="text-xs text-destructive">{newPasswordError}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password" className="text-xs text-muted-foreground">
                        Confirm new password
                      </Label>
                      <Input
                        id="confirm-new-password"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={cn(
                          "bg-transparent h-9 text-sm",
                          confirmNewPassword && newPassword && confirmNewPassword !== newPassword && "border-destructive"
                        )}
                        required
                      />
                    </div>

                    {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                    {passwordSuccess && (
                      <p className="text-xs text-green-500 flex items-center gap-1.5">
                        <Check className="size-3" />
                        Password changed successfully
                      </p>
                    )}

                    <Button
                      type="submit"
                      size="sm"
                      disabled={savingPassword || !currentPassword || !newPassword || newPassword !== confirmNewPassword}
                      className="h-8 text-xs"
                    >
                      {savingPassword ? (
                        <>
                          <Loader2 className="size-3 animate-spin mr-1.5" />
                          Changing...
                        </>
                      ) : (
                        "Change password"
                      )}
                    </Button>
                  </form>
                </div>

                <Separator className="bg-border/50" />

                {/* Account info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Account Information
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Account created</p>
                      <p className="text-sm text-foreground">
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Account ID</p>
                      <p className="text-xs font-mono text-muted-foreground/70">{user?.id}</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Data management */}
                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Data Management
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadData}
                      className="h-8 text-xs"
                    >
                      Download my data
                    </Button>
                    <p className="text-xs text-muted-foreground/60">
                      Download a JSON file with your posts, comments, and profile data.
                    </p>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Delete account */}
                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Danger Zone
                  </h3>
                  <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="size-4 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Delete your account</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          This will permanently delete your account, all posts, comments, and data. This action cannot be undone.
                        </p>
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="h-8 text-xs">
                          <Trash2 className="size-3 mr-1.5" />
                          Delete account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete your account and all associated data. Type <strong>DELETE</strong> to confirm.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-3 py-4">
                          <Input
                            placeholder="Type DELETE to confirm"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            className="h-9 text-sm"
                          />
                          {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteConfirm("")}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={deleteConfirm !== "DELETE" || deletingAccount}
                            onClick={handleDeleteAccount}
                          >
                            {deletingAccount ? (
                              <>
                                <Loader2 className="size-3 animate-spin mr-1.5" />
                                Deleting...
                              </>
                            ) : (
                              "Delete permanently"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </section>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Moon className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium">Appearance</h2>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Theme
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {THEMES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-lg border px-3 py-4 text-xs font-medium transition-all",
                          theme === value
                            ? "border-foreground/30 bg-muted text-foreground"
                            : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                        )}
                      >
                        <Icon className="size-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    Theme preference is saved locally and will persist across sessions.
                  </p>
                </div>
              </section>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Bell className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium">Notifications</h2>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm text-foreground">Email notifications</p>
                      <p className="text-xs text-muted-foreground">
                        Receive an email when someone comments on your post
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={(checked) => {
                        setEmailNotifications(checked)
                        handleSaveNotifications()
                      }}
                    />
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm text-foreground">Weekly digest</p>
                      <p className="text-xs text-muted-foreground">
                        Get a weekly email with highlights from the community
                      </p>
                    </div>
                    <Switch
                      checked={weeklyDigest}
                      onCheckedChange={(checked) => {
                        setWeeklyDigest(checked)
                        handleSaveNotifications()
                      }}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium">Privacy</h2>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm text-foreground">Public profile</p>
                      <p className="text-xs text-muted-foreground">
                        Allow others to view your profile page and posts
                      </p>
                    </div>
                    <Switch
                      checked={profilePublic}
                      onCheckedChange={(checked) => {
                        setProfilePublic(checked)
                        handleSavePrivacy()
                      }}
                    />
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm text-foreground">Show your name</p>
                      <p className="text-xs text-muted-foreground">
                        Display your name on posts and comments. If disabled, you'll appear as "Anonymous".
                      </p>
                    </div>
                    <Switch
                      checked={showRealName}
                      onCheckedChange={(checked) => {
                        setShowRealName(checked)
                        handleSavePrivacy()
                      }}
                    />
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm text-foreground">Post anonymously by default</p>
                      <p className="text-xs text-muted-foreground">
                        New posts and comments will show as "Anonymous" by default
                      </p>
                    </div>
                    <Switch
                      checked={defaultAnonymous}
                      onCheckedChange={(checked) => {
                        setDefaultAnonymous(checked)
                        handleSavePrivacy()
                      }}
                    />
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Blocked Users */}
                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Blocked Users
                  </h3>
                  {blockedUsers.length === 0 ? (
                    <p className="text-xs text-muted-foreground">You haven't blocked any users.</p>
                  ) : (
                    <div className="space-y-2">
                      {blockedUsers.map((block) => (
                        <div
                          key={block.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                        >
                          <div className="flex items-center gap-3">
                            {block.profiles.avatar_url ? (
                              <img
                                src={block.profiles.avatar_url}
                                alt=""
                                className="size-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="size-4 text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-sm text-foreground">
                              {block.profiles.display_name || "Anonymous"}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnblock(block.id)}
                            className="h-7 text-xs"
                          >
                            Unblock
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
