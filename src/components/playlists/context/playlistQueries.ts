import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Playlist, PlaylistWithSongs } from "../types";
import { Song } from "../../songs/types";
import { toast } from "sonner";

// Query hook for fetching user playlists
export const usePlaylistsQuery = (userId: string | undefined, isAuthenticated: boolean) => {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      if (!isAuthenticated || !userId) return [];
      
      console.log('Fetching playlists for user:', userId);
      
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
    enabled: isAuthenticated && !!userId,
  });
};

// Function to fetch detailed playlist information
export const fetchPlaylistDetails = async (
  playlistId: string, 
  isAuthenticated: boolean, 
  userId: string | undefined,
  setIsFetchingDetails: (value: boolean) => void,
  setPlaylistDetails: (callback: (prev: Record<string, PlaylistWithSongs>) => Record<string, PlaylistWithSongs>) => void
): Promise<PlaylistWithSongs | null> => {
  if (!isAuthenticated || !userId) {
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
