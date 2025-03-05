
import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Playlist, 
  PlaylistWithSongs, 
  PlaylistSong
} from "../types";

import { PlaylistsContextType, 
  CreatePlaylistParams,
  UpdatePlaylistParams,
  AddSongToPlaylistParams,
  RemoveSongFromPlaylistParams,
  ReorderPlaylistSongParams
} from "./playlistsContextTypes";

import { 
  usePlaylistsQuery, 
  fetchPlaylistDetails 
} from "./playlistQueries";

import { 
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
  useAddSongToPlaylistMutation,
  useRemoveSongFromPlaylistMutation,
  useReorderPlaylistSongMutation
} from "./playlistMutations";

const PlaylistsContext = createContext<PlaylistsContextType | undefined>(undefined);

export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  
  // State for the active playlist and playlist details
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [playlistDetails, setPlaylistDetails] = useState<Record<string, PlaylistWithSongs>>({});
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  // Fetch playlists query
  const { data: playlists = [], isLoading } = usePlaylistsQuery(user?.id, isAuthenticated);
  
  // Set up all the mutations
  const createPlaylistMutation = useCreatePlaylistMutation(user?.id);
  const updatePlaylistMutation = useUpdatePlaylistMutation();
  const deletePlaylistMutation = useDeletePlaylistMutation();
  const addSongToPlaylistMutation = useAddSongToPlaylistMutation();
  const removeSongFromPlaylistMutation = useRemoveSongFromPlaylistMutation();
  const reorderPlaylistSongMutation = useReorderPlaylistSongMutation();
  
  // Function for fetching playlist details, wrapped to provide component state
  const handleFetchPlaylistDetails = async (playlistId: string) => {
    return fetchPlaylistDetails(
      playlistId, 
      isAuthenticated, 
      user?.id, 
      setIsFetchingDetails, 
      setPlaylistDetails
    );
  };
  
  // Context value
  const value: PlaylistsContextType = {
    playlists,
    playlistDetails,
    isLoading,
    isFetchingDetails,
    activePlaylistId,
    createPlaylist: async (params: CreatePlaylistParams) => {
      return await createPlaylistMutation.mutateAsync(params);
    },
    updatePlaylist: async (id: string, params: UpdatePlaylistParams) => {
      return await updatePlaylistMutation.mutateAsync({ id, params });
    },
    deletePlaylist: async (id: string) => {
      await deletePlaylistMutation.mutateAsync(id);
    },
    fetchPlaylistDetails: handleFetchPlaylistDetails,
    addSongToPlaylist: async (params: AddSongToPlaylistParams) => {
      return await addSongToPlaylistMutation.mutateAsync(params);
    },
    removeSongFromPlaylist: async (params: RemoveSongFromPlaylistParams) => {
      await removeSongFromPlaylistMutation.mutateAsync(params);
    },
    reorderPlaylistSong: async (params: ReorderPlaylistSongParams) => {
      await reorderPlaylistSongMutation.mutateAsync(params);
    },
    setActivePlaylistId,
  };
  
  return <PlaylistsContext.Provider value={value}>{children}</PlaylistsContext.Provider>;
}

export const usePlaylists = () => {
  const context = useContext(PlaylistsContext);
  if (context === undefined) {
    throw new Error("usePlaylists must be used within a PlaylistsProvider");
  }
  return context;
};
