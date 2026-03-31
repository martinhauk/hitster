import { useEffect, useRef } from 'react';
import type { PlayerProps } from '../providers/types';

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        options: {
          height: string;
          width: string;
          videoId?: string;
          playerVars?: Record<string, number>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady: () => void;
    _ytReadyCallbacks?: Array<() => void>;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  setVolume(vol: number): void;
  destroy(): void;
  loadVideoById(videoId: string): void;
}

export function YouTubePlayer({ track, isPlaying }: PlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const initPlayer = () => {
      const container = containerRef.current;
      if (!container) return;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      // new YT.Player() replaces the target element with an iframe, which would
      // corrupt the React ref on subsequent calls.  Create a fresh child div each
      // time so containerRef (the outer div) stays in the DOM permanently.
      container.replaceChildren();
      const playerTarget = document.createElement('div');
      container.appendChild(playerTarget);
      playerRef.current = new window.YT.Player(playerTarget, {
        height: '1',
        width: '1',
        videoId: track.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (e) => {
            e.target.setVolume(100);
            if (isPlayingRef.current) {
              e.target.playVideo();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Use a shared callback queue so multiple instances don't overwrite each other.
      if (!window._ytReadyCallbacks) {
        window._ytReadyCallbacks = [];
        window.onYouTubeIframeAPIReady = () => {
          window._ytReadyCallbacks?.forEach(cb => cb());
          window._ytReadyCallbacks = [];
        };
        if (!document.getElementById('yt-script')) {
          const script = document.createElement('script');
          script.id = 'yt-script';
          script.src = 'https://www.youtube.com/iframe_api';
          document.head.appendChild(script);
        }
      }
      window._ytReadyCallbacks.push(initPlayer);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [track.youtubeId]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className="absolute overflow-hidden opacity-0 pointer-events-none"
      style={{ width: '1px', height: '1px', top: '-9999px', left: '-9999px' }}
    />
  );
}
