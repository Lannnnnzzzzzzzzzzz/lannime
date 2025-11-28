import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import { FaTv, FaClock, FaTrophy, FaFire, FaChartLine } from 'react-icons/fa';

export default function Stats() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genreStats, setGenreStats] = useState([]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchGenreStats();
    } else {
      navigate('/');
    }
  }, [user]);

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setStats(data);
    }
    setLoading(false);
  };

  const fetchGenreStats = async () => {
    const { data: watchlistData } = await supabase
      .from('watchlist')
      .select('anime_id')
      .eq('user_id', user.id);

    if (watchlistData && watchlistData.length > 0) {
      const genreCount = {};
      setGenreStats(
        Object.entries(genreCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] pt-24 flex items-center justify-center">
        <div className="text-white text-xl">No stats available yet. Start watching!</div>
      </div>
    );
  }

  const watchTimeHours = Math.floor(stats.total_watch_time_minutes / 60);
  const watchTimeMinutes = stats.total_watch_time_minutes % 60;

  return (
    <div className="min-h-screen bg-[#0f0f1e] pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {profile?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{profile?.username}'s Stats</h1>
            <p className="text-gray-400">Your anime watching statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <FaTv className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Episodes Watched</p>
                <p className="text-3xl font-bold text-white">{stats.total_episodes_watched}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <FaClock className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Watch Time</p>
                <p className="text-3xl font-bold text-white">
                  {watchTimeHours}h {watchTimeMinutes}m
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                <FaTrophy className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Anime Completed</p>
                <p className="text-3xl font-bold text-white">{stats.total_anime_completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <FaFire className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current Streak</p>
                <p className="text-3xl font-bold text-white">{stats.current_streak_days} days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaChartLine className="text-blue-500" />
              Milestones
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Longest Streak</span>
                <span className="text-white font-bold">{stats.longest_streak_days} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Watch Time</span>
                <span className="text-white font-bold">
                  {watchTimeHours}h {watchTimeMinutes}m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg. Episodes per Day</span>
                <span className="text-white font-bold">
                  {stats.current_streak_days > 0
                    ? Math.round(stats.total_episodes_watched / stats.current_streak_days)
                    : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Progress to Next Milestone</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">100 Episodes</span>
                  <span className="text-blue-500">{stats.total_episodes_watched}/100</span>
                </div>
                <div className="w-full bg-[#16213e] rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((stats.total_episodes_watched / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">10 Completed Anime</span>
                  <span className="text-green-500">{stats.total_anime_completed}/10</span>
                </div>
                <div className="w-full bg-[#16213e] rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((stats.total_anime_completed / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">30 Day Streak</span>
                  <span className="text-red-500">{stats.current_streak_days}/30</span>
                </div>
                <div className="w-full bg-[#16213e] rounded-full h-3">
                  <div
                    className="bg-red-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((stats.current_streak_days / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
