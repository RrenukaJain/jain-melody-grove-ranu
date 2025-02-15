
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

interface AudioCache {
  [key: string]: {
    audio: HTMLAudioElement;
    lastUsed: number;
  };
}

const CACHE_SIZE_LIMIT = 5; // Maximum number of songs to keep in cache

export const Songs = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const { toast } = useToast();
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const loadingTimeout = useRef<NodeJS.Timeout>();
  const audioCache = useRef<AudioCache>({});
  const preloadQueue = useRef<Set<string>>(new Set());

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

  // Cache management functions
  const cleanupCache = () => {
    const entries = Object.entries(audioCache.current);
    if (entries.length > CACHE_SIZE_LIMIT) {
      const sortedEntries = entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
      const entriesToRemove = sortedEntries.slice(0, entries.length - CACHE_SIZE_LIMIT);
      
      entriesToRemove.forEach(([id, { audio }]) => {
        audio.src = '';
        delete audioCache.current[id];
      });
    }
  };

  const preloadAudio = async (fileUrl: string, songId: string): Promise<HTMLAudioElement> => {
    // Check if already in cache
    if (audioCache.current[songId]) {
      audioCache.current[songId].lastUsed = Date.now();
      return audioCache.current[songId].audio;
    }

    // If already being preloaded, wait for it
    if (preloadQueue.current.has(songId)) {
      return new Promise((resolve, reject) => {
        const checkCache = setInterval(() => {
          if (audioCache.current[songId]) {
            clearInterval(checkCache);
            resolve(audioCache.current[songId].audio);
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkCache);
          reject(new Error("Preload timeout"));
        }, 10000);
      });
    }

    preloadQueue.current.add(songId);

    try {
      const audio = new Audio();
      
      const loadPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
        audio.addEventListener('error', reject, { once: true });
      });

      audio.preload = "auto";
      audio.src = fileUrl;
      audio.load();

      const loadedAudio = await loadPromise;
      
      // Add to cache
      audioCache.current[songId] = {
        audio: loadedAudio,
        lastUsed: Date.now()
      };

      cleanupCache();
      return loadedAudio;
    } finally {
      preloadQueue.current.delete(songId);
    }
  };

  // Preload next and previous songs
  const preloadAdjacentSongs = async () => {
    if (!songs || currentSongIndex === -1) return;

    const nextIndex = (currentSongIndex + 1) % songs.length;
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;

    // Preload next song
    preloadAudio(songs[nextIndex].file_url, songs[nextIndex].id).catch(() => {
      // Silently fail for preloading
      console.log("Failed to preload next song");
    });

    // Preload previous song
    preloadAudio(songs[prevIndex].file_url, songs[prevIndex].id).catch(() => {
      // Silently fail for preloading
      console.log("Failed to preload previous song");
    });
  };

  useEffect(() => {
    if (currentSongIndex !== -1) {
      preloadAdjacentSongs();
    }
  }, [currentSongIndex, songs]);

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

    setIsLoadingSong(true);
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
    }

    loadingTimeout.current = setTimeout(() => {
      setIsLoadingSong(false);
      toast({
        variant: "destructive",
        title: "Loading timeout",
        description: "The song is taking too long to load. Please try again.",
      });
    }, 10000);

    try {
      const audio = await preloadAudio(fileUrl, songId);
      
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
      // Cleanup all cached audio elements
      Object.values(audioCache.current).forEach(({ audio }) => {
        audio.src = '';
      });
      audioCache.current = {};
      
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
                className="text-[#1DB954] hover:text-[#1ed760]"
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
