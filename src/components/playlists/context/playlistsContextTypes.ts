
import { Playlist, PlaylistWithSongs, PlaylistSong } from "../types";

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

export interface PlaylistsContextType {
  playlists: Playlist[];
  playlistDetails: Record<string, PlaylistWithSongs>;
  isLoading: boolean;
  isFetchingDetails: boolean;
  activePlaylistId: string | null;
  createPlaylist: (params: CreatePlaylistParams) => Promise<Playlist | null>;
  updatePlaylist: (id: string, params: UpdatePlaylistParams) => Promise<Playlist | null>;
  deletePlaylist: (id: string) => Promise<void>;
  fetchPlaylistDetails: (id: string) => Promise<PlaylistWithSongs | null>;
  addSongToPlaylist: (params: AddSongToPlaylistParams) => Promise<PlaylistSong | null>;
  removeSongFromPlaylist: (params: RemoveSongFromPlaylistParams) => Promise<void>;
  reorderPlaylistSong: (params: ReorderPlaylistSongParams) => Promise<void>;
  setActivePlaylistId: (id: string | null) => void;
}
