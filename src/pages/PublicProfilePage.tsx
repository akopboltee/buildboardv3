import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Globe, TriangleAlert as AlertTriangle, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { PostCard } from "@/components/PostCard"
import { ReportModal } from "@/components/ReportModal"
import { supabase, type Profile, type Post } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [hasBlockedUser, setHasBlockedUser] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    if (!username) return

    fetchProfile()
  }, [username])

  async function fetchProfile() {
    setLoading(true)
    setError(null)

    // Find profile by display_name
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("display_name", username)
      .maybeSingle()

    if (profileError || !profileData) {
      setError("Profile not found")
      setLoading(false)
      return
    }

    // Check if profile is private
    if (!profileData.profile_public) {
      // If not the owner, show 404
      if (!user || user.id !== profileData.user_id) {
        setError("Profile not found")
        setLoading(false)
        return
      }
    }

    setProfile(profileData)

    // Check if current user has blocked this user
    if (user && user.id !== profileData.user_id) {
      const { data: blockCheck } = await supabase
        .from("blocks")
        .select("id")
        .eq("blocker_id", user.id)
        .eq("blocked_id", profileData.user_id)
        .maybeSingle()

      if (blockCheck) {
        setHasBlockedUser(true)
      }

      // Check if this user has blocked current user
      const { data: blockedByCheck } = await supabase
        .from("blocks")
        .select("id")
        .eq("blocker_id", profileData.user_id)
        .eq("blocked_id", user.id)
        .maybeSingle()

      if (blockedByCheck) {
        setIsBlocked(true)
        setLoading(false)
        return
      }
    }

    // Fetch posts
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", profileData.user_id)
      .order("created_at", { ascending: false })

    if (postsData) {
      // Get comment counts
      const postIds = postsData.map((p) => p.id)
      const { data: commentCounts } = await supabase
        .from("comments")
        .select("post_id")
        .in("post_id", postIds)

      const countMap: Record<string, number> = {}
      commentCounts?.forEach((c) => {
        countMap[c.post_id] = (countMap[c.post_id] ?? 0) + 1
      })

      setPosts(
        postsData.map((p) => ({
          ...p,
          comment_count: countMap[p.id] ?? 0,
        }))
      )
    }

    setLoading(false)
  }

  async function handleBlock() {
    if (!user || !profile) return

    if (hasBlockedUser) {
      // Unblock
      await supabase
        .from("blocks")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", profile.user_id)
      setHasBlockedUser(false)
    } else {
      // Block
      await supabase.from("blocks").insert({
        blocker_id: user.id,
        blocked_id: profile.user_id,
      })
      setHasBlockedUser(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">
          <Skeleton className="h-6 w-24 mb-6" />
          <div className="flex flex-col items-center mb-8">
            <Skeleton className="size-32 rounded-full mb-4" />
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-16 w-full max-w-md" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="size-3" />
            Back to feed
          </Link>
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Profile not found</p>
            <p className="text-muted-foreground/60 text-sm mt-2">
              This profile may be private or doesn't exist.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="size-3" />
            Back to feed
          </Link>
          <div className="text-center py-20">
            <Ban className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Profile unavailable</p>
            <p className="text-muted-foreground/60 text-sm mt-2">
              This user has blocked you.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const displayName = profile.display_name || "Anonymous"
  const avatarUrl = profile.avatar_url

  const hasLinks = profile.github_url || profile.youtube_url || profile.twitter_url ||
    profile.instagram_url || profile.linkedin_url || profile.website_url

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-3" />
          Back to feed
        </Link>

        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="size-32 rounded-full object-cover border-4 border-background mb-4"
            />
          ) : (
            <div className="size-32 rounded-full bg-muted border-4 border-background flex items-center justify-center mb-4">
              <span className="text-4xl font-medium text-muted-foreground">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          <h1 className="text-2xl font-semibold text-foreground">{displayName}</h1>
          {profile.pronouns && (
            <p className="text-sm text-muted-foreground mt-1">{profile.pronouns}</p>
          )}

          {profile.bio && (
            <p className="text-sm text-muted-foreground text-center mt-4 max-w-md">
              {profile.bio}
            </p>
          )}

          {/* Platform Links */}
          {hasLinks && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {profile.github_url && (
                <a
                  href={profile.github_url.startsWith("http") ? profile.github_url : `https://github.com/${profile.github_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium hover:bg-muted/80 transition-colors"
                >
                  GitHub
                </a>
              )}
              {profile.youtube_url && (
                <a
                  href={profile.youtube_url.startsWith("http") ? profile.youtube_url : `https://youtube.com/@${profile.youtube_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
                >
                  YouTube
                </a>
              )}
              {profile.twitter_url && (
                <a
                  href={profile.twitter_url.startsWith("http") ? profile.twitter_url : `https://x.com/${profile.twitter_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-medium hover:bg-sky-500/20 transition-colors"
                >
                  X
                </a>
              )}
              {profile.instagram_url && (
                <a
                  href={profile.instagram_url.startsWith("http") ? profile.instagram_url : `https://instagram.com/${profile.instagram_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-400 text-xs font-medium hover:bg-pink-500/20 transition-colors"
                >
                  Instagram
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url.startsWith("http") ? profile.linkedin_url : `https://linkedin.com/in/${profile.linkedin_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url.startsWith("http") ? profile.website_url : `https://${profile.website_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium hover:bg-muted/80 transition-colors"
                >
                  <Globe className="size-3.5" />
                  Website
                </a>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {user && user.id !== profile.user_id && (
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBlock}
                className="text-xs"
              >
                {hasBlockedUser ? (
                  "Unblock user"
                ) : (
                  <>
                    <Ban className="size-3 mr-1" />
                    Block user
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReportOpen(true)}
                className="text-xs text-muted-foreground"
              >
                <AlertTriangle className="size-3 mr-1" />
                Report
              </Button>
            </div>
          )}
        </div>

        {/* Posts Section */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Posts ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No posts yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-w-[720px]">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        contentType="user"
        contentId={profile?.user_id || ""}
        reportedUserId={profile?.user_id}
      />
    </div>
  )
}
