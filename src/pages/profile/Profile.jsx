import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWatchlist } from '../../hooks/useWatchlist';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] pt-24 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Please login to view profile</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    setError('');

    const { error } = await updateProfile({
      username,
      bio,
    });

    if (error) {
      setError(error.message);
    } else {
      setEditing(false);
    }
    setLoading(false);
  };

  const watchlistByStatus = {
    watching: watchlist.filter((w) => w.status === 'watching'),
    completed: watchlist.filter((w) => w.status === 'completed'),
    plan_to_watch: watchlist.filter((w) => w.status === 'plan_to_watch'),
    on_hold: watchlist.filter((w) => w.status === 'on_hold'),
    dropped: watchlist.filter((w) => w.status === 'dropped'),
  };

  return (
    <div className="min-h-screen bg-[#0f0f1e] pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1a1a2e] rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {profile.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                {editing ? (
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#16213e] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
                )}
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
              >
                <FaEdit />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white disabled:opacity-50"
                >
                  <FaSave />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setUsername(profile.username);
                    setBio(profile.bio);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
                >
                  <FaTimes />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div>
            <h3 className="text-white font-semibold mb-2">Bio</h3>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#16213e] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                rows={4}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-300">{profile.bio || 'No bio yet'}</p>
            )}
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">My Watchlist</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {Object.entries({
              watching: 'Watching',
              plan_to_watch: 'Plan to Watch',
              completed: 'Completed',
              on_hold: 'On Hold',
              dropped: 'Dropped',
            }).map(([key, label]) => (
              <div key={key} className="bg-[#16213e] rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-500">
                  {watchlistByStatus[key].length}
                </div>
                <div className="text-gray-300 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>

          {watchlist.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Your watchlist is empty. Start adding anime!
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {watchlist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/anime/${item.anime_id}`)}
                  className="cursor-pointer group"
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={item.anime_poster}
                      alt={item.anime_title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center">
                      <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition">
                        View
                      </span>
                    </div>
                  </div>
                  <p className="text-white text-sm mt-2 truncate">{item.anime_title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white">
                      {item.status.replace('_', ' ')}
                    </span>
                    {item.rating && (
                      <span className="text-xs text-yellow-500">★ {item.rating}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
