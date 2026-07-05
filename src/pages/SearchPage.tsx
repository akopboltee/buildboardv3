import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { ArrowLeft, Search as SearchIcon, Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { PostCard } from "@/components/PostCard"
import { ProfileModal } from "@/components/ProfileModal"
import { supabase, type Post, type Profile } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

type SearchTab = "posts" | "people"

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const tab = (searchParams.get("tab") as SearchTab) || "posts"
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState(query)
  const [posts, setPosts] = useState<Post[]>([])
  const [people, setPeople] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set())

  // Load blocked users
  useEffect(() => {
    if (!user) return

    supabase
      .from("blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id)
      .then(({ data }) => {
        if (data) {
          setBlockedIds(new Set(data.map((b) => b.blocked_id)))
        }
      })
  }, [user])

  // Search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setPosts([])
      setPeople([])
      return
    }

    performSearch(query)
  }, [query, tab])

  async function performSearch(searchQuery: string) {
    setLoading(true)

    const searchTerms = searchQuery.trim().split(/\s+/).join(" & ")

    if (tab === "posts") {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .textSearch("title", searchTerms, { type: "websearch", config: "english" })
        .order("created_at", { ascending: false })
        .limit(50)

      if (!error && data) {
        // Filter out blocked users
        const filtered = data.filter((p) => !blockedIds.has(p.user_id || ""))

        // Get comment counts
        const postIds = filtered.map((p) => p.id)
        const { data: commentCounts } = await supabase
          .from("comments")
          .select("post_id")
          .in("post_id", postIds)

        const countMap: Record<string, number> = {}
        commentCounts?.forEach((c) => {
          countMap[c.post_id] = (countMap[c.post_id] ?? 0) + 1
        })

        setPosts(
          filtered.map((p) => ({
            ...p,
            comment_count: countMap[p.id] ?? 0,
          }))
        )
      }
    } else {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .textSearch("display_name", searchTerms, { type: "websearch", config: "english" })
        .eq("profile_public", true)
        .limit(30)

      if (!error && data) {
        // Filter out blocked users
        const filtered = data.filter((p) => !blockedIds.has(p.user_id))
        setPeople(filtered)
      }
    }

    setLoading(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchParams({ q: searchQuery.trim(), tab })
  }

  function switchTab(newTab: SearchTab) {
    setSearchParams({ q: query, tab: newTab })
  }

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

        <h1 className="text-xl font-semibold tracking-tight mb-6">Search</h1>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts or people..."
              className="pl-9 h-10 bg-transparent"
            />
          </div>
          <Button type="submit" disabled={!searchQuery.trim()}>
            Search
          </Button>
        </form>

        {/* Tabs */}
        {query && (
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => switchTab("posts")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm transition-colors border-b-2",
                tab === "posts"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="size-4" />
              Posts
            </button>
            <button
              onClick={() => switchTab("people")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm transition-colors border-b-2",
                tab === "people"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="size-4" />
              People
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-5 space-y-3">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : query ? (
          tab === "posts" ? (
            posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">No posts found for "{query}"</p>
              </div>
            ) : (
              <div className="space-y-2 max-w-[720px]">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )
          ) : (
            people.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">No people found for "{query}"</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {people.map((profile) => (
                  <PeopleResult key={profile.id} profile={profile} />
                ))}
              </div>
            )
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Enter a search term to find posts and people</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function PeopleResult({ profile }: { profile: Profile }) {
  const [modalOpen, setModalOpen] = useState(false)

  const displayName = profile.display_name || "Anonymous"
  const avatarUrl = profile.avatar_url

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="w-full text-left border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors flex items-center gap-4"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <div className="size-12 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">
              {displayName.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="font-medium text-foreground">{displayName}</p>
          {profile.bio && (
            <p className="text-sm text-muted-foreground line-clamp-1">{profile.bio}</p>
          )}
        </div>
      </button>

      <ProfileModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        profile={profile}
      />
    </>
  )
}
