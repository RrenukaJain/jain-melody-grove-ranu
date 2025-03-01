
import { useImperativeHandle, forwardRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SongCard } from "./SongCard";
import { Song } from "./types";
import { useSongFilters } from "./hooks/useSongFilters";
import { useMusicPlayer } from "./context/MusicPlayerContext";

interface SongsProps {
  searchQuery?: string;
  categoryFilter?: string | null;
  featured?: boolean;
  ref?: React.RefObject<{
    handlePlaySong: (songId: string) => void;
    isPlaying: () => boolean;
    getCurrentlyPlayingSongId: () => string | null;
    togglePlayPause: () => void;
  }>;
}

export const Songs = forwardRef<
  { 
    handlePlaySong: (songId: string) => void;
    isPlaying: () => boolean;
    getCurrentlyPlayingSongId: () => string | null;
    togglePlayPause: () => void;
  },
  SongsProps
>(({ searchQuery = "", categoryFilter = null, featured = false }, ref) => {
  // Fetch songs from supabase
  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['songs', { featured, categoryFilter }],
    queryFn: async () => {
      let query = supabase
        .from('songs')
        .select('*');

      if (featured) {
        query = query.limit(5).order('created_at', { ascending: false });
      } else {
        query = query.order('title');
      }

      if (categoryFilter) {
        query = query.eq('artist', categoryFilter);
      }

      const { data, error } = await query
      
      if (error) throw error;
      return data as Song[];
    },
  });

  // Use global music player context
  const { 
    currentlyPlaying, 
    isPlaying, 
    isLoadingSong, 
    handlePlayPause,
    setAllSongs
  } = useMusicPlayer();

  // Update the global songs list when songs change
  useEffect(() => {
    if (songs && songs.length > 0) {
      setAllSongs(prev => {
        // Merge with previous songs, removing duplicates
        const songMap = new Map();
        [...prev, ...songs].forEach(song => {
          songMap.set(song.id, song);
        });
        return Array.from(songMap.values());
      });
    }
  }, [songs, setAllSongs]);

  // Use custom hook for filters
  const { filteredSongs } = useSongFilters(songs, searchQuery, categoryFilter);

  // Expose functions through ref
  useImperativeHandle(ref, () => ({
    handlePlaySong: (songId: string) => {
      if (!songs) return;
      const songIndex = songs.findIndex(song => song.id === songId);
      if (songIndex !== -1) {
        const song = songs[songIndex];
        handlePlayPause(song.id, song.file_url, songIndex, songs);
      }
    },
    isPlaying: () => isPlaying,
    getCurrentlyPlayingSongId: () => currentlyPlaying,
    togglePlayPause: () => {
      // Will be implemented by the context
    }
  }));

  if (isLoading) {
    return <div className="flex justify-center p-8 text-white">Loading songs...</div>;
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${!featured ? 'mb-8' : ''}`}>
      {!featured && <h2 className="text-2xl font-bold mb-6 text-white">
        {categoryFilter ? `${categoryFilter} Songs` : 'All Songs'}
      </h2>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSongs.map((song, index) => (
          <SongCard
            key={song.id}
            song={song}
            index={index}
            isPlaying={isPlaying}
            isLoading={isLoadingSong}
            currentlyPlaying={currentlyPlaying}
            onPlayPause={(songId, fileUrl, idx) => handlePlayPause(songId, fileUrl, idx, songs)}
          />
        ))}
      </div>
    </div>
  );
});
