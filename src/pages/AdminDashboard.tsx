import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Users, FileText, Flag, ChartBar as BarChart3, History, Search, Shield, Eye, EyeOff, Trash2, TriangleAlert as AlertCircle, ChevronLeft, ChevronRight, Ban, Check, X, RefreshCw, Pin, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface AdminUser {
  user_id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  role: string
  is_banned: boolean
  is_shadowbanned: boolean
  warning_count: number
  ban_until: string | null
  banned_at: string | null
  is_active: boolean
}

interface AdminPost {
  id: string
  title: string
  description: string | null
  tag: string
  author_name: string | null
  user_id: string | null
  created_at: string
  is_hidden: boolean
  is_deleted: boolean
  is_shadowbanned: boolean
  is_pinned: boolean
  is_featured: boolean
  flagged: boolean
  toxicity_score: number
  spam_score: number
  moderation_decision: string | null
  show_anonymous: boolean
}

interface AdminReport {
  id: string
  content_type: string
  reason: string
  description: string | null
  status: string
  created_at: string
  reporter_id: string | null
  reporter_guest_id: string | null
  reported_user_id: string | null
  reported_post_id: string | null
  reported_comment_id: string | null
}

interface ModerationLog {
  id: string
  admin_id: string
  action: string
  action_type: string
  target_id: string
  target_type: string
  reason: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

interface Analytics {
  totalPosts: number
  totalUsers: number
  pendingReports: number
  bannedUsers: number
  flaggedPosts: number
  hiddenPosts: number
  activeUsersWeek: number
  dailyPosts: { date: string; count: number }[]
}

type TabType = "users" | "posts" | "reports" | "analytics" | "logs"

const ITEMS_PER_PAGE = 20

export function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("users")

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [usersSearch, setUsersSearch] = useState("")

  // Posts state
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [postsTotal, setPostsTotal] = useState(0)
  const [postsPage, setPostsPage] = useState(1)
  const [postsSearch, setPostsSearch] = useState("")
  const [postsStatus, setPostsStatus] = useState("")

  // Reports state
  const [reports, setReports] = useState<AdminReport[]>([])
  const [reportsTotal, setReportsTotal] = useState(0)
  const [reportsPage, setReportsPage] = useState(1)
  const [reportsStatus, setReportsStatus] = useState("pending")

