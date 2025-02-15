
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AudioCache, Song } from "../types";

const CACHE_SIZE_LIMIT = 5;

export const useAudioPlayer = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const loadingTimeout = useRef<NodeJS.Timeout>();
  const audioCache = useRef<AudioCache>({});
  const preloadQueue = useRef<Set<string>>(new Set());
  const { toast } = useToast();

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
    if (audioCache.current[songId]) {
      audioCache.current[songId].lastUsed = Date.now();
      return audioCache.current[songId].audio;
    }

    if (preloadQueue.current.has(songId)) {
      return new Promise((resolve, reject) => {
        const checkCache = setInterval(() => {
          if (audioCache.current[songId]) {
            clearInterval(checkCache);
            resolve(audioCache.current[songId].audio);
          }
        }, 100);

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
        audio.addEventListener('error', (e) => {
          console.error('Audio loading error:', e);
          reject(new Error("Failed to load audio"));
        }, { once: true });
      });

      audio.preload = "auto";
      audio.src = fileUrl;
      audio.load();

      const loadedAudio = await loadPromise;
      
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

  const preloadAdjacentSongs = async (songs: Song[]) => {
    if (!songs || currentSongIndex === -1) return;

    const nextIndex = (currentSongIndex + 1) % songs.length;
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;

    preloadAudio(songs[nextIndex].file_url, songs[nextIndex].id).catch(() => {
      console.log("Failed to preload next song");
    });

    preloadAudio(songs[prevIndex].file_url, songs[prevIndex].id).catch(() => {
      console.log("Failed to preload previous song");
    });
  };

  const handlePlayPause = async (songId: string, fileUrl: string, index: number) => {
    if (currentlyPlaying === songId) {
      audioRef?.pause();
      setIsPlaying(false);
      setCurrentlyPlaying(null);
      return;
    }

    if (audioRef) {
      audioRef.pause();
      audioRef.src = "";
    }

    setIsLoadingSong(true);
    setCurrentlyPlaying(songId);
    
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
    }

    loadingTimeout.current = setTimeout(() => {
      setIsLoadingSong(false);
      setCurrentlyPlaying(null);
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

      setAudioRef(audio);
      setCurrentSongIndex(index);
      setIsPlaying(true);
      setIsLoadingSong(false);

      await audio.play().catch((error) => {
        console.error('Playback error:', error);
        setIsLoadingSong(false);
        setCurrentlyPlaying(null);
        toast({
          variant: "destructive",
          title: "Playback error",
          description: "Unable to play this song. Please try again.",
        });
      });
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoadingSong(false);
      setCurrentlyPlaying(null);
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
      toast({
        variant: "destructive",
        title: "Loading error",
        description: "Unable to load this song. Please try again.",
      });
    }
  };

  useEffect(() => {
    return () => {
      Object.values(audioCache.current).forEach(({ audio }) => {
        audio.src = '';
      });
      audioCache.current = {};
      
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, []);

  return {
    currentlyPlaying,
    isPlaying,
    isLoadingSong,
    audioRef,
    currentSongIndex,
    setIsPlaying,
    handlePlayPause,
    preloadAdjacentSongs,
  };
};
