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

// Hard-coded banned words as fallback (always checked first)
// Only include actual slurs/hate speech, NOT identity terms like "gay" or "lesbian"
// that could be used positively (e.g., "building a gay rights app")
const HARDCODED_BANNED_WORDS = [
  // Racial slurs
  "nigga", "nigger", "n*gga", "n*gger",
  "kike", "chink", "spic", "wetback",
  // Anti-LGBTQ slurs
  "fag", "faggot", "f*ggot", "dyke", "tranny", "shemale",
  // Ableist slurs
  "retard", "r*tard", "retarded",
  // Gender/sexual insults
  "cunt", "c*nt", "whore", "slut",
  // Hate symbols/figures
  "nazi", "hitler", "kkk", "white power",
  // Violence/self-harm encouragement
  "kill yourself", "kys", "go kill yourself",
  // Child exploitation
  "pedophile", "pedo", "incest",
  "child porn", "cp",
];

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

    // Step 1: Check hard-coded banned words FIRST (no DB, no API needed)
    if (content?.trim()) {
      const lowerContent = content.toLowerCase();
      const matchedHardcoded = HARDCODED_BANNED_WORDS.find((word) =>
        lowerContent.includes(word.toLowerCase())
      );

      if (matchedHardcoded) {
        console.log("Blocked by hardcoded word:", matchedHardcoded);
        return new Response(JSON.stringify({
          allowed: false,
          flagged: false,
          reason: "Your content violates our community guidelines. Please revise it."
        } as ModerationResult), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Step 2: Try database banned words
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (content?.trim()) {
      try {
        const { data: bannedWords, error } = await supabase
          .from("banned_words")
          .select("word")
          .eq("is_active", true);

        if (!error && bannedWords && bannedWords.length > 0) {
          const lowerContent = content.toLowerCase();
          const matchedWord = bannedWords.find((w) =>
            lowerContent.includes(w.word.toLowerCase())
          );

          if (matchedWord) {
            console.log("Blocked by DB word:", matchedWord.word);
            return new Response(JSON.stringify({
              allowed: false,
              flagged: false,
              reason: "Your content violates our community guidelines. Please revise it."
            } as ModerationResult), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (dbError) {
        console.error("DB banned words check failed:", dbError);
        // Continue to OpenAI check
      }
    }

    // Step 3: Check OpenAI Moderation API if configured
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.error("OPENAI_API_KEY not configured in edge function secrets");
      // Fail closed - reject content if we can't moderate
      return new Response(JSON.stringify({
        allowed: false,
        flagged: false,
        reason: "Content moderation is temporarily unavailable. Please try again later."
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
      // Fail closed
      return new Response(JSON.stringify({
        allowed: false,
        flagged: false,
        reason: "Content moderation is temporarily unavailable. Please try again later."
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
      allowed: false,
      flagged: false,
      reason: "Content moderation failed. Please try again."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
