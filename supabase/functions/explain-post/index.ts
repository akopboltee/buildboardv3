import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();

    if (!title?.trim()) {
      return new Response(JSON.stringify({ error: "Title is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const forwarded = req.headers.get("x-forwarded-for") || "unknown";
    const identifier = forwarded.split(",")[0].trim();

    const now = new Date();
    const windowStart = new Date(now.getTime() - WINDOW_MS);

    const { data: existing } = await supabase
      .from("ai_rate_limits")
      .select("id, request_count")
      .eq("identifier", identifier)
      .gte("window_start", windowStart.toISOString())
      .maybeSingle();

    if (existing && existing.request_count >= RATE_LIMIT) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: corsHeaders }
      );
    }

    if (existing) {
      await supabase
        .from("ai_rate_limits")
        .update({ request_count: existing.request_count + 1 })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("ai_rate_limits")
        .insert({
          identifier,
          request_count: 1,
          window_start: now.toISOString(),
        });
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing Groq API key" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const sanitizedTitle = title.trim().replace(/[<>]/g, "");
    const sanitizedDesc =
      description?.trim()?.replace(/[<>]/g, "") || "";

    const prompt = `
You are a text conversion system.

You convert messy social posts into clean explanations.

RULES:
- Do NOT copy the input text
- Do NOT add headings or labels
- Do NOT greet the user
- Do NOT use names from the input
- Output ONLY the explanation
- Write 3–5 sentences

INPUT:
Title: ${sanitizedTitle}
Description: ${sanitizedDesc || "No description"}

OUTPUT:
Only return the explanation.
`;

    console.log("Calling Groq API...");

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You convert messy social posts into 3–5 sentence clean explanations. No headings, no greetings, no labels.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 300,
        }),
      }
    );

    const data = await groqRes.json();

    console.log("FULL GROQ RESPONSE:", JSON.stringify(data, null, 2));

    const explanation =
      data?.choices?.[0]?.message?.content?.trim() || "";

    if (!explanation) {
      return new Response(
        JSON.stringify({ error: "No explanation generated" }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Explain post error:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});