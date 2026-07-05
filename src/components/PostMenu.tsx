import { useState } from "react"
import { Flag, Ban } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { ReportModal } from "@/components/ReportModal"

interface PostMenuProps {
  postId: string
  userId?: string | null
  onBlock?: () => void
}

export function PostMenu({ postId, userId, onBlock }: PostMenuProps) {
  const [reportOpen, setReportOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-2 text-xs cursor-pointer"
          >
            <Flag className="size-3" />
            Report post
          </DropdownMenuItem>
          {userId && onBlock && (
            <DropdownMenuItem
              onClick={onBlock}
              className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground"
            >
              <Ban className="size-3" />
              Block user
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        contentType="post"
        contentId={postId}
        reportedUserId={userId ?? undefined}
      />
    </>
  )
}
