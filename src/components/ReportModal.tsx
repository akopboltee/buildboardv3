import { useState } from "react"
import { TriangleAlert, Loader as Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { getOrCreateGuestId } from "@/lib/guest-id"

type ReportReason = "spam" | "harassment" | "hate_speech" | "inappropriate" | "misinformation" | "other"

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentType: "post" | "comment" | "user"
  contentId: string
  reportedUserId?: string
  onSuccess?: () => void
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam or misleading" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech or discrimination" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misinformation", label: "Misinformation" },
  { value: "other", label: "Other" },
]

export function ReportModal({
  open,
  onOpenChange,
  contentType,
  contentId,
  reportedUserId,
  onSuccess,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>("spam")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    const guestId = user ? null : getOrCreateGuestId()

    const reportData: Record<string, unknown> = {
      content_type: contentType,
      reason,
      description: description.trim() || null,
      status: "pending",
    }

    if (user) {
      reportData.reporter_id = user.id
    } else if (guestId) {
      reportData.reporter_guest_id = guestId
    }

    if (contentType === "post") {
      reportData.reported_post_id = contentId
    } else if (contentType === "comment") {
      reportData.reported_comment_id = contentId
    } else if (contentType === "user" && reportedUserId) {
      reportData.reported_user_id = reportedUserId
    }

    if (reportedUserId) {
      reportData.reported_user_id = reportedUserId
    }

    const { error: insertError } = await supabase
      .from("reports")
      .insert(reportData)

    if (insertError) {
      setError("Failed to submit report. Please try again.")
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)

    setTimeout(() => {
      setSuccess(false)
      setDescription("")
      setReason("spam")
      onOpenChange(false)
      onSuccess?.()
    }, 1500)
  }

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <div className="py-6 text-center">
            <div className="size-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
              <TriangleAlert className="size-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Report submitted</p>
            <p className="text-xs text-muted-foreground mt-1">
              Thank you for helping keep BuildBoard safe.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <TriangleAlert className="size-4 text-muted-foreground" />
            Report {contentType === "post" ? "post" : contentType === "comment" ? "comment" : "user"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Help us understand what's wrong with this content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Reason
            </Label>
            <div className="space-y-1.5">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors border",
                    reason === r.value
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:border-border/80"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Additional details (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more about the issue..."
              className="bg-transparent text-sm resize-none min-h-20"
              maxLength={500}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 h-9"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit report"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="h-9"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