  // Logs state
  const [logs, setLogs] = useState<ModerationLog[]>([])
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsPage, setLogsPage] = useState(1)

  // Analytics state
  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  // Action state
  const [actionLoading, setActionLoading] = useState(false)
  const [actionModal, setActionModal] = useState<{
    type: string
    target: AdminUser | AdminPost | AdminReport | null
    open: boolean
  }>({ type: "", target: null, open: false })
  const [actionReason, setActionReason] = useState("")
  const [actionDuration, setActionDuration] = useState("")

  // Check admin access
  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        navigate("/")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single()

      if (!profile || profile.role !== "superadmin") {
        navigate("/")
        return
      }

      setIsAdmin(true)
      setLoading(false)
    }

    checkAdmin()
  }, [user, navigate])

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!user) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const params = new URLSearchParams({
      action: "get-users",
      page: usersPage.toString(),
      limit: ITEMS_PER_PAGE.toString(),
    })
    if (usersSearch) params.set("search", usersSearch)

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-actions?${params}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      }
    )
    const data = await res.json()
    setUsers(data.users || [])
    setUsersTotal(data.total || 0)
  }, [user, usersPage, usersSearch])

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    if (!user) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const params = new URLSearchParams({
      action: "get-posts",
      page: postsPage.toString(),
      limit: ITEMS_PER_PAGE.toString(),
    })
    if (postsSearch) params.set("search", postsSearch)
    if (postsStatus) params.set("status", postsStatus)

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-actions?${params}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      }
    )
    const data = await res.json()
    setPosts(data.posts || [])
    setPostsTotal(data.total || 0)
  }, [user, postsPage, postsSearch, postsStatus])

  // Fetch reports
  const fetchReports = useCallback(async () => {
    if (!user) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const params = new URLSearchParams({
      action: "get-reports",
      page: reportsPage.toString(),
      limit: ITEMS_PER_PAGE.toString(),
      status: reportsStatus,
    })

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-actions?${params}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      }
    )
    const data = await res.json()
    setReports(data.reports || [])
    setReportsTotal(data.total || 0)
  }, [user, reportsPage, reportsStatus])

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    if (!user) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const params = new URLSearchParams({
      action: "get-logs",
      page: logsPage.toString(),
      limit: ITEMS_PER_PAGE.toString(),
    })

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-actions?${params}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      }
    )
    const data = await res.json()
    setLogs(data.logs || [])
    setLogsTotal(data.total || 0)
  }, [user, logsPage])

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    if (!user) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-actions?action=get-analytics`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      }
    )
    const data = await res.json()
    setAnalytics(data)
  }, [user])

  // Load data on tab change
  useEffect(() => {
    if (!isAdmin) return

    if (activeTab === "users") fetchUsers()
    else if (activeTab === "posts") fetchPosts()
    else if (activeTab === "reports") fetchReports()
    else if (activeTab === "logs") fetchLogs()
    else if (activeTab === "analytics") fetchAnalytics()
  }, [isAdmin, activeTab, fetchUsers, fetchPosts, fetchReports, fetchLogs, fetchAnalytics])

  // Admin action handler
  const executeAction = async () => {
    if (!user || !actionModal.target) return
    setActionLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setActionLoading(false)
      return
    }

    const body: Record<string, unknown> = {}
    if (actionModal.type.includes("user")) {
      body.userId = (actionModal.target as AdminUser).user_id
    } else if (actionModal.type.includes("post")) {
      body.postId = (actionModal.target as AdminPost).id
    } else if (actionModal.type.includes("report")) {
      body.reportId = (actionModal.target as AdminReport).id
    }
    if (actionReason) body.reason = actionReason
    if (actionDuration) body.duration = actionDuration

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-actions?action=${actionModal.type}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(body),
        }
      )

      if (res.ok) {
        // Refresh current data
        if (activeTab === "users") fetchUsers()
        else if (activeTab === "posts") fetchPosts()
        else if (activeTab === "reports") fetchReports()
        else if (activeTab === "logs") fetchLogs()
      }
    } catch (err) {
      console.error("Action failed:", err)
    }

    setActionLoading(false)
    setActionModal({ type: "", target: null, open: false })
    setActionReason("")
    setActionDuration("")
  }

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Shield className="size-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
        <Link to="/" className="mt-4">
          <Button>Go Home</Button>
        </Link>
      </div>
    )
  }

  const totalPages = (total: number) => Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-3" />
          Back to feed
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="size-6 text-foreground" />
          <h1 className="text-xl font-semibold tracking-tight">Admin Dashboard</h1>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="size-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-1.5">
              <FileText className="size-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5">
              <Flag className="size-4" />
              Reports
              {analytics && analytics.pendingReports > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">
                  {analytics.pendingReports}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5">
              <BarChart3 className="size-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-1.5">
              <History className="size-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={usersSearch}
                  onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1) }}
                  className="pl-9 h-9"
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-1.5">
                <RefreshCw className="size-3.5" />
                Refresh
              </Button>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Warnings</th>
                    <th className="text-left p-3 font-medium">Created</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="size-8 rounded-full object-cover" />
                          ) : (
                            <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                              <Users className="size-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{u.display_name || "Anonymous"}</p>
                            <p className="text-xs text-muted-foreground font-mono">{u.user_id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {u.role === "superadmin" && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">Admin</Badge>
                          )}
                          {u.is_banned && <Badge variant="destructive">Banned</Badge>}
                          {u.is_shadowbanned && <Badge variant="outline" className="text-orange-600 border-orange-600">Shadowban</Badge>}
                          {!u.is_banned && !u.is_shadowbanned && u.is_active && (
                            <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                          )}
                          {u.ban_until && (
                            <Badge variant="outline" className="text-xs">Until {new Date(u.ban_until).toLocaleDateString()}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={cn(
                          "font-medium",
                          u.warning_count >= 3 && "text-destructive",
                          u.warning_count >= 2 && "text-orange-500"
                        )}>
                          {u.warning_count}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          {!u.is_banned ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive"
                              onClick={() => setActionModal({ type: "ban-user", target: u, open: true })}
                            >
                              <Ban className="size-3 mr-1" /> Ban
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-green-600 hover:text-green-600"
                              onClick={() => setActionModal({ type: "unban-user", target: u, open: true })}
                            >
                              <Check className="size-3 mr-1" /> Unban
                            </Button>
                          )}
                          {!u.is_shadowbanned ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setActionModal({ type: "shadowban-user", target: u, open: true })}
                            >
                              <EyeOff className="size-3 mr-1" /> Shadow
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setActionModal({ type: "unshadowban-user", target: u, open: true })}
                            >
                              <Eye className="size-3 mr-1" /> Unshadow
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setActionModal({ type: "warn-user", target: u, open: true })}
                          >
                            <AlertCircle className="size-3 mr-1" /> Warn
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {usersTotal > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(usersPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(usersPage * ITEMS_PER_PAGE, usersTotal)} of {usersTotal}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={usersPage === 1}
                    onClick={() => setUsersPage(p => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={usersPage >= totalPages(usersTotal)}
                    onClick={() => setUsersPage(p => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={postsSearch}
                  onChange={(e) => { setPostsSearch(e.target.value); setPostsPage(1) }}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={postsStatus} onValueChange={(v) => { setPostsStatus(v); setPostsPage(1) }}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="All posts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All posts</SelectItem>
                  <SelectItem value="visible">Visible</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchPosts} className="gap-1.5">
                <RefreshCw className="size-3.5" />
                Refresh
              </Button>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Post</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Scores</th>
                    <th className="text-left p-3 font-medium">Created</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-3">
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{p.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.description || "No description"}</p>
                          <p className="text-xs text-muted-foreground mt-1">by {p.author_name || "Anonymous"}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {p.is_deleted && <Badge variant="destructive">Deleted</Badge>}
                          {p.is_hidden && !p.is_deleted && <Badge variant="outline">Hidden</Badge>}
                          {p.is_pinned && <Badge variant="outline" className="text-blue-600 border-blue-600">Pinned</Badge>}
                          {p.is_featured && <Badge variant="outline" className="text-yellow-600 border-yellow-600">Featured</Badge>}
                          {p.flagged && <Badge variant="outline" className="text-orange-600 border-orange-600">Flagged</Badge>}
                          {!p.is_deleted && !p.is_hidden && !p.flagged && (
                            <Badge variant="outline" className="text-green-600 border-green-600">Visible</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs">
                          <p>Toxicity: <span className={cn(p.toxicity_score >= 70 && "text-destructive font-medium")}>{p.toxicity_score}</span></p>
                          <p>Spam: <span className={cn(p.spam_score >= 70 && "text-orange-500 font-medium")}>{p.spam_score}</span></p>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          {!p.is_deleted ? (
                            <>
                              {!p.is_hidden ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setActionModal({ type: "hide-post", target: p, open: true })}
                                >
                                  <EyeOff className="size-3" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setActionModal({ type: "unhide-post", target: p, open: true })}
                                >
                                  <Eye className="size-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setActionModal({ type: "delete-post", target: p, open: true })}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                              {!p.is_pinned ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setActionModal({ type: "pin-post", target: p, open: true })}
                                >
                                  <Pin className="size-3" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setActionModal({ type: "unpin-post", target: p, open: true })}
                                >
                                  <Pin className="size-3 text-muted-foreground" />
                                </Button>
                              )}
                              {!p.is_featured ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setActionModal({ type: "feature-post", target: p, open: true })}
                                >
                                  <Star className="size-3" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setActionModal({ type: "unfeature-post", target: p, open: true })}
                                >
                                  <Star className="size-3 text-yellow-500" />
                                </Button>
                              )}
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-green-600 hover:text-green-600"
                              onClick={() => setActionModal({ type: "restore-post", target: p, open: true })}
                            >
                              <RefreshCw className="size-3 mr-1" /> Restore
                            </Button>
                          )}
                          <Link to={`/post/${p.id}`} target="_blank">
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              View
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {postsTotal > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(postsPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(postsPage * ITEMS_PER_PAGE, postsTotal)} of {postsTotal}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={postsPage === 1}
                    onClick={() => setPostsPage(p => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={postsPage >= totalPages(postsTotal)}
                    onClick={() => setPostsPage(p => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="flex items-center gap-3 mb-4">
              <Select value={reportsStatus} onValueChange={(v) => { setReportsStatus(v); setReportsPage(1) }}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchReports} className="gap-1.5">
                <RefreshCw className="size-3.5" />
                Refresh
              </Button>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Reason</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Created</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-3">
                        <Badge variant="outline">{r.content_type}</Badge>
                      </td>
                      <td className="p-3 capitalize">{r.reason.replace("_", " ")}</td>
                      <td className="p-3 max-w-xs truncate text-muted-foreground">
                        {r.description || "No description"}
                      </td>
                      <td className="p-3">
                        <Badge variant={r.status === "pending" ? "destructive" : r.status === "resolved" ? "outline" : "secondary"}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          {r.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-green-600 hover:text-green-600"
                                onClick={() => setActionModal({ type: "resolve-report", target: r, open: true })}
                              >
                                <Check className="size-3 mr-1" /> Resolve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setActionModal({ type: "dismiss-report", target: r, open: true })}
                              >
                                <X className="size-3 mr-1" /> Dismiss
                              </Button>
                            </>
                          )}
                          {r.reported_post_id && (
                            <Link to={`/post/${r.reported_post_id}`} target="_blank">
                              <Button variant="ghost" size="sm" className="h-7 text-xs">View Post</Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reportsTotal > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(reportsPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(reportsPage * ITEMS_PER_PAGE, reportsTotal)} of {reportsTotal}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reportsPage === 1}
                    onClick={() => setReportsPage(p => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reportsPage >= totalPages(reportsTotal)}
                    onClick={() => setReportsPage(p => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {analytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">Total Posts</p>
                    <p className="text-2xl font-bold">{analytics.totalPosts.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">Active (7d)</p>
                    <p className="text-2xl font-bold">{analytics.activeUsersWeek.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">Pending Reports</p>
                    <p className="text-2xl font-bold text-destructive">{analytics.pendingReports.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">Banned Users</p>
                    <p className="text-2xl font-bold">{analytics.bannedUsers.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">Flagged Posts</p>
                    <p className="text-2xl font-bold text-orange-500">{analytics.flaggedPosts.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">Hidden Posts</p>
                    <p className="text-2xl font-bold">{analytics.hiddenPosts.toLocaleString()}</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={fetchAnalytics} className="gap-1.5">
                  <RefreshCw className="size-3.5" />
                  Refresh Stats
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Recent moderation actions</p>
              <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-1.5">
                <RefreshCw className="size-3.5" />
                Refresh
              </Button>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Action</th>
                    <th className="text-left p-3 font-medium">Target</th>
                    <th className="text-left p-3 font-medium">Reason</th>
                    <th className="text-left p-3 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{l.action_type}</Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <Badge variant="secondary" className="text-xs">{l.target_type}</Badge>
                          <p className="text-xs text-muted-foreground font-mono mt-1">{l.target_id?.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="p-3 max-w-xs truncate text-muted-foreground">
                        {l.reason || "—"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3" />
                          {new Date(l.created_at).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {logsTotal > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(logsPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(logsPage * ITEMS_PER_PAGE, logsTotal)} of {logsTotal}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logsPage === 1}
                    onClick={() => setLogsPage(p => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logsPage >= totalPages(logsTotal)}
                    onClick={() => setLogsPage(p => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Confirmation Modal */}
        <AlertDialog open={actionModal.open} onOpenChange={(open) => setActionModal({ ...actionModal, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirm {actionModal.type.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionModal.type === "ban-user" && "This user will be banned and all their sessions will be revoked."}
                {actionModal.type === "shadowban-user" && "This user's posts will be hidden from the public feed. They can still post but only they will see their content."}
                {actionModal.type === "warn-user" && "Issue a warning to this user. After 3 warnings, they will be automatically banned."}
                {actionModal.type === "delete-post" && "This will hide the post from view. It can be restored later."}
                {actionModal.type === "hide-post" && "Hide this post from the public feed."}
                {actionModal.type === "pin-post" && "Pin this post to appear at the top of the feed."}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-3 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Reason (optional)</Label>
                <Textarea
                  placeholder="Enter reason for this action..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="min-h-20 text-sm"
                />
              </div>

              {actionModal.type === "ban-user" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Duration (optional)</Label>
                  <Select value={actionDuration} onValueChange={setActionDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Permanent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Permanent</SelectItem>
                      <SelectItem value="1hour">1 Hour</SelectItem>
                      <SelectItem value="24hours">24 Hours</SelectItem>
                      <SelectItem value="7days">7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setActionReason(""); setActionDuration("") }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={executeAction}
                disabled={actionLoading}
                className={cn(actionModal.type.includes("ban") || actionModal.type.includes("delete") ? "bg-destructive hover:bg-destructive/90" : "")}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <Footer />
    </div>
  )
}
