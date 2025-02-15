
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, Loader2 } from "lucide-react";
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
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const { toast } = useToast();
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const loadingTimeout = useRef<NodeJS.Timeout>();

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

  const preloadAudio = async (fileUrl: string): Promise<HTMLAudioElement> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => {
        resolve(audio);
      }, { once: true });

      audio.addEventListener('error', () => {
        reject(new Error("Failed to load audio"));
      }, { once: true });

      audio.preload = "auto";
      audio.src = fileUrl;
      audio.load();
    });
  };

  const handlePlayPause = async (songId: string, fileUrl: string, index: number) => {
    // If clicking the same song that's currently playing
    if (currentlyPlaying === songId) {
      audioRef?.pause();
      setIsPlaying(false);
      setCurrentlyPlaying(null);
      return;
    }

    // Stop current audio if any
    if (audioRef) {
      audioRef.pause();
      audioRef.src = "";
    }

    // Show loading state
    setIsLoadingSong(true);
    // Clear any existing timeout
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
    }
    // Set a timeout to show error if loading takes too long
    loadingTimeout.current = setTimeout(() => {
      setIsLoadingSong(false);
      toast({
        variant: "destructive",
        title: "Loading timeout",
        description: "The song is taking too long to load. Please try again.",
      });
    }, 10000); // 10 second timeout

    try {
      const audio = await preloadAudio(fileUrl);
      
      // Clear the timeout since loading succeeded
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }

      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
        setIsPlaying(false);
      });

      audio.addEventListener('error', () => {
        setIsLoadingSong(false);
        toast({
          variant: "destructive",
          title: "Error playing song",
          description: "There was an error playing this song. Please try again later.",
        });
      });

      setAudioRef(audio);
      setCurrentlyPlaying(songId);
      setCurrentSongIndex(index);
      setIsPlaying(true);
      setIsLoadingSong(false);

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoadingSong(false);
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
      toast({
        variant: "destructive",
        title: "Playback error",
        description: "Unable to play this song. The file might be unavailable.",
      });
    }
  };

  const handleNext = async () => {
    if (!songs || currentSongIndex === -1) return;
    const nextIndex = (currentSongIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    await handlePlayPause(nextSong.id, nextSong.file_url, nextIndex);
  };

  const handlePrevious = async () => {
    if (!songs || currentSongIndex === -1) return;
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];
    await handlePlayPause(prevSong.id, prevSong.file_url, prevIndex);
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
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, []);

  if (isLoading) {
    return <div className="flex justify-center p-8 text-white">Loading songs...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-32">
      <h2 className="text-2xl font-bold mb-6 text-white">Featured Jain Songs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs?.map((song, index) => (
          <div
            key={song.id}
            className="bg-[#181818] rounded-lg p-6 hover:bg-[#282828] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-white">{song.title}</h3>
                <p className="text-gray-400 mb-2">{song.artist}</p>
                <p className="text-sm text-gray-500">
                  Duration: {song.duration}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#1DB954] hover:text-[#1ed760] relative"
                onClick={() => handlePlayPause(song.id, song.file_url, index)}
                disabled={isLoadingSong}
              >
                {isLoadingSong && currentlyPlaying === song.id ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : currentlyPlaying === song.id ? (
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
