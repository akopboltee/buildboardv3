import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify superadmin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.role !== "superadmin") {
      return new Response(JSON.stringify({ error: "Forbidden: Superadmin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const body = await req.json().catch(() => ({}));

    // GET ACTIONS
    if (req.method === "GET") {
      if (action === "get-users") {
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const search = url.searchParams.get("search") || "";
        const offset = (page - 1) * limit;

        let query = supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, bio, created_at, role, is_banned, is_shadowbanned, warning_count, ban_until, banned_at, is_active", { count: "exact" });

        if (search) {
          query = query.or(`display_name.ilike.%${search}%,user_id.ilike.%${search}%`);
        }

        const { data: users, error, count } = await query
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ users, total: count, page, limit }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "get-posts") {
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const search = url.searchParams.get("search") || "";
        const status = url.searchParams.get("status") || "";
        const offset = (page - 1) * limit;

        let query = supabase
          .from("posts")
          .select("id, title, description, tag, author_name, user_id, created_at, is_hidden, is_deleted, is_shadowbanned, is_pinned, is_featured, flagged, toxicity_score, spam_score, moderation_decision, show_anonymous", { count: "exact" });

        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        if (status === "hidden") {
          query = query.eq("is_hidden", true);
        } else if (status === "deleted") {
          query = query.eq("is_deleted", true);
        } else if (status === "flagged") {
          query = query.eq("flagged", true);
        } else if (status === "visible") {
          query = query.eq("is_hidden", false).eq("is_deleted", false);
        }

        const { data: posts, error, count } = await query
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to fetch posts" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ posts, total: count, page, limit }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "get-reports") {
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const status = url.searchParams.get("status") || "pending";
        const offset = (page - 1) * limit;

        const { data: reports, error, count } = await supabase
          .from("reports")
          .select("id, content_type, reason, description, status, created_at, reporter_id, reporter_guest_id, reported_user_id, reported_post_id, reported_comment_id", { count: "exact" })
          .eq("status", status)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to fetch reports" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ reports, total: count, page, limit }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "get-logs") {
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "100");
        const offset = (page - 1) * limit;

        const { data: logs, error, count } = await supabase
          .from("moderation_logs")
          .select("id, admin_id, action, action_type, target_id, target_type, reason, metadata, created_at", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to fetch logs" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ logs, total: count, page, limit }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "get-analytics") {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const { count: totalPosts } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true });

        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const { count: pendingReports } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        const { count: bannedUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_banned", true);

        const { count: flaggedPosts } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("flagged", true);

        const { count: hiddenPosts } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("is_hidden", true);

        // Posts per day (last 30 days)
        const { data: dailyPosts } = await supabase.rpc("get_daily_post_counts");

        // Active users (users who posted in last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: activeUsersWeek } = await supabase
          .from("posts")
          .select("user_id", { count: "exact" })
          .gte("created_at", weekAgo)
          .not("user_id", "is", null);

        const uniqueWeekUsers = new Set(activeUsersWeek?.map(p => p.user_id) || []).size;

        return new Response(JSON.stringify({
          totalPosts: totalPosts || 0,
          totalUsers: totalUsers || 0,
          pendingReports: pendingReports || 0,
          bannedUsers: bannedUsers || 0,
          flaggedPosts: flaggedPosts || 0,
          hiddenPosts: hiddenPosts || 0,
          activeUsersWeek: uniqueWeekUsers,
          dailyPosts: dailyPosts || []
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "get-warnings") {
        const userId = url.searchParams.get("userId");
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: warnings, error } = await supabase
          .from("warnings")
          .select("id, reason, created_at, severity")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to fetch warnings" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ warnings }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "get-user-stats") {
        const userId = url.searchParams.get("userId");
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { count: postCount } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        const { count: commentCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        const { count: reportCount } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("reported_user_id", userId);

        const { data: warnings } = await supabase
          .from("warnings")
          .select("id, reason, created_at, severity")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        return new Response(JSON.stringify({
          postCount: postCount || 0,
          commentCount: commentCount || 0,
          reportCount: reportCount || 0,
          warnings: warnings || []
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // POST ACTIONS
    if (req.method === "POST") {
      const logAction = async (actionType: string, targetType: string, targetId: string, reason?: string, metadata?: Record<string, unknown>) => {
        await supabase.from("moderation_logs").insert({
          admin_id: user.id,
          action: actionType,
          action_type: actionType,
          target_id: targetId,
          target_type: targetType,
          reason: reason || null,
          metadata: metadata || null
        });
      };

      // BAN USER
      if (action === "ban-user") {
        const { userId, reason, duration } = body;
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: corsHeaders });
        }

        let banUntil = null;
        if (duration) {
          const now = new Date();
          if (duration === "1hour") banUntil = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
          else if (duration === "24hours") banUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
          else if (duration === "7days") banUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            is_banned: true,
            banned_at: new Date().toISOString(),
            banned_by: user.id,
            ban_until: banUntil
          })
          .eq("user_id", userId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to ban user" }), { status: 500, headers: corsHeaders });
        }

        await logAction("ban", "user", userId, reason, { duration, banUntil });

        // Revoke all sessions
        await supabase.auth.admin.signOut(userId, "global");

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // UNBAN USER
      if (action === "unban-user") {
        const { userId, reason } = body;
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            is_banned: false,
            banned_at: null,
            banned_by: null,
            ban_until: null
          })
          .eq("user_id", userId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to unban user" }), { status: 500, headers: corsHeaders });
        }

        await logAction("unban", "user", userId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // SHADOWBAN USER
      if (action === "shadowban-user") {
        const { userId, reason } = body;
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("profiles")
          .update({ is_shadowbanned: true })
          .eq("user_id", userId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to shadowban user" }), { status: 500, headers: corsHeaders });
        }

        // Shadowban all their posts
        await supabase
          .from("posts")
          .update({ is_shadowbanned: true })
          .eq("user_id", userId);

        await logAction("shadowban", "user", userId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // UNSHADOWBAN USER
      if (action === "unshadowban-user") {
        const { userId, reason } = body;
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("profiles")
          .update({ is_shadowbanned: false })
          .eq("user_id", userId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to unshadowban user" }), { status: 500, headers: corsHeaders });
        }

        // Unshadowban all their posts
        await supabase
          .from("posts")
          .update({ is_shadowbanned: false })
          .eq("user_id", userId);

        await logAction("unshadowban", "user", userId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ISSUE WARNING
      if (action === "warn-user") {
        const { userId, reason, severity } = body;
        if (!userId || !reason) {
          return new Response(JSON.stringify({ error: "userId and reason required" }), { status: 400, headers: corsHeaders });
        }

        // Add warning
        const { data: warning, error: warnError } = await supabase
          .from("warnings")
          .insert({
            user_id: userId,
            reason,
            severity: severity || 1,
            issued_by: user.id
          })
          .select()
          .single();

        if (warnError) {
          return new Response(JSON.stringify({ error: "Failed to issue warning" }), { status: 500, headers: corsHeaders });
        }

        // Get current warning count
        const { data: profile } = await supabase
          .from("profiles")
          .select("warning_count")
          .eq("user_id", userId)
          .single();

        const newWarningCount = (profile?.warning_count || 0) + 1;

        // Update warning count
        await supabase
          .from("profiles")
          .update({ warning_count: newWarningCount })
          .eq("user_id", userId);

        // Auto-ban at 3 warnings
        if (newWarningCount >= 3) {
          await supabase
            .from("profiles")
            .update({
              is_banned: true,
              banned_at: new Date().toISOString(),
              banned_by: user.id
            })
            .eq("user_id", userId);

          await logAction("ban", "user", userId, "Auto-banned: 3 warnings reached");
        }

        await logAction("warn", "user", userId, reason, { severity, warningId: warning.id });

        return new Response(JSON.stringify({ success: true, warningCount: newWarningCount, autoBanned: newWarningCount >= 3 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // DELETE POST
      if (action === "delete-post") {
        const { postId, reason } = body;
        if (!postId) {
          return new Response(JSON.stringify({ error: "postId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("posts")
          .update({
            is_deleted: true,
            is_hidden: true
          })
          .eq("id", postId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to delete post" }), { status: 500, headers: corsHeaders });
        }

        await logAction("delete", "post", postId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // RESTORE POST
      if (action === "restore-post") {
        const { postId, reason } = body;
        if (!postId) {
          return new Response(JSON.stringify({ error: "postId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("posts")
          .update({
            is_deleted: false,
            is_hidden: false
          })
          .eq("id", postId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to restore post" }), { status: 500, headers: corsHeaders });
        }

        await logAction("restore", "post", postId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // HIDE POST
      if (action === "hide-post") {
        const { postId, reason } = body;
        if (!postId) {
          return new Response(JSON.stringify({ error: "postId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("posts")
          .update({ is_hidden: true })
          .eq("id", postId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to hide post" }), { status: 500, headers: corsHeaders });
        }

        await logAction("hide", "post", postId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // UNHIDE POST
      if (action === "unhide-post") {
        const { postId, reason } = body;
        if (!postId) {
          return new Response(JSON.stringify({ error: "postId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("posts")
          .update({ is_hidden: false })
          .eq("id", postId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to unhide post" }), { status: 500, headers: corsHeaders });
        }

        await logAction("unhide", "post", postId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // PIN POST
      if (action === "pin-post") {
        const { postId, reason } = body;
        if (!postId) {
          return new Response(JSON.stringify({ error: "postId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("posts")
          .update({ is_pinned: true })
          .eq("id", postId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to pin post" }), { status: 500, headers: corsHeaders });
        }

        await logAction("pin", "post", postId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // UNPIN POST
      if (action === "unpin-post") {
        const { postId, reason } = body;
        if (!postId) {
          return new Response(JSON.stringify({ error: "postId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("posts")
          .update({ is_pinned: false })
          .eq("id", postId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to unpin post" }), { status: 500, headers: corsHeaders });
        }

        await logAction("unpin", "post", postId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // FEATURE POST
      if (action === "feature-post") {
        const { postId, reason } = body;
        if (!postId) {
          return new Response(JSON.stringify({ error: "postId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("posts")
          .update({ is_featured: true })
          .eq("id", postId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to feature post" }), { status: 500, headers: corsHeaders });
        }

        await logAction("feature", "post", postId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // UNFEATURE POST
      if (action === "unfeature-post") {
        const { postId, reason } = body;
        if (!postId) {
          return new Response(JSON.stringify({ error: "postId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("posts")
          .update({ is_featured: false })
          .eq("id", postId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to unfeature post" }), { status: 500, headers: corsHeaders });
        }

        await logAction("unfeature", "post", postId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // RESOLVE REPORT
      if (action === "resolve-report") {
        const { reportId, resolution } = body;
        if (!reportId) {
          return new Response(JSON.stringify({ error: "reportId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("reports")
          .update({ status: "resolved" })
          .eq("id", reportId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to resolve report" }), { status: 500, headers: corsHeaders });
        }

        await logAction("resolve_report", "report", reportId, resolution);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // DISMISS REPORT
      if (action === "dismiss-report") {
        const { reportId, reason } = body;
        if (!reportId) {
          return new Response(JSON.stringify({ error: "reportId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase
          .from("reports")
          .update({ status: "reviewed" })
          .eq("id", reportId);

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to dismiss report" }), { status: 500, headers: corsHeaders });
        }

        await logAction("dismiss_report", "report", reportId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // DELETE USER PERMANENTLY
      if (action === "delete-user") {
        const { userId, reason } = body;
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: corsHeaders });
        }

        // Delete user's posts
        await supabase.from("posts").delete().eq("user_id", userId);
        await supabase.from("comments").delete().eq("user_id", userId);
        await supabase.from("warnings").delete().eq("user_id", userId);
        await supabase.from("blocks").delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

        // Delete auth user
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

        if (deleteError) {
          return new Response(JSON.stringify({ error: "Failed to delete user" }), { status: 500, headers: corsHeaders });
        }

        await logAction("delete_user", "user", userId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // REVOKE SESSIONS
      if (action === "revoke-sessions") {
        const { userId, reason } = body;
        if (!userId) {
          return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: corsHeaders });
        }

        const { error } = await supabase.auth.admin.signOut(userId, "global");

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to revoke sessions" }), { status: 500, headers: corsHeaders });
        }

        await logAction("revoke_sessions", "user", userId, reason);

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin action error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
