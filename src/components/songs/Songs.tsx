
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { MusicControl } from "./MusicControl";

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  file_url: string;
}

export const Songs = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);

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

  const handlePlayPause = (songId: string, fileUrl: string, index: number) => {
    if (currentlyPlaying === songId) {
      audioRef?.pause();
      setIsPlaying(false);
      setCurrentlyPlaying(null);
    } else {
      if (audioRef) {
        audioRef.pause();
      }

      const audio = new Audio(fileUrl);
      audio.addEventListener('error', () => {
        toast({
          variant: "destructive",
          title: "Error playing song",
          description: "There was an error playing this song. Please try again later.",
        });
      });

      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        toast({
          variant: "destructive",
          title: "Playback error",
          description: "Unable to play this song. The file might be unavailable.",
        });
      });

      setAudioRef(audio);
      setCurrentlyPlaying(songId);
      setCurrentSongIndex(index);
      setIsPlaying(true);

      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
        setIsPlaying(false);
      });
    }
  };

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

  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.src = "";
      }
    };
  }, []);

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading songs...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-32">
      <h2 className="text-2xl font-bold mb-6">Featured Jain Songs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs?.map((song, index) => (
          <div
            key={song.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{song.title}</h3>
                <p className="text-gray-600 mb-2">{song.artist}</p>
                <p className="text-sm text-gray-500">
                  Duration: {song.duration}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary/80"
                onClick={() => handlePlayPause(song.id, song.file_url, index)}
              >
                {currentlyPlaying === song.id ? (
                  <PauseCircle className="h-6 w-6" />
                ) : (
                  <PlayCircle className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
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
