import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useWatchProgress = () => {
  const [loading, setLoading] = useState(false);

  const saveProgress = useCallback(async (progressData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const localData = JSON.parse(localStorage.getItem('continueWatching') || '[]');
        const filtered = localData.filter(item => item.data_id !== progressData.data_id);
        filtered.unshift({
          ...progressData,
          leftAt: progressData.progress,
          updatedAt: Date.now()
        });
        localStorage.setItem('continueWatching', JSON.stringify(filtered.slice(0, 20)));
        return;
      }

      const { error } = await supabase
        .from('watch_progress')
        .upsert({
          user_id: user.id,
          anime_id: progressData.anime_id || progressData.id,
          data_id: progressData.data_id,
          episode_id: progressData.episode_id || progressData.episodeId,
          episode_num: progressData.episode_num || progressData.episodeNum,
          progress: progressData.progress || progressData.leftAt || 0,
          duration: progressData.duration || 0,
          poster: progressData.poster,
          title: progressData.title,
          japanese_title: progressData.japanese_title,
          adult_content: progressData.adult_content || progressData.adultContent || false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,data_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving watch progress:', error);
    }
  }, []);

  const getProgress = useCallback(async (limit = 20) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const localData = JSON.parse(localStorage.getItem('continueWatching') || '[]');
        return localData.slice(0, limit).map(item => ({
          ...item,
          id: item.id,
          episodeId: item.episodeId,
          episodeNum: item.episodeNum,
          leftAt: item.leftAt,
          updatedAt: item.updatedAt
        }));
      }

      const { data, error } = await supabase
        .from('watch_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.anime_id,
        data_id: item.data_id,
        episodeId: item.episode_id,
        episodeNum: item.episode_num,
        leftAt: item.progress,
        duration: item.duration,
        poster: item.poster,
        title: item.title,
        japanese_title: item.japanese_title,
        adultContent: item.adult_content,
        updatedAt: new Date(item.updated_at).getTime(),
        progressPercent: item.duration > 0 ? (item.progress / item.duration) * 100 : 0
      }));
    } catch (error) {
      console.error('Error fetching watch progress:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const removeProgress = useCallback(async (episodeId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const localData = JSON.parse(localStorage.getItem('continueWatching') || '[]');
        const filtered = localData.filter(item => item.episodeId !== episodeId);
        localStorage.setItem('continueWatching', JSON.stringify(filtered));
        return;
      }

      const { error } = await supabase
        .from('watch_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('episode_id', episodeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing watch progress:', error);
    }
  }, []);

  return { saveProgress, getProgress, removeProgress, loading };
};
