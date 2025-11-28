import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCheck } from 'react-icons/fa';

export default function Achievements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    } else {
      navigate('/');
    }
  }, [user]);

  const fetchAchievements = async () => {
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*')
      .order('requirement', { ascending: true });

    const { data: unlocked } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', user.id);

    if (allAchievements) {
      const unlockedIds = new Set(unlocked?.map((ua) => ua.achievement_id) || []);

      const enriched = allAchievements.map((achievement) => ({
        ...achievement,
        unlocked: unlockedIds.has(achievement.id),
        unlockedAt: unlocked?.find((ua) => ua.achievement_id === achievement.id)?.unlocked_at,
      }));

      setAchievements(enriched);
    }

    if (unlocked) {
      setUserAchievements(unlocked);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen bg-[#0f0f1e] pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Achievements</h1>
          <p className="text-gray-400">
            Unlocked {unlockedCount} of {totalCount} achievements
          </p>
          <div className="w-full bg-[#16213e] rounded-full h-3 mt-4">
            <div
              className="bg-yellow-600 h-3 rounded-full transition-all"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-[#1a1a2e] rounded-lg p-6 border-2 transition ${
                achievement.unlocked
                  ? 'border-yellow-600'
                  : 'border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`text-5xl flex-shrink-0 ${
                    achievement.unlocked ? '' : 'grayscale opacity-50'
                  }`}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">{achievement.name}</h3>
                    {achievement.unlocked ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaLock className="text-gray-500" />
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        achievement.category === 'watching'
                          ? 'bg-blue-600'
                          : achievement.category === 'collection'
                          ? 'bg-green-600'
                          : 'bg-purple-600'
                      } text-white`}
                    >
                      {achievement.category}
                    </span>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <span className="text-xs text-gray-400">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
