
import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SongCard } from "./SongCard";
import { SearchAndFilter } from "./SearchAndFilter";
import { MusicControl } from "./MusicControl";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { Song } from "./types";

export const Songs = () => {
  const {
    currentlyPlaying,
    isPlaying,
    isLoadingSong,
    audioRef,
    currentSongIndex,
    setIsPlaying,
    handlePlayPause,
    preloadAdjacentSongs,
  } = useAudioPlayer();

  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<"title" | "duration" | "popularity">("title");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: songs, isLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data as Song[];
    },
  });

  useEffect(() => {
    if (songs) {
      setShuffledIndices(Array.from({ length: songs.length }, (_, i) => i));
    }
  }, [songs]);

  const shuffleArray = useCallback((array: number[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  const handleToggleShuffle = useCallback(() => {
    setIsShuffleOn(prev => {
      if (!prev && songs) {
        setShuffledIndices(shuffleArray(Array.from({ length: songs.length }, (_, i) => i)));
      }
      return !prev;
    });
  }, [songs, shuffleArray]);

  const handleToggleRepeat = useCallback(() => {
    setIsRepeatOn(prev => !prev);
  }, []);

  const handleSortChange = (newSortBy: "title" | "duration" | "popularity") => {
    setSortBy(newSortBy);
  };

  const handleSortOrderChange = () => {
    setSortOrder(current => current === "asc" ? "desc" : "asc");
  };

  useEffect(() => {
    if (!audioRef) return;

    const handleEnded = () => {
      if (isRepeatOn) {
        audioRef.currentTime = 0;
        audioRef.play();
      } else {
        handleNext();
      }
    };

    audioRef.addEventListener('ended', handleEnded);
    return () => audioRef.removeEventListener('ended', handleEnded);
  }, [audioRef, isRepeatOn]);

  useEffect(() => {
    if (songs && currentSongIndex !== -1) {
      preloadAdjacentSongs(songs, currentSongIndex);
    }
  }, [currentSongIndex, songs, preloadAdjacentSongs]);

  const getNextIndex = useCallback(() => {
    if (!songs) return -1;
    if (isShuffleOn) {
      const currentShuffleIndex = shuffledIndices.indexOf(currentSongIndex);
      return shuffledIndices[(currentShuffleIndex + 1) % songs.length];
    }
    return (currentSongIndex + 1) % songs.length;
  }, [songs, currentSongIndex, isShuffleOn, shuffledIndices]);

  const getPreviousIndex = useCallback(() => {
    if (!songs) return -1;
    if (isShuffleOn) {
      const currentShuffleIndex = shuffledIndices.indexOf(currentSongIndex);
      return shuffledIndices[(currentShuffleIndex - 1 + songs.length) % songs.length];
    }
    return (currentSongIndex - 1 + songs.length) % songs.length;
  }, [songs, currentSongIndex, isShuffleOn, shuffledIndices]);

  const handleNext = useCallback(() => {
    if (!songs || currentSongIndex === -1) return;
    const nextIndex = getNextIndex();
    const nextSong = songs[nextIndex];
    handlePlayPause(nextSong.id, nextSong.file_url, nextIndex);
  }, [songs, currentSongIndex, getNextIndex, handlePlayPause]);

  const handlePrevious = useCallback(() => {
    if (!songs || currentSongIndex === -1) return;
    const prevIndex = getPreviousIndex();
    const prevSong = songs[prevIndex];
    handlePlayPause(prevSong.id, prevSong.file_url, prevIndex);
  }, [songs, currentSongIndex, getPreviousIndex, handlePlayPause]);

  const getCurrentSong = () => {
    if (!songs || currentSongIndex === -1) return null;
    return songs[currentSongIndex];
  };

  const handleControlPlayPause = () => {
    if (isPlaying) {
      audioRef?.pause();
      setIsPlaying(false);
    } else {
      audioRef?.play();
      setIsPlaying(true);
    }
  };

  const filteredAndSortedSongs = useCallback(() => {
    if (!songs) return [];

    let filtered = [...songs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(song => {
        const title = song.title?.toLowerCase() || '';
        const artist = song.artist?.toLowerCase() || '';
        return title.includes(query) || artist.includes(query);
      });
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(song => song.category === selectedCategory);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") {
        comparison = (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === "duration") {
        comparison = (a.duration || '').localeCompare(b.duration || '');
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [songs, searchQuery, selectedCategory, sortBy, sortOrder]);

  if (isLoading) {
    return <div className="flex justify-center p-8 text-white">Loading songs...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-32">
      <h2 className="text-2xl font-bold mb-6 text-white">Featured Jain Songs</h2>
      
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOrder={sortOrder}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onSortOrderChange={handleSortOrderChange}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="grid grid-cols-1 gap-2">
        {filteredAndSortedSongs().map((song, index) => (
          <SongCard
            key={song.id}
            song={song}
            index={index}
            isPlaying={isPlaying}
            isLoading={isLoadingSong}
            currentlyPlaying={currentlyPlaying}
            onPlayPause={handlePlayPause}
          />
        ))}
      </div>

      <MusicControl
        currentSong={getCurrentSong()}
        audio={audioRef}
        onPlayPause={handleControlPlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isPlaying={isPlaying}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        isShuffleOn={isShuffleOn}
        isRepeatOn={isRepeatOn}
      />
    </div>
  );
};
