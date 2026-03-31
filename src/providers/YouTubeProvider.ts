import type { Track, MusicProvider } from './types';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { tracks } from '../data/tracks';

export class YouTubeProvider implements MusicProvider {
  readonly name = 'YouTube';
  readonly Player = YouTubePlayer;

  getRandomTrack(): Track {
    const tracksWithYoutube = tracks.filter(t => t.youtubeId);
    const idx = Math.floor(Math.random() * tracksWithYoutube.length);
    return tracksWithYoutube[idx];
  }
}
