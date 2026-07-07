import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, X, Image as ImageIcon, Loader as Loader2, Clock, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { supabase, TAGS, type Tag, type Project } from "@/lib/supabase"
import { TAG_COLORS } from "@/lib/tag-colors"
import { useAuth } from "@/hooks/use-auth"
import { useRateLimit, formatRateLimitMessage } from "@/hooks/use-rate-limit"
import { sanitizeTitle, sanitizeDescription } from "@/lib/sanitize"
import { uploadMedia, validateMediaFile } from "@/lib/media-upload"
import { getOrCreateGuestId } from "@/lib/guest-id"
import { cn } from "@/lib/utils"

export function SubmitPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, displayName } = useAuth()
  const { limited: rateLimited, getTimeUntilReset, checkRateLimit } = useRateLimit()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tag, setTag] = useState<Tag>("Code")
  const [authorName, setAuthorName] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [moderationModalOpen, setModerationModalOpen] = useState(false)

  // Projects
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")

  // Validation states
  const [titleError, setTitleError] = useState<string | null>(null)
  const [descError, setDescError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check rate limit on mount
  useEffect(() => {
    checkRateLimit("post")
  }, [checkRateLimit])

  useEffect(() => {
    if (displayName) setAuthorName(displayName)
  }, [displayName])

  // Fetch user's projects
  useEffect(() => {
    if (!user) return
    const preselectedProject = searchParams.get("project")
    supabase
      .from("projects")
      .select("id, title")
      .eq("user_id", user.id)
      .order("title")
      .then(({ data }) => {
        if (data) {
          setProjects(data as Project[])
          if (preselectedProject && data.some(p => p.id === preselectedProject)) {
            setSelectedProjectId(preselectedProject)
          }
        }
      })
  }, [user, searchParams])

  // Validation on change
  useEffect(() => {
    if (title) {
      const result = sanitizeTitle(title)
      setTitleError(result.valid ? null : (result.error ?? null))
    } else {
      setTitleError(null)
    }
  }, [title])

  useEffect(() => {
    if (description) {
      const result = sanitizeDescription(description)
      setDescError(result.valid ? null : (result.error ?? null))
    } else {
      setDescError(null)
    }
  }, [description])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setMediaError(null)

    // Validate file
    const validation = await validateMediaFile(file)
    if (!validation.valid) {
      setMediaError(validation.error ?? "Invalid file")
      return
    }

    setMediaFile(file)
    setMediaPreview(URL.createObjectURL(file))
  }

  function removeMedia() {
    setMediaFile(null)
    if (mediaPreview) URL.revokeObjectURL(mediaPreview)
    setMediaPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Immediate feedback
    setValidating(true)
    setError(null)

    // Validate
    const titleResult = sanitizeTitle(title)
    if (!titleResult.valid) {
      setTitleError(titleResult.error ?? null)
      setValidating(false)
      return
    }

    const descResult = sanitizeDescription(description)

    if (rateLimited) {
      setError(formatRateLimitMessage("post", getTimeUntilReset()))
      setValidating(false)
      return
    }

    // Check rate limit again
    const rateCheck = await checkRateLimit("post")
    if (!rateCheck.allowed) {
      setError(formatRateLimitMessage("post", getTimeUntilReset()))
      setValidating(false)
      return
    }

    // Moderate content (text + image if present)
    const contentToModerate = `${title}${description ? ` ${description}` : ""}`
    const { data: { session } } = await supabase.auth.getSession()

    let imageData: string | null = null
    if (mediaFile) {
      // Convert file to base64 data URL for moderation
      imageData = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(mediaFile)
      })
    }

    const modRes = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/moderate-content`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ content: contentToModerate, imageData }),
      }
    )
    const modResult = await modRes.json()

    if (!modResult.allowed) {
      setModerationModalOpen(true)
      setValidating(false)
      return
    }

    setSubmitting(true)
    setValidating(false)

    let mediaUrl: string | null = null

    // Get identifier for upload (user_id or guest_id)
    const identifier = user?.id || getOrCreateGuestId()

    if (mediaFile) {
      const uploadResult = await uploadMedia(mediaFile, identifier, "posts")
      if (!uploadResult.success) {
        setError(uploadResult.error ?? "Failed to upload media")
        setSubmitting(false)
        return
      }
      mediaUrl = uploadResult.url ?? null
    }

    // Get user's privacy preference
    let showAnonymous = false
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("show_real_name, default_anonymous")
        .eq("user_id", user.id)
        .maybeSingle()

      // Only use anonymous if profile exists and explicitly set to anonymous
      showAnonymous = profile?.default_anonymous === true
    }

    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({
        title: titleResult.value,
        description: descResult.value,
        media_url: mediaUrl,
        tag,
        author_name: showAnonymous ? null : (authorName.trim() || null),
        user_id: user?.id ?? null,
        show_anonymous: showAnonymous,
        guest_id: user ? null : identifier,
        flagged: modResult.flagged || false,
        project_id: selectedProjectId || null,
      })
      .select()
      .single()

    if (insertError || !data) {
      console.error("Insert error:", insertError)
      setError("Failed to submit. Please try again.")
      setSubmitting(false)
      return
    }

    navigate(`/post/${data.id}`)
  }

  const isVideo = mediaFile?.type.startsWith("video/")
  const isValid = title.trim() && !titleError && !descError && !mediaError && !rateLimited

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8 flex-1 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-3" />
          Feed
        </Link>

        <div className="mb-7">
          <h1 className="text-xl font-semibold tracking-tight">Share what you're building</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user ? "Share your latest project with the community." : "No account needed. Just share your work."}
          </p>
        </div>

        {rateLimited && (
          <div className="mb-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 flex items-start gap-3">
            <Clock className="size-4 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-yellow-500 font-medium">Rate limit reached</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRateLimitMessage("post", getTimeUntilReset())}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-xs font-medium text-foreground uppercase tracking-wider">
                What are you working on? <span className="text-destructive">*</span>
              </Label>
              <span className={`text-xs tabular-nums transition-colors ${title.length >= 90 ? "text-destructive" : "text-muted-foreground/40"}`}>
                {title.length}/100
              </span>
            </div>
            <Input
              id="title"
              placeholder="e.g. Building a Rust compiler frontend"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(
                "bg-transparent h-10 text-sm",
                titleError && "border-destructive"
              )}
              maxLength={100}
              required
            />
            {titleError && <p className="text-xs text-destructive">{titleError}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-xs font-medium text-foreground uppercase tracking-wider">
                More detail (optional)
              </Label>
              <span className={`text-xs tabular-nums transition-colors ${description.length >= 900 ? "text-destructive" : "text-muted-foreground/40"}`}>
                {description.length}/1000
              </span>
            </div>
            <Textarea
              id="description"
              placeholder="Share more about what you're making, what stage you're at, or what's interesting about it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(
                "bg-transparent text-sm resize-none min-h-24",
                descError && "border-destructive"
              )}
              maxLength={1000}
            />
            {descError && <p className="text-xs text-destructive">{descError}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground uppercase tracking-wider">
              Tag <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                    tag === t
                      ? `${TAG_COLORS[t]} border-current/20 ring-1 ring-current/20`
                      : "border-border text-foreground/70 hover:border-border hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {projects.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground uppercase tracking-wider">
                Project (optional)
              </Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="h-9 text-sm bg-transparent">
                  <SelectValue placeholder="Add to a project..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-1.5">
                        <FolderOpen className="size-3" />
                        {p.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground uppercase tracking-wider">
              Media (optional)
            </Label>
            {mediaPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                {isVideo ? (
                  <video src={mediaPreview} className="w-full max-h-64 object-contain bg-black" controls />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-contain" />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 size-6 rounded-full bg-background/80 border border-border/50 flex items-center justify-center hover:bg-background transition-colors"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-border rounded-lg py-8 flex flex-col items-center gap-2 text-foreground/70 hover:border-foreground/50 hover:text-foreground transition-colors"
              >
                <ImageIcon className="size-5" />
                <span className="text-xs">Click to upload image or video</span>
                <span className="text-xs text-muted-foreground/60">Images: 10MB max | Videos: 50MB max</span>
              </button>
            )}
            {mediaError && <p className="text-xs text-destructive">{mediaError}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author" className="text-xs font-medium text-foreground uppercase tracking-wider">
              Your name (optional)
            </Label>
            <Input
              id="author"
              placeholder="Anonymous"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="bg-transparent h-10 text-sm"
              maxLength={64}
              readOnly={!!user}
            />
            {user && (
              <p className="text-xs text-muted-foreground">Posting as your account</p>
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting || validating || !isValid}
              className="h-9 text-sm"
            >
              {validating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-2" />
                  Validating...
                </>
              ) : submitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-2" />
                  Publishing...
                </>
              ) : (
                "Publish to feed"
              )}
            </Button>
            <Link to="/">
              <Button type="button" variant="ghost" size="sm" className="h-9 text-sm text-muted-foreground">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
      <Footer />

      <AlertDialog open={moderationModalOpen} onOpenChange={setModerationModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Content Blocked</AlertDialogTitle>
            <AlertDialogDescription>
              This post contains inappropriate content. Please make a new appropriate post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setModerationModalOpen(false)}>
              Okay, Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
