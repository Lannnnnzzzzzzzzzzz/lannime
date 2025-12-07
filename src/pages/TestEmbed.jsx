import { useState } from 'react';
import EmbedPlayer from '@/src/components/player/EmbedPlayer';
import { getStreamingUrl } from '@/src/services/streamingService';

export default function TestEmbed() {
  const [episodeSlug, setEpisodeSlug] = useState('');
  const [embedData, setEmbedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testEpisodes = [
    'onpm-s3-episode-1-sub-indo',
    'spy-x-family-s3-episode-1-sub-indo',
    'death-note-episode-1-sub-indo',
  ];

  const handleFetch = async (slug) => {
    setLoading(true);
    setError(null);
    setEmbedData(null);

    try {
      const data = await getStreamingUrl(slug);
      setEmbedData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: '#1e3c72'
        }}>
          Otakudesu Embed Player Test
        </h1>
        <p style={{
          color: '#666',
          marginBottom: '30px',
          fontSize: '14px'
        }}>
          Test embed URLs from Otakudesu with Supabase caching
        </p>

        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontWeight: '600',
            color: '#333'
          }}>
            Episode Slug:
          </label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={episodeSlug}
              onChange={(e) => setEpisodeSlug(e.target.value)}
              placeholder="e.g., onpm-s3-episode-1-sub-indo"
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1e3c72'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <button
              onClick={() => handleFetch(episodeSlug)}
              disabled={!episodeSlug || loading}
              style={{
                padding: '12px 24px',
                background: loading ? '#ccc' : '#1e3c72',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.background = '#2a5298';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.background = '#1e3c72';
              }}
            >
              {loading ? 'Fetching...' : 'Fetch & Play'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {testEpisodes.map((slug) => (
              <button
                key={slug}
                onClick={() => {
                  setEpisodeSlug(slug);
                  handleFetch(slug);
                }}
                disabled={loading}
                style={{
                  padding: '8px 12px',
                  background: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = '#e8e8e8';
                    e.target.style.borderColor = '#1e3c72';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = '#f5f5f5';
                    e.target.style.borderColor = '#e0e0e0';
                  }
                }}
              >
                {slug}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#c33'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {embedData && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              padding: '16px',
              background: '#f0f9ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1e3c72'
              }}>
                Stream Info {embedData.cached && '(Cached)'}
              </h3>
              <div style={{ fontSize: '13px', color: '#555' }}>
                <div><strong>Provider:</strong> {embedData.provider}</div>
                <div><strong>Quality:</strong> {embedData.quality}</div>
                <div><strong>URL:</strong> <span style={{
                  fontSize: '11px',
                  color: '#666',
                  wordBreak: 'break-all'
                }}>{embedData.embedUrl}</span></div>
                {embedData.allEmbeds && embedData.allEmbeds.length > 1 && (
                  <div><strong>Available:</strong> {embedData.allEmbeds.length} embed(s)</div>
                )}
              </div>
            </div>

            <div style={{
              aspectRatio: '16/9',
              width: '100%',
              maxWidth: '100%'
            }}>
              <EmbedPlayer
                embedUrl={embedData.embedUrl}
                title={episodeSlug}
                onError={(err) => setError(err)}
              />
            </div>
          </div>
        )}

        {!embedData && !loading && !error && (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            background: '#f9f9f9',
            borderRadius: '8px',
            color: '#999'
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ margin: '0 auto 16px' }}>
              <polygon points="5 3 19 12 5 21 5 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Enter an episode slug and click "Fetch & Play" to test the embed player</p>
          </div>
        )}
      </div>
    </div>
  );
}
