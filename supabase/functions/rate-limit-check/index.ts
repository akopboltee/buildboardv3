import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  post_guest: { max: 4, windowMs: 60 * 60 * 1000 }, // 4 per hour for guests
  post_user: { max: 12, windowMs: 60 * 60 * 1000 }, // 12 per hour for logged in users
  comment: { max: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour for both
  ai_explain: { max: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour per IP
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { action, identifier, isAuthenticated } = await req.json();

    if (!identifier) {
      return new Response(JSON.stringify({ error: "Identifier required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine which limit to use
    let limitKey = action;
    if (action === "post") {
      limitKey = isAuthenticated ? "post_user" : "post_guest";
    }

    const limit = LIMITS[limitKey];
    if (!limit) {
      return new Response(JSON.stringify({ error: "Invalid action type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    const windowStart = new Date(now.getTime() - limit.windowMs);

    // Get current count for this window
    const { data: existing } = await supabase
      .from("rate_limits")
      .select("id, request_count, window_start")
      .eq("identifier", identifier)
      .eq("action_type", action)
      .gte("window_start", windowStart.toISOString())
      .order("window_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    let count = existing?.request_count || 0;
    let resetAt: string;

    if (existing) {
      // Calculate reset time based on when this window started + 1 hour
      const windowStartTime = new Date(existing.window_start);
      resetAt = new Date(windowStartTime.getTime() + limit.windowMs).toISOString();

      // Check if we're past the window
      if (now.getTime() > windowStartTime.getTime() + limit.windowMs) {
        // Window expired, start fresh
        count = 0;
        resetAt = new Date(now.getTime() + limit.windowMs).toISOString();
      }
    } else {
      resetAt = new Date(now.getTime() + limit.windowMs).toISOString();
    }

    const allowed = count < limit.max;

    // If allowed, increment the counter
    if (allowed) {
      if (existing && now.getTime() <= new Date(existing.window_start).getTime() + limit.windowMs) {
        // Update existing record
        await supabase
          .from("rate_limits")
          .update({ request_count: count + 1 })
          .eq("id", existing.id);
        count++;
      } else {
        // Create new record
        await supabase.from("rate_limits").insert({
          identifier,
          action_type: action,
          request_count: 1,
          window_start: now.toISOString(),
        });
        count = 1;
      }
    }

    // Clean up old entries (older than 2 hours)
    await supabase
      .from("rate_limits")
      .delete()
      .lt("window_start", new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString());

    return new Response(
      JSON.stringify({
        allowed,
        count,
        max: limit.max,
        remaining: Math.max(0, limit.max - count),
        resetAt,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Rate limit error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
