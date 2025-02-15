
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  file_url: string;
}

export interface AudioCache {
  [key: string]: {
    audio: HTMLAudioElement;
    lastUsed: number;
  };
}
