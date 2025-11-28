import { useState } from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';
import { useAuth } from '../../context/AuthContext';
import { FaBookmark, FaCheck } from 'react-icons/fa';

export default function WatchlistButton({ anime, className = '' }) {
  const { user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [loading, setLoading] = useState(false);
  const isAdded = isInWatchlist(anime.id);

  const handleClick = async () => {
    if (!user) {
      alert('Please login to use watchlist');
      return;
    }

    setLoading(true);

    if (isAdded) {
      await removeFromWatchlist(anime.id);
    } else {
      await addToWatchlist(anime);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition ${
        isAdded
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white disabled:opacity-50 ${className}`}
    >
      {isAdded ? <FaCheck /> : <FaBookmark />}
      {loading ? 'Loading...' : isAdded ? 'In Watchlist' : 'Add to Watchlist'}
    </button>
  );
}
