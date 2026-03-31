import { useEffect, useRef } from 'react';
import type { PlayerProps } from '../providers/types';

export function SpotifyPlayer({ track, isPlaying }: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = track.previewUrl || '';
      audioRef.current.load();
    }
  }, [track]);

  return <audio ref={audioRef} />;
}
