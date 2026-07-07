import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, MessageSquare, Trash2, Sparkles, Loader as Loader2, Clock } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
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
import { supabase, type Post, type Comment } from "@/lib/supabase"
import { TAG_COLORS } from "@/lib/tag-colors"
import { useAuth } from "@/hooks/use-auth"
import { useRateLimit, formatRateLimitMessage } from "@/hooks/use-rate-limit"
import { sanitizeComment } from "@/lib/sanitize"
import { getSignedUrl } from "@/lib/media-upload"
import { cn } from "@/lib/utils"

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, displayName } = useAuth()
  const { limited: commentRateLimited, getTimeUntilReset, checkRateLimit } = useRateLimit()

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [commentContent, setCommentContent] = useState("")
  const [commentAuthor, setCommentAuthor] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [validating, setValidating] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [commentValidationError, setCommentValidationError] = useState<string | null>(null)

  const [explanation, setExplanation] = useState<string | null>(null)
  const [explaining, setExplaining] = useState(false)
  const [explainError, setExplainError] = useState<string | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)

  const [signedMediaUrl, setSignedMediaUrl] = useState<string | null>(null)

  // Check rate limit on mount
  useEffect(() => {
    checkRateLimit("comment")
  }, [checkRateLimit])

  async function fetchExplanation(currentPost: Post) {
    setExplaining(true)
    setExplainError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "Apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ title: currentPost.title, description: currentPost.description }),
        }
      )
      const json = await res.json()
      if (!res.ok || json.error) {
        setExplainError(json.error ?? "Failed to explain. Try again.")
      } else {
        setExplanation(json.explanation)
      }
    } catch {
      setExplainError("Network error. Please try again.")
    } finally {
      setExplaining(false)
    }
  }

  useEffect(() => {
    if (displayName) setCommentAuthor(displayName)
  }, [displayName])

  useEffect(() => {
    if (!id) return

    async function load() {
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single()

      if (postError || !postData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      // Get signed URL for media
      if (postData.media_url && !postData.media_url.startsWith("http")) {
        const signedUrl = await getSignedUrl(postData.media_url)
        setSignedMediaUrl(signedUrl)
      }

      const { data: commentData } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true })

      setPost(postData)
      setComments(commentData ?? [])
      setLoading(false)
    }

    load()
  }, [id])

  // Validate comment on change
  useEffect(() => {
    if (commentContent) {
      const result = sanitizeComment(commentContent)
      setCommentValidationError(result.valid ? null : (result.error ?? null))
    } else {
      setCommentValidationError(null)
    }
  }, [commentContent])

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Immediate feedback
    setValidating(true)
    setCommentError(null)

    const contentResult = sanitizeComment(commentContent)
    if (!contentResult.valid) {
      setCommentValidationError(contentResult.error ?? null)
      setValidating(false)
      return
    }

    if (!id || commentRateLimited) {
      setValidating(false)
      return
    }

    // Check rate limit again
    const rateCheck = await checkRateLimit("comment")
    if (!rateCheck.allowed) {
      setCommentError(formatRateLimitMessage("comment", getTimeUntilReset()))
      setValidating(false)
      return
    }

    // Moderate content
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
        body: JSON.stringify({ content: commentContent }),
      }
    )
    const modResult = await modRes.json()

    if (!modResult.allowed) {
      setCommentError(modResult.reason || "Content violates our guidelines")
      setValidating(false)
      return
    }

    setSubmitting(true)
    setValidating(false)
    setCommentError(null)

    // Get user's privacy preference
    const { data: profile } = await supabase
      .from("profiles")
      .select("show_real_name")
      .eq("user_id", user?.id)
      .maybeSingle()

    const showAnonymous = profile ? !profile.show_real_name : false

    const { data, error: insertError } = await supabase
      .from("comments")
      .insert({
        post_id: id,
        content: contentResult.value,
        author_name: showAnonymous ? null : (commentAuthor.trim() || null),
        user_id: user?.id ?? null,
        show_anonymous: showAnonymous,
        flagged: modResult.flagged || false,
      })
      .select()
      .single()

    if (insertError || !data) {
      setCommentError("Failed to post comment. Please try again.")
      setSubmitting(false)
      return
    }

    setComments((prev) => [...prev, data])
    setCommentContent("")
    if (!user) setCommentAuthor("")
    setSubmitting(false)
  }

  async function handleDeletePost() {
    if (!post) return

    // Delete media file if exists
    if (post.media_url && !post.media_url.startsWith("http")) {
      await supabase.storage.from("media-media").remove([post.media_url])
    }

    await supabase.from("posts").delete().eq("id", post.id)
    navigate("/")
  }

  async function handleDeleteComment(commentId: string) {
    await supabase.from("comments").delete().eq("id", commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const canDeletePost = !!user && post?.user_id === user.id
  const canDeleteComment = (comment: Comment) => !!user && comment.user_id === user.id

  // Determine display name based on privacy settings
  const getDisplayName = (authorName: string | null, showAnonymous: boolean = false) => {
    if (showAnonymous || !authorName) return "Anonymous"
    return authorName.trim() || "Anonymous"
  }

  const mediaUrl = signedMediaUrl || post?.media_url

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </main>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-4">Post not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            Back to feed
          </Button>
        </div>
      </div>
    )
  }

  const author = getDisplayName(post.author_name, post.show_anonymous)
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
  const fullDate = format(new Date(post.created_at), "MMM d, yyyy 'at' h:mm a")

  const isVideoMedia = post.media_url?.match(/\.(mp4|webm|ogg)$/i)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3" />
            Feed
          </Link>

          {canDeletePost && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  <Trash2 className="size-3" />
                  Delete post
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the post and all its comments.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={handleDeletePost}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <article>
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="outline"
              className={`text-xs font-medium border-0 px-2 py-0.5 ${TAG_COLORS[post.tag]}`}
            >
              {post.tag}
            </Badge>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-3">
            {post.title}
          </h1>

          {post.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {post.description}
            </p>
          )}

          {mediaUrl && (
            <div className="rounded-lg overflow-hidden border border-border/50 mb-4">
              {isVideoMedia ? (
                <video src={mediaUrl} controls className="w-full max-h-96 object-contain bg-black" />
              ) : (
                <img src={mediaUrl} alt={post.title} className="w-full max-h-96 object-contain" />
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">{author}</span>
              <span className="text-muted-foreground/40">·</span>
              <time dateTime={post.created_at} title={fullDate}>
                {timeAgo}
              </time>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs text-muted-foreground/70 hover:text-foreground gap-1.5 shrink-0"
              onClick={() => {
                setExplainOpen((v) => !v)
                if (!explanation && !explaining) fetchExplanation(post)
              }}
            >
              <Sparkles className="size-3" />
              {explainOpen ? "Hide" : "Explain this"}
            </Button>
          </div>

          {explainOpen && (
            <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
              <p className="text-xs text-muted-foreground/60 mb-2 font-medium uppercase tracking-wider">Plain English</p>
              {explaining ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Generating explanation...
                </div>
              ) : explainError ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">{explainError}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => { setExplanation(null); fetchExplanation(post) }}
                  >
                    Try again
                  </Button>
                </div>
              ) : explanation ? (
                <p className="text-sm text-foreground leading-relaxed">{explanation}</p>
              ) : null}
            </div>
          )}
        </article>

        <Separator className="my-8 bg-border/50" />

        <section>
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">
              {comments.length === 0
                ? "No comments"
                : `${comments.length} comment${comments.length === 1 ? "" : "s"}`}
            </h2>
          </div>

          {comments.length > 0 && (
            <div className="space-y-4 mb-8">
              {comments.map((comment) => (
                <div key={comment.id} className="group flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground/80">
                        {getDisplayName(comment.author_name, comment.show_anonymous)}
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {comment.content}
                    </p>
                  </div>

                  {canDeleteComment(comment) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mt-0.5"
                      title="Delete comment"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <Input
              placeholder="Your name (optional)"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              className="bg-transparent h-9 text-sm"
              maxLength={64}
              readOnly={!!user}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Comment</span>
                <span className={`text-xs tabular-nums ${commentContent.length >= 450 ? "text-yellow-500" : "text-muted-foreground/40"}`}>
                  {commentContent.length}/500
                </span>
              </div>
              <Textarea
                placeholder="Leave a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className={cn(
                  "bg-transparent text-sm resize-none min-h-20",
                  commentValidationError && "border-destructive"
                )}
                maxLength={500}
                required
              />
              {commentValidationError && (
                <p className="text-xs text-destructive">{commentValidationError}</p>
              )}
            </div>

            {commentRateLimited && (
              <div className="flex items-center gap-2 text-xs text-yellow-500">
                <Clock className="size-3" />
                {formatRateLimitMessage("comment", getTimeUntilReset())}
              </div>
            )}

            {commentError && <p className="text-xs text-destructive">{commentError}</p>}

            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={submitting || validating || !commentContent.trim() || !!commentValidationError || commentRateLimited}
                className="h-8 text-xs"
              >
                {validating ? (
                  <>
                    <Loader2 className="size-3 animate-spin mr-1.5" />
                    Checking...
                  </>
                ) : submitting ? (
                  <>
                    <Loader2 className="size-3 animate-spin mr-1.5" />
                    Posting...
                  </>
                ) : (
                  "Post comment"
                )}
              </Button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  )
}
