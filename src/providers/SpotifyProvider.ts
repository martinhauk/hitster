import type { Track, MusicProvider } from './types';
import { tracks } from '../data/tracks';

export class SpotifyProvider implements MusicProvider {
  readonly name = 'Spotify';

  getRandomTrack(): Track {
    const tracksWithPreview = tracks.filter(t => t.previewUrl);
    if (tracksWithPreview.length === 0) {
      // Fall back to all tracks if none have preview URLs
      const idx = Math.floor(Math.random() * tracks.length);
      return tracks[idx];
    }
    const idx = Math.floor(Math.random() * tracksWithPreview.length);
    return tracksWithPreview[idx];
  }
}
