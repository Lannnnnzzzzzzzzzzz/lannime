import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const episodeSlug = url.searchParams.get("slug");
    const forceRefresh = url.searchParams.get("refresh") === "true";

    if (!episodeSlug) {
      return new Response(
        JSON.stringify({ error: "Missing 'slug' parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check cache first
    if (!forceRefresh) {
      const { data: cached, error: cacheError } = await supabase
        .from("streaming_cache")
        .select("*")
        .eq("episode_slug", episodeSlug)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (!cacheError && cached) {
        return new Response(
          JSON.stringify({
            success: true,
            cached: true,
            data: {
              embedUrl: cached.embed_url,
              streamUrl: cached.stream_url,
              quality: cached.quality,
              provider: cached.provider,
              expiresAt: cached.expires_at,
            },
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch from Otakudesu
    const otakudesuUrl = `https://otakudesu.cloud/episode/${episodeSlug}`;
    const response = await fetch(otakudesuUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Otakudesu: ${response.status}`);
    }

    const html = await response.text();

    // Extract embed URLs from HTML
    const embedUrls: Array<{ url: string; quality: string; provider: string }> = [];
    
    // Match desustream/mirror iframe patterns
    const desuRegex = /<iframe[^>]*src=["'](https:\/\/desustream\.(?:me|info)\/[^"']+)["']/gi;
    const mirrorRegex = /<iframe[^>]*src=["'](https:\/\/[^"']*mirror[^"']*)["']/gi;
    
    let match;
    while ((match = desuRegex.exec(html)) !== null) {
      embedUrls.push({
        url: match[1],
        quality: "720p", // Default quality
        provider: "desustream",
      });
    }
    
    while ((match = mirrorRegex.exec(html)) !== null) {
      embedUrls.push({
        url: match[1],
        quality: "480p",
        provider: "mirror",
      });
    }

    if (embedUrls.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No embed URLs found",
          hint: "Episode might not be available yet" 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use first (usually best quality) embed URL
    const bestEmbed = embedUrls[0];

    // Cache the result for 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await supabase
      .from("streaming_cache")
      .upsert(
        {
          episode_slug: episodeSlug,
          embed_url: bestEmbed.url,
          stream_url: bestEmbed.url, // For embed, stream_url same as embed_url
          quality: bestEmbed.quality,
          provider: bestEmbed.provider,
          expires_at: expiresAt.toISOString(),
        },
        { onConflict: "episode_slug" }
      );

    return new Response(
      JSON.stringify({
        success: true,
        cached: false,
        data: {
          embedUrl: bestEmbed.url,
          streamUrl: bestEmbed.url,
          quality: bestEmbed.quality,
          provider: bestEmbed.provider,
          allEmbeds: embedUrls,
          expiresAt: expiresAt.toISOString(),
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in otakudesu-proxy:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
