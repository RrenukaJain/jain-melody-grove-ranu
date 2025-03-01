
import { useState, useCallback, useRef, useEffect } from "react";
import { Song } from "../types";
import { useAudioPlayer } from "./useAudioPlayer";

export const useSongsPlayer = (songs: Song[] = []) => {
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

  // Shuffle and repeat state
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  // Initialize shuffled indices when songs change
  useEffect(() => {
    if (songs) {
      setShuffledIndices(Array.from({ length: songs.length }, (_, i) => i));
    }
  }, [songs]);

  // Shuffle utility
  const shuffleArray = useCallback((array: number[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  // Handle shuffle toggle
  const handleToggleShuffle = useCallback(() => {
    setIsShuffleOn(prev => {
      if (!prev && songs) {
        setShuffledIndices(shuffleArray(Array.from({ length: songs.length }, (_, i) => i)));
      }
      return !prev;
    });
  }, [songs, shuffleArray]);

  // Handle repeat toggle
  const handleToggleRepeat = useCallback(() => {
    setIsRepeatOn(prev => !prev);
  }, []);

  // Handle audio ended event
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

  // Preload adjacent songs
  useEffect(() => {
    if (songs && currentSongIndex !== -1) {
      preloadAdjacentSongs(songs, currentSongIndex);
    }
  }, [currentSongIndex, songs, preloadAdjacentSongs]);

  // Get next song index based on shuffle state
  const getNextIndex = useCallback(() => {
    if (!songs) return -1;
    if (isShuffleOn) {
      const currentShuffleIndex = shuffledIndices.indexOf(currentSongIndex);
      return shuffledIndices[(currentShuffleIndex + 1) % songs.length];
    }
    return (currentSongIndex + 1) % songs.length;
  }, [songs, currentSongIndex, isShuffleOn, shuffledIndices]);

  // Get previous song index based on shuffle state
  const getPreviousIndex = useCallback(() => {
    if (!songs) return -1;
    if (isShuffleOn) {
      const currentShuffleIndex = shuffledIndices.indexOf(currentSongIndex);
      return shuffledIndices[(currentShuffleIndex - 1 + songs.length) % songs.length];
    }
    return (currentSongIndex - 1 + songs.length) % songs.length;
  }, [songs, currentSongIndex, isShuffleOn, shuffledIndices]);

  // Handle playing next song
  const handleNext = useCallback(() => {
    if (!songs || currentSongIndex === -1) return;
    const nextIndex = getNextIndex();
    const nextSong = songs[nextIndex];
    handlePlayPause(nextSong.id, nextSong.file_url, nextIndex);
  }, [songs, currentSongIndex, getNextIndex, handlePlayPause]);

  // Handle playing previous song
  const handlePrevious = useCallback(() => {
    if (!songs || currentSongIndex === -1) return;
    const prevIndex = getPreviousIndex();
    const prevSong = songs[prevIndex];
    handlePlayPause(prevSong.id, prevSong.file_url, prevIndex);
  }, [songs, currentSongIndex, getPreviousIndex, handlePlayPause]);

  // Get current song
  const getCurrentSong = useCallback(() => {
    if (!songs || currentSongIndex === -1) return null;
    return songs[currentSongIndex];
  }, [songs, currentSongIndex]);

  // Handle play/pause from control bar
  const handleControlPlayPause = useCallback(() => {
    if (isPlaying) {
      audioRef?.pause();
      setIsPlaying(false);
    } else {
      audioRef?.play();
      setIsPlaying(true);
    }
  }, [audioRef, isPlaying, setIsPlaying]);

  return {
    currentlyPlaying,
    isPlaying,
    isLoadingSong,
    audioRef,
    currentSongIndex,
    isShuffleOn,
    isRepeatOn,
    handlePlayPause,
    handleToggleShuffle,
    handleToggleRepeat,
    handleNext,
    handlePrevious,
    getCurrentSong,
    handleControlPlayPause
  };
};
