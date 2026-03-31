import type { ComponentType } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre?: string;
  previewUrl?: string;
  youtubeId?: string;
}

/**
 * Props passed to the hidden player component rendered by each provider.
 * The player must never show any visible UI — its only job is to play audio.
 */
export interface PlayerProps {
  track: Track;
  isPlaying: boolean;
}

/**
 * Contract every music provider must satisfy.
 *
 * Best-practice pattern: the provider carries its own `Player` React component
 * so that consumers (e.g. GameBoard) never need to branch on `provider.name`.
 * Swap the provider → the correct player is used automatically.
 */
export interface MusicProvider {
  /** Human-readable label shown in the provider selector. */
  readonly name: string;
  /**
   * Hidden audio player component.  Render it anywhere in the tree;
   * it will handle playback without any visible UI.
   */
  readonly Player: ComponentType<PlayerProps>;
  /** Return a random track that this provider can play. */
  getRandomTrack(): Track;
}
