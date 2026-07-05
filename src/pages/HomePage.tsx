import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { PostCard } from "@/components/PostCard"
import { supabase, TAGS, type Post, type Tag } from "@/lib/supabase"
import { TAG_COLORS } from "@/lib/tag-colors"
import { cn } from "@/lib/utils"

// Fake stats that update every 30 minutes
function useFakeStats() {
  const [stats, setStats] = useState(() => {
    const stored = localStorage.getItem("bb_fake_stats")
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
        return parsed.data
      }
    }
    return {
      builders: 1247 + Math.floor(Math.random() * 50),
      updates: 8291 + Math.floor(Math.random() * 200),
      projects: 247 + Math.floor(Math.random() * 20),
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev: { builders: number; updates: number; projects: number }) => {
        const next = {
          builders: prev.builders + Math.floor(Math.random() * 10) - 5,
          updates: prev.updates + Math.floor(Math.random() * 30) - 15,
          projects: prev.projects + Math.floor(Math.random() * 4) - 2,
        }
        localStorage.setItem("bb_fake_stats", JSON.stringify({ data: next, timestamp: Date.now() }))
        return next
      })
    }, 30 * 60 * 1000)

    localStorage.setItem("bb_fake_stats", JSON.stringify({ data: stats, timestamp: Date.now() }))
    return () => clearInterval(interval)
  }, [])

  return stats
}

export function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState<Tag | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fakeStats = useFakeStats()

  const fetchPosts = useCallback(async () => {
    let query = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })

    if (activeTag) {
      query = query.eq("tag", activeTag)
    }

    const { data: postsData, error } = await query

    if (error || !postsData) return

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
    setLastRefresh(new Date())
    setLoading(false)
  }, [activeTag])

  useEffect(() => {
    setLoading(true)
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts()
    }, 30_000)
    return () => clearInterval(interval)
  }, [fetchPosts])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex">
        {/* Left Sidebar - Desktop */}
        <aside className="hidden md:block w-[160px] shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="p-3 space-y-4">
            {/* Tag Filters */}
            <div className="space-y-1">
              <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Filter</h2>
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveTag(null)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                    activeTag === null
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  All
                </button>
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                      activeTag === tag
                        ? `${TAG_COLORS[tag]} ring-1 ring-current/20`
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Share Button */}
            <Link to="/submit" className="block">
              <Button className="w-full gap-1.5 h-8 text-xs">
                <Plus className="size-3.5" />
                Share
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 py-5">
          {/* Mobile Tag Filter */}
          <div className="md:hidden mb-3 overflow-x-auto pb-2">
            <div className="flex items-center gap-1.5 flex-nowrap">
              <button
                onClick={() => setActiveTag(null)}
                className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors",
                  activeTag === null
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors",
                    activeTag === tag
                      ? `${TAG_COLORS[tag]} ring-1 ring-current/20`
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="mb-4 max-w-[720px]">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-lg font-bold tracking-tight">Live Feed</h1>
              <button
                onClick={fetchPosts}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="size-3" />
                <span>
                  {lastRefresh.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </button>
            </div>
            {/* Fake Stats */}
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span><strong className="text-foreground">{fakeStats.builders.toLocaleString()}</strong> builders</span>
              <span><strong className="text-foreground">{fakeStats.updates.toLocaleString()}</strong> updates</span>
              <span><strong className="text-foreground">{fakeStats.projects.toLocaleString()}</strong> projects active</span>
            </div>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-2 max-w-[720px]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                  <Skeleton className="h-3 w-12 rounded-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 max-w-[720px]">
              <p className="text-muted-foreground text-sm">No posts yet.</p>
              <Link to="/submit">
                <Button variant="outline" size="sm" className="mt-4">
                  Be the first to share
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5 max-w-[720px]">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
