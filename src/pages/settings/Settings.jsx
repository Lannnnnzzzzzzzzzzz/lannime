import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      navigate('/');
    }
  }, [user]);

  const fetchPreferences = async () => {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setPreferences(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    await supabase
      .from('user_preferences')
      .update(preferences)
      .eq('user_id', user.id);

    setSaving(false);
    alert('Settings saved successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Error loading preferences</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1e] pt-24 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="bg-[#1a1a2e] rounded-lg p-8 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Video Preferences</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Preferred Quality</label>
                <select
                  value={preferences.preferred_quality}
                  onChange={(e) =>
                    setPreferences({ ...preferences, preferred_quality: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-[#16213e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                  <option value="360p">360p</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Preferred Audio</label>
                <select
                  value={preferences.preferred_subtitle}
                  onChange={(e) =>
                    setPreferences({ ...preferences, preferred_subtitle: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-[#16213e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="sub">Subtitled</option>
                  <option value="dub">Dubbed</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoplay"
                  checked={preferences.autoplay_next}
                  onChange={(e) =>
                    setPreferences({ ...preferences, autoplay_next: e.target.checked })
                  }
                  className="w-5 h-5 bg-[#16213e] border-gray-700 rounded"
                />
                <label htmlFor="autoplay" className="text-gray-300">
                  Autoplay next episode
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="theater"
                  checked={preferences.theater_mode}
                  onChange={(e) =>
                    setPreferences({ ...preferences, theater_mode: e.target.checked })
                  }
                  className="w-5 h-5 bg-[#16213e] border-gray-700 rounded"
                />
                <label htmlFor="theater" className="text-gray-300">
                  Theater mode by default
                </label>
              </div>
            </div>
          </div>

          <hr className="border-gray-700" />

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Notifications</h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="email_notif"
                checked={preferences.email_notifications}
                onChange={(e) =>
                  setPreferences({ ...preferences, email_notifications: e.target.checked })
                }
                className="w-5 h-5 bg-[#16213e] border-gray-700 rounded"
              />
              <label htmlFor="email_notif" className="text-gray-300">
                Receive email notifications for new episodes
              </label>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded transition"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
