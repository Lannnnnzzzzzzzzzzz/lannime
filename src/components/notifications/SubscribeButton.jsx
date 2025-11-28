import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { FaBell, FaBellSlash } from 'react-icons/fa';

export default function SubscribeButton({ animeId, animeTitle }) {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && animeId) {
      checkSubscription();
    }
  }, [user, animeId]);

  const checkSubscription = async () => {
    const { data } = await supabase
      .from('anime_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('anime_id', animeId)
      .maybeSingle();

    setSubscribed(!!data);
  };

  const handleToggle = async () => {
    if (!user) {
      alert('Please login to subscribe');
      return;
    }

    setLoading(true);

    if (subscribed) {
      await supabase
        .from('anime_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('anime_id', animeId);

      setSubscribed(false);
    } else {
      await supabase.from('anime_subscriptions').insert({
        user_id: user.id,
        anime_id: animeId,
        anime_title: animeTitle,
        notify_app: true,
        notify_email: true,
      });

      setSubscribed(true);
    }

    setLoading(false);
  };

  if (!user) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition disabled:opacity-50 ${
        subscribed
          ? 'bg-gray-600 hover:bg-gray-700'
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white`}
    >
      {subscribed ? <FaBellSlash /> : <FaBell />}
      {loading
        ? 'Loading...'
        : subscribed
        ? 'Unsubscribe'
        : 'Subscribe to notifications'}
    </button>
  );
}
