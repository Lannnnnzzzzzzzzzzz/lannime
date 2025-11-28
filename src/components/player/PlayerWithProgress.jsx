import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWatchProgress } from '../../hooks/useWatchProgress';
import Player from './Player';

export default function PlayerWithProgress(props) {
  const { user } = useAuth();
  const { updateProgress } = useWatchProgress();
  const progressIntervalRef = useRef(null);
  const playerInstanceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handlePlayerReady = (artInstance) => {
    playerInstanceRef.current = artInstance;

    if (user && props.episodeId && props.animeInfo) {
      progressIntervalRef.current = setInterval(() => {
        if (artInstance && artInstance.playing) {
          const progress = artInstance.currentTime;
          const duration = artInstance.duration;

          if (progress > 0 && duration > 0) {
            updateProgress({
              anime_id: props.animeInfo.id,
              episode_id: props.episodeId,
              episode_number: parseInt(props.episodeNum) || 1,
              progress,
              duration,
              completed: progress >= duration * 0.9,
            });
          }
        }
      }, 10000);
    }

    artInstance.on('video:ended', () => {
      if (user && props.episodeId && props.animeInfo) {
        updateProgress({
          anime_id: props.animeInfo.id,
          episode_id: props.episodeId,
          episode_number: parseInt(props.episodeNum) || 1,
          progress: artInstance.duration,
          duration: artInstance.duration,
          completed: true,
        });
      }
    });
  };

  return <Player {...props} onReady={handlePlayerReady} />;
}
