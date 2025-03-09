
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "sonner";
import { Playlist } from "../../types";
import { 
  CreatePlaylistParams, 
  UpdatePlaylistParams 
} from "../playlistsContextTypes";
import { extractClerkUserId } from "../utils/userIdHelper";

/**
 * Hook to create a new playlist
 */
export const useCreatePlaylistMutation = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  
  const supabaseClient = useSupabaseAuth();
  
  return useMutation({
    mutationFn: async (params: CreatePlaylistParams): Promise<Playlist | null> => {
      if (!userId) {
        toast.error("You must be logged in to create a playlist");
        return null;
      }

      console.log('Creating playlist for user ID:', userId);
      
      // Extract the clean user ID
      console.log('About to convert user ID:', userId);
      console.log('Type of userId:', typeof userId);
      
      // Force the userId to be a string
      const userIdString = String(userId);
      console.log('Forced to string:', userIdString);
      
      const cleanUserId = extractClerkUserId(userIdString);
      
      if (!cleanUserId) {
        toast.error("Invalid user ID");
        return null;
      }
      
      console.log('Using extracted user ID:', cleanUserId);
      console.log('This ID should be deterministic and consistent across calls');
      console.log('Is this a valid UUID?', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUserId));
      
      // Check if we have an authenticated client
      const authHeader = (supabaseClient as any)?.headers?.Authorization;
      console.log('Auth header present:', !!authHeader);
      
      try {
        console.log('Inserting playlist with name:', params.name);
        
        const { data, error } = await supabaseClient
          .from('playlists')
          .insert({
            name: params.name,
            user_id: cleanUserId,
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error creating playlist:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        
        console.log('Playlist created successfully:', data);
        return data as Playlist;
      } catch (error: any) {
        console.error('Exception creating playlist:', error);
        throw error;
      }
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

/**
 * Hook to update an existing playlist
 */
export const useUpdatePlaylistMutation = () => {
  const queryClient = useQueryClient();
  const supabaseClient = useSupabaseAuth();
  
  return useMutation({
    mutationFn: async ({ id, params }: { id: string, params: UpdatePlaylistParams }): Promise<Playlist | null> => {
      const { data, error } = await supabaseClient
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

/**
 * Hook to delete a playlist
 */
export const useDeletePlaylistMutation = () => {
  const queryClient = useQueryClient();
  const supabaseClient = useSupabaseAuth();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabaseClient
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
