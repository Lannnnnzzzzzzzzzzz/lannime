import { supabase } from '@/src/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function getStreamingUrl(episodeSlug, forceRefresh = false) {
  try {
    const params = new URLSearchParams({
      slug: episodeSlug,
      ...(forceRefresh && { refresh: 'true' }),
    });

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/otakudesu-proxy?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch streaming URL');
    }

    return {
      embedUrl: result.data.embedUrl,
      streamUrl: result.data.streamUrl,
      quality: result.data.quality,
      provider: result.data.provider,
      allEmbeds: result.data.allEmbeds || [],
      cached: result.cached,
      expiresAt: result.data.expiresAt,
    };
  } catch (error) {
    console.error('Error fetching streaming URL:', error);
    throw error;
  }
}

export async function getCachedStreams(episodeSlug) {
  try {
    const { data, error } = await supabase
      .from('streaming_cache')
      .select('*')
      .eq('episode_slug', episodeSlug)
      .gt('expires_at', new Date().toISOString());

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting cached streams:', error);
    return [];
  }
}

export async function getAnimeMapping(animeIdOrSlug) {
  try {
    const { data, error } = await supabase
      .from('anime_mapping')
      .select('*')
      .or(`anime_id_en.eq.${animeIdOrSlug},anime_slug_id.eq.${animeIdOrSlug}`)
      .maybeSingle();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting anime mapping:', error);
    return null;
  }
}

export async function saveAnimeMapping(mapping) {
  try {
    const { data, error } = await supabase
      .from('anime_mapping')
      .upsert(mapping, { onConflict: 'anime_id_en' })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error saving anime mapping:', error);
    throw error;
  }
}
