import type { Track, MusicProvider } from './types';
import { tracks } from '../data/tracks';

export class SpotifyProvider implements MusicProvider {
  readonly name = 'Spotify';

  getRandomTrack(): Track {
    const tracksWithPreview = tracks.filter(t => t.previewUrl);
    if (tracksWithPreview.length === 0) {
      // No preview URLs configured — SpotifyProvider requires tracks with previewUrl.
      // Fall back to tracks with YouTube IDs so audio can still play via YouTubePlayer.
      const fallback = tracks.filter(t => t.youtubeId);
      const idx = Math.floor(Math.random() * fallback.length);
      return fallback[idx];
    }
    const idx = Math.floor(Math.random() * tracksWithPreview.length);
    return tracksWithPreview[idx];
  }
}
