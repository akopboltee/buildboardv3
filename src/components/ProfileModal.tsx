import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Globe, TriangleAlert as AlertTriangle, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase, type Profile } from "@/lib/supabase"
import { ReportModal } from "@/components/ReportModal"
import { useAuth } from "@/hooks/use-auth"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile | null
  onBlock?: () => void
}

export function ProfileModal({ open, onOpenChange, profile, onBlock }: ProfileModalProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [reportOpen, setReportOpen] = useState(false)
  const [hasBlocked, setHasBlocked] = useState(false)

  useEffect(() => {
    if (open && profile?.user_id) {
      supabase
        .from("posts")
        .select("*")
        .eq("user_id", profile.user_id)
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data }) => {
          if (data) setPosts(data)
        })
    }
  }, [open, profile?.user_id])

  async function handleBlock() {
    if (!user || !profile) return

    await supabase.from("blocks").insert({
      blocker_id: user.id,
      blocked_id: profile.user_id,
    })
    setHasBlocked(true)
  }

  if (!profile) return null

  const displayName = profile.display_name || "Anonymous"
  const avatarUrl = profile.avatar_url

  // Check if any platform links exist
  const hasLinks = profile.github_url || profile.youtube_url || profile.twitter_url ||
    profile.instagram_url || profile.linkedin_url || profile.website_url

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Profile</DialogTitle>
        </DialogHeader>

        <div className="relative -mt-4">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="size-24 rounded-full object-cover border-4 border-background"
              />
            ) : (
              <div className="size-24 rounded-full bg-muted border-4 border-background flex items-center justify-center">
                <span className="text-3xl font-medium text-muted-foreground">
                  {displayName.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name and pronouns */}
          <div className="text-center mb-2">
            <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
            {profile.pronouns && (
              <p className="text-sm text-muted-foreground">{profile.pronouns}</p>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground text-center mb-4">{profile.bio}</p>
          )}

          {/* Platform links */}
          {hasLinks && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
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

          {/* Recent posts */}
          {posts.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Recent posts</h3>
              <div className="space-y-2">
                {posts.slice(0, 5).map((post) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    onClick={() => onOpenChange(false)}
                    className="block p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground line-clamp-1">{post.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              to={`/profile/${profile.display_name || profile.user_id}`}
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              <Button variant="outline" className="w-full">
                View full profile
              </Button>
            </Link>
          </div>

          {/* Report/Block */}
          {user && profile.user_id !== user.id && (
            <div className="flex gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReportOpen(true)}
                className="flex-1 text-muted-foreground text-xs"
              >
                <AlertTriangle className="size-3 mr-1" />
                Report
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onBlock || handleBlock}
                disabled={hasBlocked}
                className="flex-1 text-muted-foreground text-xs"
              >
                <Ban className="size-3 mr-1" />
                {hasBlocked ? "Blocked" : "Block user"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        contentType="user"
        contentId={profile?.user_id || ""}
        reportedUserId={profile?.user_id}
      />
    </Dialog>
  )
}
