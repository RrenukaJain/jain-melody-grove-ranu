
import { useCallback } from "react";
import { Song } from "../types";

export const useSongFilters = (
  songs: Song[] = [], 
  searchQuery: string = "", 
  categoryFilter: string | null = null
) => {
  // Filter songs based on search query
  const getFilteredSongs = useCallback(() => {
    if (!songs) return [];
    
    if (!searchQuery) return songs;

    const query = searchQuery.toLowerCase();
    return songs.filter(song => {
      const title = song.title?.toLowerCase() || '';
      const artist = song.artist?.toLowerCase() || '';
      return title.includes(query) || artist.includes(query);
    });
  }, [songs, searchQuery]);

  return {
    filteredSongs: getFilteredSongs()
  };
};
