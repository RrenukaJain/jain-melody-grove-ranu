
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SongCard } from "./SongCard";
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
    if (songs && currentSongIndex !== -1) {
      preloadAdjacentSongs(songs);
    }
  }, [currentSongIndex, songs]);

  const handleNext = () => {
    if (!songs || currentSongIndex === -1) return;
    const nextIndex = (currentSongIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    handlePlayPause(nextSong.id, nextSong.file_url, nextIndex);
  };

  const handlePrevious = () => {
    if (!songs || currentSongIndex === -1) return;
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];
    handlePlayPause(prevSong.id, prevSong.file_url, prevIndex);
  };

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

  if (isLoading) {
    return <div className="flex justify-center p-8 text-white">Loading songs...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-32">
      <h2 className="text-2xl font-bold mb-6 text-white">Featured Jain Songs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs?.map((song, index) => (
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
      />
    </div>
  );
};
