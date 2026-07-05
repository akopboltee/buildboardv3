import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ModerationResult {
  allowed: boolean;
  flagged: boolean;
  reason?: string;
  categories?: string[];
}

const REJECT_CATEGORIES = [
  "hate",
  "hate/threatening",
  "harassment",
  "harassment/threatening",
  "violence",
  "sexual",
  "self-harm",
  "self-harm/intent",
  "self-harm/instructions",
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { content, imageData } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check banned words first (no API cost)
    if (content?.trim()) {
      const { data: bannedWords } = await supabase
        .from("banned_words")
        .select("word")
        .eq("is_active", true);

      if (bannedWords && bannedWords.length > 0) {
        const lowerContent = content.toLowerCase();
        const matchedWord = bannedWords.find((w) =>
          lowerContent.includes(w.word.toLowerCase())
        );

        if (matchedWord) {
          return new Response(JSON.stringify({
            allowed: false,
            flagged: false,
            reason: "Your content violates our community guidelines. Please revise it."
          } as ModerationResult), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Check OpenAI Moderation API if configured
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      // No API key, allow content (fail open)
      console.error("OPENAI_API_KEY not configured in edge function secrets");
      return new Response(JSON.stringify({
        allowed: true,
        flagged: false
      } as ModerationResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build input array for moderation
    const inputs: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

    // Add text content if provided
    if (content?.trim()) {
      inputs.push({ type: "text", text: content.trim() });
    }

    // Add image if provided (base64 data URL)
    if (imageData) {
      inputs.push({
        type: "image_url",
        image_url: { url: imageData }
      });
    }

    if (inputs.length === 0) {
      return new Response(JSON.stringify({
        allowed: true,
        flagged: false
      } as ModerationResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call OpenAI Moderation API
    const moderationRes = await fetch(
      "https://api.openai.com/v1/moderations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "omni-moderation-latest",
          input: inputs,
        }),
      }
    );

    if (!moderationRes.ok) {
      console.error("OpenAI Moderation API error:", await moderationRes.text());
      // Fail open - allow content if API unavailable
      return new Response(JSON.stringify({
        allowed: true,
        flagged: false
      } as ModerationResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const moderationData = await moderationRes.json();
    const results = moderationData.results || [];

    // Check if any results are flagged for our reject categories
    const flaggedCategories: string[] = [];
    let shouldReject = false;

    for (const result of results) {
      if (result.flagged) {
        const categories = result.categories || {};
        const categoryScores = result.category_scores || result.category_applied_input_types || {};

        for (const category of REJECT_CATEGORIES) {
          if (categories[category] === true) {
            flaggedCategories.push(category);
            shouldReject = true;
          }
        }
      }
    }

    if (shouldReject) {
      return new Response(JSON.stringify({
        allowed: false,
        flagged: true,
        reason: "Your content violates our community guidelines. Please revise it.",
        categories: flaggedCategories
      } as ModerationResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Content passed moderation
    return new Response(JSON.stringify({
      allowed: true,
      flagged: flaggedCategories.length > 0,
      categories: flaggedCategories.length > 0 ? flaggedCategories : undefined
    } as ModerationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Moderation error:", error);
    return new Response(JSON.stringify({
      error: "Moderation check failed"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
