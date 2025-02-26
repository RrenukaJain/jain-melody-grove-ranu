import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAudioPreloader } from "./useAudioPreloader";
import { useAudioCache } from "./useAudioCache";
import { cleanupAudio } from "./utils/audioUtils";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export const useAudioPlayer = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const loadingTimeout = useRef<NodeJS.Timeout>();
  const retryCount = useRef(0);
  const { toast } = useToast();

  const { preloadAudio, preloadAdjacentSongs } = useAudioPreloader();
  const { cleanup: cleanupCache } = useAudioCache();

  const retryWithDelay = async (fn: () => Promise<any>) => {
    while (retryCount.current < MAX_RETRIES) {
      try {
        return await fn();
      } catch (error) {
        retryCount.current++;
        if (retryCount.current === MAX_RETRIES) throw error;
        
        toast({
          title: "Retrying...",
          description: `Attempt ${retryCount.current} of ${MAX_RETRIES}`,
        });
        
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  };

  const handleLoadingProgress = (audio: HTMLAudioElement) => {
    audio.addEventListener('progress', () => {
      if (audio.duration > 0) {
        const buffered = audio.buffered;
        if (buffered.length > 0) {
          const loaded = buffered.end(buffered.length - 1);
          const progress = (loaded / audio.duration) * 100;
          setLoadingProgress(Math.round(progress));
        }
      }
    });
  };

  const handlePlayPause = async (songId: string, fileUrl: string, index: number) => {
    if (currentlyPlaying === songId) {
      if (audioRef) {
        audioRef.pause();
        setIsPlaying(false);
        setCurrentlyPlaying(null);
      }
      return;
    }

    if (audioRef) {
      await cleanupAudio(audioRef);
    }

    setIsLoadingSong(true);
    setCurrentlyPlaying(songId);
    setLoadingProgress(0);
    retryCount.current = 0;
    
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
    }

    loadingTimeout.current = setTimeout(() => {
      setIsLoadingSong(false);
      setCurrentlyPlaying(null);
      setLoadingProgress(0);
      toast({
        variant: "destructive",
        title: "Loading timeout",
        description: "The song is taking too long to load. Please try again.",
      });
    }, 10000);

    try {
      const audio = await retryWithDelay(() => preloadAudio(fileUrl, songId));
      
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }

      handleLoadingProgress(audio);

      const onEnded = () => {
        setCurrentlyPlaying(null);
        setIsPlaying(false);
        setLoadingProgress(0);
      };

      audio.addEventListener('ended', onEnded);

      setAudioRef(audio);
      setCurrentSongIndex(index);
      setIsPlaying(true);
      setIsLoadingSong(false);

      try {
        await audio.play();
      } catch (error) {
        console.error('Playback error:', error);
        await cleanupAudio(audio);
        setIsLoadingSong(false);
        setCurrentlyPlaying(null);
        setIsPlaying(false);
        setLoadingProgress(0);
        
        toast({
          variant: "destructive",
          title: "Playback error",
          description: "Unable to play this song. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoadingSong(false);
      setCurrentlyPlaying(null);
      setIsPlaying(false);
      setLoadingProgress(0);
      
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
      
      toast({
        variant: "destructive",
        title: "Loading error",
        description: "Unable to load this song after multiple attempts. Please try again.",
      });
    }
  };

  useEffect(() => {
    return () => {
      cleanupCache();
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, [cleanupCache]);

  return {
    currentlyPlaying,
    isPlaying,
    isLoadingSong,
    loadingProgress,
    audioRef,
    currentSongIndex,
    setIsPlaying,
    handlePlayPause,
    preloadAdjacentSongs,
  };
};
