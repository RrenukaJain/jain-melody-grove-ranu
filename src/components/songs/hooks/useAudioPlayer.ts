
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAudioPreloader } from "./useAudioPreloader";
import { useAudioCache } from "./useAudioCache";
import { cleanupAudio } from "./utils/audioUtils";

export const useAudioPlayer = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const loadingTimeout = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const { preloadAudio, preloadAdjacentSongs } = useAudioPreloader();
  const { cleanup: cleanupCache } = useAudioCache();

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

      const onEnded = () => {
        setCurrentlyPlaying(null);
        setIsPlaying(false);
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
    audioRef,
    currentSongIndex,
    setIsPlaying,
    handlePlayPause,
    preloadAdjacentSongs,
  };
};
