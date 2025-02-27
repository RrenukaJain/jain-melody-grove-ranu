import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SongCard } from "./SongCard";
import { MusicControl } from "./MusicControl";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { Song } from "./types";

interface SongsProps {
  searchQuery?: string;
  categoryFilter?: string | null;
  featured?: boolean;
  ref?: React.RefObject<{
    handlePlaySong: (songId: string) => void;
  }>;
}

export const Songs = forwardRef<
  { handlePlaySong: (songId: string) => void },
  SongsProps
>(({ searchQuery = "", categoryFilter = null, featured = false }, ref) => {
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

  // Expose functions through ref
  useImperativeHandle(ref, () => ({
    handlePlaySong: (songId: string) => {
      if (!songs) return;
      const songIndex = songs.findIndex(song => song.id === songId);
      if (songIndex !== -1) {
        const song = songs[songIndex];
        handlePlayPause(song.id, song.file_url, songIndex);
      }
    },
    isPlaying: () => isPlaying,
    getCurrentlyPlayingSongId: () => currentlyPlaying,
    togglePlayPause: () => {
      if (audioRef) {
        handleControlPlayPause();
      }
    }
  }));

  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

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

  const filteredSongs = useCallback(() => {
    if (!songs) return [];
    
    if (!searchQuery) return songs;

    const query = searchQuery.toLowerCase();
    return songs.filter(song => {
      const title = song.title?.toLowerCase() || '';
      const artist = song.artist?.toLowerCase() || '';
      return title.includes(query) || artist.includes(query);
    });
  }, [songs, searchQuery]);

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

  const getCurrentSong = useCallback(() => {
    if (!songs || currentSongIndex === -1) return null;
    return songs[currentSongIndex];
  }, [songs, currentSongIndex]);

  const handleControlPlayPause = () => {
    if (isPlaying) {
      audioRef?.pause();
      setIsPlaying(false);
    } else {
      audioRef?.play();
      setIsPlaying(true);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8 text-white">Loading songs...</div>;
  }

  const displaySongs = filteredSongs();

  return (
    <div className={`container mx-auto px-4 py-8 ${!featured ? 'mb-32' : ''}`}>
      {!featured && <h2 className="text-2xl font-bold mb-6 text-white">
        {categoryFilter ? `${categoryFilter} Songs` : 'All Songs'}
      </h2>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displaySongs.map((song, index) => (
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
}
);
