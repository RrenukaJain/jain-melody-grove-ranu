
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Playlist, PlaylistSong } from "../types";
import { 
  CreatePlaylistParams, 
  UpdatePlaylistParams, 
  AddSongToPlaylistParams,
  RemoveSongFromPlaylistParams,
  ReorderPlaylistSongParams
} from "./playlistsContextTypes";

// Helper to handle Clerk user ID format
const extractClerkUserId = (clerkId: string | undefined): string | null => {
  if (!clerkId) return null;
  
  // Clerk IDs typically start with "user_" - we need to remove this prefix
  if (clerkId.startsWith('user_')) {
    return clerkId.substring(5);
  }
  
  return clerkId;
};

// Create playlist mutation
export const useCreatePlaylistMutation = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: CreatePlaylistParams): Promise<Playlist | null> => {
      if (!userId) {
        toast.error("You must be logged in to create a playlist");
        return null;
      }

      console.log('Creating playlist for user ID:', userId);
      
      // Extract the clean user ID
      const cleanUserId = extractClerkUserId(userId);
      
      if (!cleanUserId) {
        toast.error("Invalid user ID");
        return null;
      }
      
      console.log('Using extracted user ID:', cleanUserId);
      
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          name: params.name,
          user_id: cleanUserId,
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
};

// Update playlist mutation
export const useUpdatePlaylistMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, params }: { id: string, params: UpdatePlaylistParams }): Promise<Playlist | null> => {
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
};

// Delete playlist mutation
export const useDeletePlaylistMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
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
};

// Add song to playlist mutation
export const useAddSongToPlaylistMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: AddSongToPlaylistParams): Promise<PlaylistSong | null> => {
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
};

// Remove song from playlist mutation
export const useRemoveSongFromPlaylistMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: RemoveSongFromPlaylistParams): Promise<void> => {
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
};

// Reorder playlist song mutation
export const useReorderPlaylistSongMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: ReorderPlaylistSongParams): Promise<void> => {
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
};
