import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaChartBar, FaTrophy, FaCog } from 'react-icons/fa';

export default function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    setShowMenu(false);
    navigate('/');
  };

  if (!user || !profile) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#16213e] hover:bg-[#1a1a2e] transition"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold">
            {profile.username?.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-white hidden md:block">{profile.username}</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-[#1a1a2e] rounded-lg shadow-lg py-2 z-50 border border-gray-700">
            <button
              onClick={() => {
                navigate('/profile');
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-[#16213e] flex items-center gap-3"
            >
              <FaUser className="text-blue-500" />
              Profile
            </button>

            <button
              onClick={() => {
                navigate('/stats');
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-[#16213e] flex items-center gap-3"
            >
              <FaChartBar className="text-green-500" />
              Stats
            </button>

            <button
              onClick={() => {
                navigate('/achievements');
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-[#16213e] flex items-center gap-3"
            >
              <FaTrophy className="text-yellow-500" />
              Achievements
            </button>

            <button
              onClick={() => {
                navigate('/settings');
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-[#16213e] flex items-center gap-3"
            >
              <FaCog className="text-gray-400" />
              Settings
            </button>

            <hr className="my-2 border-gray-700" />

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-500 hover:bg-[#16213e] flex items-center gap-3"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
