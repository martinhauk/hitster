import { useEffect, useRef } from 'react';
import type { Track } from '../providers/types';

interface Props {
  track: Track;
  isPlaying: boolean;
}

export function SpotifyPlayer({ track, isPlaying }: Props) {
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
