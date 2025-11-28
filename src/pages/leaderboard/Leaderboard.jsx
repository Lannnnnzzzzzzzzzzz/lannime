import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { FaTrophy, FaMedal } from 'react-icons/fa';

export default function Leaderboard() {
  const [category, setCategory] = useState('episodes');
  const [period, setPeriod] = useState('all_time');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [category, period]);

  const fetchLeaderboard = async () => {
    setLoading(true);

    let query;

    if (category === 'episodes') {
      query = supabase
        .from('user_stats')
        .select('user_id, total_episodes_watched, user_profiles(username)')
        .order('total_episodes_watched', { ascending: false })
        .limit(100);
    } else if (category === 'watch_time') {
      query = supabase
        .from('user_stats')
        .select('user_id, total_watch_time_minutes, user_profiles(username)')
        .order('total_watch_time_minutes', { ascending: false })
        .limit(100);
    } else if (category === 'streak') {
      query = supabase
        .from('user_stats')
        .select('user_id, current_streak_days, user_profiles(username)')
        .order('current_streak_days', { ascending: false })
        .limit(100);
    } else if (category === 'completed') {
      query = supabase
        .from('user_stats')
        .select('user_id, total_anime_completed, user_profiles(username)')
        .order('total_anime_completed', { ascending: false })
        .limit(100);
    }

    const { data, error } = await query;

    if (!error && data) {
      setLeaderboard(data);
    }

    setLoading(false);
  };

  const getValue = (item) => {
    if (category === 'episodes') return item.total_episodes_watched;
    if (category === 'watch_time') {
      const hours = Math.floor(item.total_watch_time_minutes / 60);
      const mins = item.total_watch_time_minutes % 60;
      return `${hours}h ${mins}m`;
    }
    if (category === 'streak') return `${item.current_streak_days} days`;
    if (category === 'completed') return item.total_anime_completed;
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-[#0f0f1e] pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <FaTrophy className="text-yellow-500" />
          Leaderboard
        </h1>

        <div className="bg-[#1a1a2e] rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-[#16213e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="episodes">Most Episodes</option>
                <option value="watch_time">Most Watch Time</option>
                <option value="streak">Longest Streak</option>
                <option value="completed">Most Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-4 py-2 bg-[#16213e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="all_time">All Time</option>
                <option value="monthly">This Month</option>
                <option value="weekly">This Week</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white text-xl py-12">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No data available</div>
        ) : (
          <div className="bg-[#1a1a2e] rounded-lg overflow-hidden">
            {leaderboard.map((item, index) => (
              <div
                key={item.user_id}
                className={`flex items-center gap-4 p-4 border-b border-gray-700 ${
                  index < 3 ? 'bg-[#16213e]' : ''
                }`}
              >
                <div className="w-12 text-center">
                  {index < 3 ? (
                    <FaMedal className={`text-3xl ${getMedalColor(index + 1)}`} />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>
                  )}
                </div>

                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">
                    {item.user_profiles?.username?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-white font-semibold">
                    {item.user_profiles?.username || 'Unknown User'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-500">{getValue(item)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
