
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Song } from '../types';
import { useSongsPlayer } from '../hooks/useSongsPlayer';

type MusicPlayerContextType = {
  currentlyPlaying: string | null;
  isPlaying: boolean;
  audioRef: HTMLAudioElement | null;
  currentSongData: Song | null;
  isLoadingSong: boolean;
  handlePlayPause: (songId: string, fileUrl: string, songIndex: number, songsList: Song[]) => void;
  handleControlPlayPause: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  isShuffleOn: boolean;
  isRepeatOn: boolean;
  handleToggleShuffle: () => void;
  handleToggleRepeat: () => void;
  allSongs: Song[];
  setAllSongs: React.Dispatch<React.SetStateAction<Song[]>>;
};

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [currentSongsList, setCurrentSongsList] = useState<Song[]>([]);
  const [currentSongData, setCurrentSongData] = useState<Song | null>(null);
  
  const {
    currentlyPlaying,
    isPlaying,
    isLoadingSong,
    audioRef,
    isShuffleOn,
    isRepeatOn,
    handlePlayPause: baseHandlePlayPause,
    handleToggleShuffle,
    handleToggleRepeat,
    handleNext: baseHandleNext,
    handlePrevious: baseHandlePrevious,
    handleControlPlayPause,
    getCurrentSong
  } = useSongsPlayer(currentSongsList);

  // Update current song data when the current song changes
  useEffect(() => {
    const song = getCurrentSong();
    if (song) {
      setCurrentSongData(song);
    }
  }, [currentlyPlaying, getCurrentSong]);

  // Custom handlePlayPause that also updates the songs list
  const handlePlayPause = (
    songId: string, 
    fileUrl: string, 
    songIndex: number, 
    songsList: Song[]
  ) => {
    // Update the current songs list if it's different
    if (songsList !== currentSongsList) {
      setCurrentSongsList(songsList);
    }
    
    // Call the base handlePlayPause function
    baseHandlePlayPause(songId, fileUrl, songIndex);
    
    // Find and set the current song data
    const song = songsList.find(s => s.id === songId);
    if (song) {
      setCurrentSongData(song);
    }
  };

  // Wrapper for handleNext that ensures we're using the latest songs list
  const handleNext = () => {
    baseHandleNext();
    const song = getCurrentSong();
    if (song) {
      setCurrentSongData(song);
    }
  };

  // Wrapper for handlePrevious that ensures we're using the latest songs list
  const handlePrevious = () => {
    baseHandlePrevious();
    const song = getCurrentSong();
    if (song) {
      setCurrentSongData(song);
    }
  };

  const value = {
    currentlyPlaying,
    isPlaying,
    audioRef,
    currentSongData,
    isLoadingSong,
    handlePlayPause,
    handleControlPlayPause,
    handleNext,
    handlePrevious,
    isShuffleOn,
    isRepeatOn,
    handleToggleShuffle,
    handleToggleRepeat,
    allSongs,
    setAllSongs
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
