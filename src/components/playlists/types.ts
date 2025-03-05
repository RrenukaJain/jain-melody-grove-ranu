import { Song } from "../songs/types";

export interface Playlist {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  order_position: number;
  created_at: string;
  song?: Song;
}

export interface PlaylistWithSongs extends Playlist {
  songs: Song[];
}

export interface CreatePlaylistParams {
  name: string;
}

export interface UpdatePlaylistParams {
  name?: string;
}

export interface AddSongToPlaylistParams {
  playlist_id: string;
  song_id: string;
  order_position?: number;
}

export interface RemoveSongFromPlaylistParams {
  playlist_id: string;
  song_id: string;
}

export interface ReorderPlaylistSongParams {
  playlist_id: string;
  song_id: string;
  new_position: number;
}
