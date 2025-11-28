import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

export const useWatchProgress = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id)
      .order('last_watched_at', { ascending: false });

    if (!error && data) {
      setHistory(data);
    }
    setLoading(false);
  };

  const updateProgress = useCallback(
    async (episodeData) => {
      if (!user) return;

      const { anime_id, episode_id, episode_number, progress, duration, completed } = episodeData;

      const { data, error } = await supabase
        .from('watch_history')
        .upsert(
          {
            user_id: user.id,
            anime_id,
            episode_id,
            episode_number,
            progress: Math.floor(progress),
            duration: Math.floor(duration),
            completed: completed || progress >= duration * 0.9,
            last_watched_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,episode_id' }
        )
        .select()
        .single();

      if (!error && data) {
        setHistory((prev) => {
          const filtered = prev.filter((h) => h.episode_id !== episode_id);
          return [data, ...filtered];
        });

        await updateUserStats();
        await checkAchievements();
      }

      return { data, error };
    },
    [user]
  );

  const updateUserStats = async () => {
    if (!user) return;

    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!stats) return;

    const { data: historyData } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id);

    if (!historyData) return;

    const totalEpisodes = historyData.filter((h) => h.completed).length;
    const totalWatchTime = historyData.reduce((sum, h) => sum + (h.duration || 0), 0);

    const { data: watchlistData } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    const totalCompleted = watchlistData?.length || 0;

    const today = new Date().toISOString().split('T')[0];
    const lastWatched = stats.last_watched_date;

    let currentStreak = stats.current_streak_days || 0;
    let longestStreak = stats.longest_streak_days || 0;

    if (lastWatched) {
      const lastDate = new Date(lastWatched);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        currentStreak = currentStreak;
      } else if (diffDays === 1) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    await supabase
      .from('user_stats')
      .update({
        total_episodes_watched: totalEpisodes,
        total_watch_time_minutes: Math.floor(totalWatchTime / 60),
        total_anime_completed: totalCompleted,
        current_streak_days: currentStreak,
        longest_streak_days: longestStreak,
        last_watched_date: today,
      })
      .eq('user_id', user.id);
  };

  const checkAchievements = async () => {
    if (!user) return;

    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!stats) return;

    const { data: achievements } = await supabase.from('achievements').select('*');

    if (!achievements) return;

    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    const unlockedIds = new Set(userAchievements?.map((ua) => ua.achievement_id) || []);

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue;

      let unlocked = false;

      switch (achievement.key) {
        case 'first_watch':
          unlocked = stats.total_episodes_watched >= 1;
          break;
        case 'binge_watcher':
          unlocked = await checkBingeWatcher();
          break;
        case 'dedicated_fan':
          unlocked = stats.total_episodes_watched >= 50;
          break;
        case 'anime_addict':
          unlocked = stats.total_episodes_watched >= 100;
          break;
        case 'completionist':
          unlocked = stats.total_anime_completed >= 10;
          break;
        case 'week_streak':
          unlocked = stats.current_streak_days >= 7;
          break;
        case 'month_streak':
          unlocked = stats.current_streak_days >= 30;
          break;
        default:
          break;
      }

      if (unlocked) {
        await supabase.from('user_achievements').insert({
          user_id: user.id,
          achievement_id: achievement.id,
          progress: achievement.requirement,
        });

        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: `You unlocked: ${achievement.name} - ${achievement.description}`,
        });
      }
    }
  };

  const checkBingeWatcher = async () => {
    if (!user) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id)
      .gte('last_watched_at', today.toISOString())
      .eq('completed', true);

    return (data?.length || 0) >= 10;
  };

  const getEpisodeProgress = (episodeId) => {
    return history.find((h) => h.episode_id === episodeId);
  };

  const getContinueWatching = () => {
    return history
      .filter((h) => !h.completed && h.progress > 0)
      .slice(0, 10);
  };

  return {
    history,
    loading,
    updateProgress,
    getEpisodeProgress,
    getContinueWatching,
    refetch: fetchHistory,
  };
};
