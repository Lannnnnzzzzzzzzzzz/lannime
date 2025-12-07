import { useEffect, useState } from 'react';
import './Player.css';

export default function EmbedPlayer({ embedUrl, title, onError }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!embedUrl) {
      setError('No embed URL provided');
      setLoading(false);
      if (onError) onError('No embed URL provided');
      return;
    }

    setLoading(true);
    setError(null);
  }, [embedUrl, onError]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    const errorMsg = 'Failed to load video player';
    setError(errorMsg);
    setLoading(false);
    if (onError) onError(errorMsg);
  };

  if (error) {
    return (
      <div className="embed-player-error">
        <div className="error-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
          </svg>
          <h3>Video Player Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="embed-player-container">
      {loading && (
        <div className="embed-player-loading">
          <div className="loading-spinner"></div>
          <p>Loading player...</p>
        </div>
      )}
      <iframe
        src={embedUrl}
        title={title || 'Video Player'}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{
          display: loading ? 'none' : 'block',
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px'
        }}
      />
    </div>
  );
}
