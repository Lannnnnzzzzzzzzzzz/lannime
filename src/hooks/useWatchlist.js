import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

export const useWatchlist = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
    }
  }, [user]);

  const fetchWatchlist = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setWatchlist(data);
    }
    setLoading(false);
  };

  const addToWatchlist = async (anime) => {
    if (!user) return { error: { message: 'Please login first' } };

    const { data, error } = await supabase
      .from('watchlist')
      .insert({
        user_id: user.id,
        anime_id: anime.id,
        anime_title: anime.title,
        anime_poster: anime.poster,
        status: 'plan_to_watch',
      })
      .select()
      .single();

    if (!error && data) {
      setWatchlist((prev) => [data, ...prev]);
      return { data, error: null };
    }
    return { data: null, error };
  };

  const removeFromWatchlist = async (animeId) => {
    if (!user) return;

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('anime_id', animeId);

    if (!error) {
      setWatchlist((prev) => prev.filter((item) => item.anime_id !== animeId));
    }
  };

  const updateWatchlistStatus = async (animeId, status) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('watchlist')
      .update({ status })
      .eq('user_id', user.id)
      .eq('anime_id', animeId)
      .select()
      .single();

    if (!error && data) {
      setWatchlist((prev) =>
        prev.map((item) => (item.anime_id === animeId ? data : item))
      );
    }
  };

  const updateWatchlistRating = async (animeId, rating) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('watchlist')
      .update({ rating })
      .eq('user_id', user.id)
      .eq('anime_id', animeId)
      .select()
      .single();

    if (!error && data) {
      setWatchlist((prev) =>
        prev.map((item) => (item.anime_id === animeId ? data : item))
      );
    }
  };

  const isInWatchlist = (animeId) => {
    return watchlist.some((item) => item.anime_id === animeId);
  };

  const getWatchlistItem = (animeId) => {
    return watchlist.find((item) => item.anime_id === animeId);
  };

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistStatus,
    updateWatchlistRating,
    isInWatchlist,
    getWatchlistItem,
    refetch: fetchWatchlist,
  };
};
