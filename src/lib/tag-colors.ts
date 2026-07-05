import type { Tag } from "@/lib/supabase"

export const TAG_COLORS: Record<Tag, string> = {
  Code: "bg-blue-500/10 text-blue-400",
  Design: "bg-purple-500/10 text-purple-400",
  Music: "bg-pink-500/10 text-pink-400",
  Art: "bg-orange-500/10 text-orange-400",
  Writing: "bg-emerald-500/10 text-emerald-400",
  Game: "bg-yellow-500/10 text-yellow-400",
  Other: "bg-muted text-muted-foreground",
}
