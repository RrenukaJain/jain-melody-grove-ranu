
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { 
  Playlist, 
  PlaylistWithSongs, 
  PlaylistSong, 
  CreatePlaylistParams,
  UpdatePlaylistParams,
  AddSongToPlaylistParams,
  RemoveSongFromPlaylistParams,
  ReorderPlaylistSongParams
} from "../types";
import { Song } from "@/components/songs/types";

interface PlaylistsContextType {
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

const PlaylistsContext = createContext<PlaylistsContextType | undefined>(undefined);

export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  
  // Get all playlists for the current user
  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      if (!isAuthenticated || !user) return [];
      
      console.log('Fetching playlists for user:', user.id);
      
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching playlists:', error);
        throw error;
      }
      
      return data as Playlist[];
    },
    enabled: isAuthenticated && !!user,
  });
  
  // State to track detailed playlist data
  const [playlistDetails, setPlaylistDetails] = useState<Record<string, PlaylistWithSongs>>({});
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  // Create playlist mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async (params: CreatePlaylistParams): Promise<Playlist | null> => {
      if (!isAuthenticated || !user) {
        toast.error("You must be logged in to create a playlist");
        return null;
      }

      console.log('Creating playlist for user:', user.id);
      
      // Extract UUID part if the user ID is in Clerk format (user_xxx)
      let userId = user.id;
      
      // For storing in Supabase, we need to handle the user_id format for our database
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          name: params.name,
          user_id: userId,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating playlist:', error);
        throw error;
      }
      
      return data as Playlist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success("Playlist created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create playlist: ${error.message}`);
    },
  });
  
  // Update playlist mutation
  const updatePlaylistMutation = useMutation({
    mutationFn: async ({ id, params }: { id: string, params: UpdatePlaylistParams }): Promise<Playlist | null> => {
      if (!isAuthenticated || !user) {
        toast.error("You must be logged in to update a playlist");
        return null;
      }
      
      const { data, error } = await supabase
        .from('playlists')
        .update(params)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating playlist:', error);
        throw error;
      }
      
      return data as Playlist;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.id] });
      toast.success("Playlist updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update playlist: ${error.message}`);
    },
  });
  
  // Delete playlist mutation
  const deletePlaylistMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!isAuthenticated || !user) {
        toast.error("You must be logged in to delete a playlist");
        return;
      }
      
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting playlist:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success("Playlist deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete playlist: ${error.message}`);
    },
  });
  
  // Add song to playlist mutation
  const addSongToPlaylistMutation = useMutation({
    mutationFn: async (params: AddSongToPlaylistParams): Promise<PlaylistSong | null> => {
      if (!isAuthenticated || !user) {
        toast.error("You must be logged in to add songs to a playlist");
        return null;
      }
      
      // Get the current max order position
      const { data: existingSongs, error: fetchError } = await supabase
        .from('playlist_songs')
        .select('order_position')
        .eq('playlist_id', params.playlist_id)
        .order('order_position', { ascending: false })
        .limit(1);
        
      if (fetchError) {
        console.error('Error fetching playlist songs:', fetchError);
        throw fetchError;
      }
      
      // Set the order position to max + 1 or 0 if no songs exist
      const nextPosition = params.order_position !== undefined 
        ? params.order_position 
        : (existingSongs.length > 0 ? existingSongs[0].order_position + 1 : 0);
      
      // Add the song
      const { data, error } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: params.playlist_id,
          song_id: params.song_id,
          order_position: nextPosition,
        })
        .select()
        .single();
        
      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          toast.error("This song is already in the playlist");
          return null;
        }
        console.error('Error adding song to playlist:', error);
        throw error;
      }
      
      return data as PlaylistSong;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.playlist_id] });
      toast.success("Song added to playlist");
    },
    onError: (error) => {
      toast.error(`Failed to add song to playlist: ${error.message}`);
    },
  });
  
  // Remove song from playlist mutation
  const removeSongFromPlaylistMutation = useMutation({
    mutationFn: async (params: RemoveSongFromPlaylistParams): Promise<void> => {
      if (!isAuthenticated || !user) {
        toast.error("You must be logged in to remove songs from a playlist");
        return;
      }
      
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', params.playlist_id)
        .eq('song_id', params.song_id);
        
      if (error) {
        console.error('Error removing song from playlist:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.playlist_id] });
      toast.success("Song removed from playlist");
    },
    onError: (error) => {
      toast.error(`Failed to remove song from playlist: ${error.message}`);
    },
  });
  
  // Reorder playlist song mutation
  const reorderPlaylistSongMutation = useMutation({
    mutationFn: async (params: ReorderPlaylistSongParams): Promise<void> => {
      if (!isAuthenticated || !user) {
        toast.error("You must be logged in to reorder songs in a playlist");
        return;
      }
      
      // First, get all songs in the playlist
      const { data: playlistSongs, error: fetchError } = await supabase
        .from('playlist_songs')
        .select('id, song_id, order_position')
        .eq('playlist_id', params.playlist_id)
        .order('order_position', { ascending: true });
        
      if (fetchError) {
        console.error('Error fetching playlist songs:', fetchError);
        throw fetchError;
      }
      
      const songIndex = playlistSongs.findIndex(item => item.song_id === params.song_id);
      
      if (songIndex === -1) {
        throw new Error('Song not found in playlist');
      }
      
      // Create a copy and move the song
      const reorderedSongs = [...playlistSongs];
      const [movedSong] = reorderedSongs.splice(songIndex, 1);
      reorderedSongs.splice(params.new_position, 0, movedSong);
      
      // Update all positions
      const updates = reorderedSongs.map((song, index) => ({
        id: song.id,
        order_position: index,
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('playlist_songs')
          .update({ order_position: update.order_position })
          .eq('id', update.id);
          
        if (error) {
          console.error('Error updating song order:', error);
          throw error;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.playlist_id] });
      toast.success("Playlist order updated");
    },
    onError: (error) => {
      toast.error(`Failed to reorder playlist: ${error.message}`);
    },
  });
  
  // Function to fetch detailed playlist information
  const fetchPlaylistDetails = async (playlistId: string): Promise<PlaylistWithSongs | null> => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to view playlist details");
      return null;
    }
    
    setIsFetchingDetails(true);
    
    try {
      // Get playlist basic info
      const { data: playlist, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', playlistId)
        .single();
        
      if (playlistError) {
        throw playlistError;
      }
      
      // Get playlist songs with their order
      const { data: playlistSongs, error: songsError } = await supabase
        .from('playlist_songs')
        .select('*, song_id')
        .eq('playlist_id', playlistId)
        .order('order_position', { ascending: true });
        
      if (songsError) {
        throw songsError;
      }
      
      // Get full song details
      const songIds = playlistSongs.map(item => item.song_id);
      
      if (songIds.length === 0) {
        // No songs in playlist, return empty array
        const result = {
          ...playlist,
          songs: [],
        } as PlaylistWithSongs;
        
        setPlaylistDetails(prev => ({
          ...prev,
          [playlistId]: result,
        }));
        
        return result;
      }
      
      const { data: songs, error: fetchSongsError } = await supabase
        .from('songs')
        .select('*')
        .in('id', songIds);
        
      if (fetchSongsError) {
        throw fetchSongsError;
      }
      
      // Map songs according to playlist order
      const orderedSongs = playlistSongs.map(playlistSong => {
        return songs.find(song => song.id === playlistSong.song_id);
      }).filter(Boolean) as Song[];
      
      const result = {
        ...playlist,
        songs: orderedSongs,
      } as PlaylistWithSongs;
      
      // Update cache
      setPlaylistDetails(prev => ({
        ...prev,
        [playlistId]: result,
      }));
      
      return result;
    } catch (error) {
      console.error('Error fetching playlist details:', error);
      toast.error("Failed to load playlist details");
      return null;
    } finally {
      setIsFetchingDetails(false);
    }
  };
  
  // Context value
  const value = {
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
    fetchPlaylistDetails,
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
