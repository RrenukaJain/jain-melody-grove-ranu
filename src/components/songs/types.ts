
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  file_url: string;
  cover_image: string | null;
}

export interface AudioCache {
  [key: string]: {
    audio: HTMLAudioElement;
    lastUsed: number;
  };
}
