export interface Track {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre?: string;
  previewUrl?: string;
  youtubeId?: string;
}

export interface MusicProvider {
  readonly name: string;
  getRandomTrack(): Track;
}
