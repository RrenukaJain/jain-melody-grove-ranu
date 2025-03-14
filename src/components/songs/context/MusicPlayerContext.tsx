
import { 
  createContext, 
  useContext, 
  useState, 
  useRef, 
  useEffect,
  ReactNode 
} from "react";
import { Song } from "../types";
import { toast } from "sonner";
import { usePlaylists } from "@/components/playlists/context/PlaylistsContext";

interface MusicPlayerContextType {
  currentSongData: Song | null;
  currentlyPlaying: string | null;
  isPlaying: boolean;
  isLoadingSong: boolean;
  isShuffleOn: boolean;
  isRepeatOn: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentPlaylist: Song[];
  setAllSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  handlePlayPause: (songId: string, fileUrl: string, index: number, songs: Song[]) => void;
  handleControlPlayPause: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleToggleShuffle: () => void;
  handleToggleRepeat: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

interface MusicPlayerProviderProps {
  children: ReactNode;
}

export const MusicPlayerProvider = ({ children }: MusicPlayerProviderProps) => {
  const [currentSongData, setCurrentSongData] = useState<Song | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  
  // Create audio element if it doesn't exist
  useEffect(() => {
    if (!audioRef.current) {
      const audioElement = new Audio();
      audioElement.preload = "auto";
      audioRef.current = audioElement;
      console.log("Audio element created:", audioElement);
    }
  }, []);

  // Get the active playlist from context if available
  const { activePlaylistId, playlistDetails } = usePlaylists ? usePlaylists() : { activePlaylistId: null, playlistDetails: {} };

  // Function to play a song
  const playSong = (songId: string, fileUrl: string, index: number, songs: Song[]) => {
    console.log("Attempting to play song:", { songId, fileUrl, index });
    
    if (!audioRef.current) {
      console.error("Audio reference is not available");
      toast.error("Audio player is not initialized");
      return;
    }
    
    // If the song is already playing, pause it
    if (currentlyPlaying === songId && isPlaying) {
      console.log("Pausing currently playing song");
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    
    // If the song is the same but is not playing, then play it
    if (currentlyPlaying === songId && !isPlaying) {
      console.log("Resuming paused song");
      audioRef.current.play().then(() => {
        console.log("Song resumed successfully");
        setIsPlaying(true);
      }).catch(error => {
        console.error("Error resuming audio:", error);
        toast.error("Failed to resume the song");
      });
      return;
    }

    // Set loading state while the song is loading
    setIsLoadingSong(true);
    
    try {
      // Validate the file URL
      if (!fileUrl) {
        throw new Error("Song URL is missing");
      }
      
      console.log("Loading new song with URL:", fileUrl);
      
      // Create a test request to check if the file is accessible
      fetch(fileUrl, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`File not accessible: ${response.status} ${response.statusText}`);
          }
          console.log("File is accessible, setting audio source");
          
          // Set the new song and play it
          audioRef.current.src = fileUrl;
          
          // Add event listeners for debugging
          const onLoadStart = () => console.log("Audio load started");
          const onLoadedData = () => console.log("Audio data loaded");
          const onCanPlay = () => console.log("Audio can play");
          
          audioRef.current.addEventListener('loadstart', onLoadStart);
          audioRef.current.addEventListener('loadeddata', onLoadedData);
          audioRef.current.addEventListener('canplay', onCanPlay);
          
          // Attempt to play the audio
          return audioRef.current.play().then(() => {
            // Clean up event listeners
            audioRef.current.removeEventListener('loadstart', onLoadStart);
            audioRef.current.removeEventListener('loadeddata', onLoadedData);
            audioRef.current.removeEventListener('canplay', onCanPlay);
            
            console.log("Song started playing successfully");
            setIsPlaying(true);
            setIsLoadingSong(false);
            setCurrentlyPlaying(songId);
            setCurrentSongData(songs[index]);
            setCurrentPlaylist(songs);
          });
        })
        .catch(error => {
          console.error("Error accessing audio file:", error);
          setIsLoadingSong(false);
          setIsPlaying(false);
          toast.error(`Failed to access the song: ${error.message}`);
        });
    } catch (error) {
      console.error("Error setting up audio playback:", error);
      setIsLoadingSong(false);
      setIsPlaying(false);
      toast.error(`Playback error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle play/pause toggle
  const handlePlayPause = (songId: string, fileUrl: string, index: number, songs: Song[]) => {
    playSong(songId, fileUrl, index, songs);
  };

  // Toggle play/pause from music control
  const handleControlPlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Function to get a random index, excluding the current index
  const getRandomExcluding = (length: number, currentIndex: number): number => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * length);
    } while (randomIndex === currentIndex);
    return randomIndex;
  };

  // When a playlist is active and the user navigates to the next/previous song,
  // use the playlist order instead of the default behavior
  const handleNext = () => {
    if (currentPlaylist && currentPlaylist.length > 0) {
      // Check if we're playing from an active playlist
      if (activePlaylistId && playlistDetails[activePlaylistId]) {
        const playlistSongs = playlistDetails[activePlaylistId].songs;
        
        if (playlistSongs && playlistSongs.length > 0) {
          const currentIndex = playlistSongs.findIndex(song => song.id === currentlyPlaying);
          
          if (currentIndex !== -1) {
            // We're playing from this playlist, use its order
            const nextIndex = isShuffleOn
              ? getRandomExcluding(playlistSongs.length, currentIndex)
              : (currentIndex + 1) % playlistSongs.length;
            
            const nextSong = playlistSongs[nextIndex];
            playSong(nextSong.id, nextSong.file_url, nextIndex, playlistSongs);
            return;
          }
        }
      }
    
      // Default behavior - use the current playlist
      const currentSongIndex = currentPlaylist.findIndex(song => song.id === currentlyPlaying);
      const nextIndex = isShuffleOn
        ? getRandomExcluding(currentPlaylist.length, currentSongIndex)
        : (currentSongIndex + 1) % currentPlaylist.length;
      
      const nextSong = currentPlaylist[nextIndex];
      playSong(nextSong.id, nextSong.file_url, nextIndex, currentPlaylist);
    }
  };

  const handlePrevious = () => {
    if (currentPlaylist && currentPlaylist.length > 0) {
      // Check if we're playing from an active playlist
      if (activePlaylistId && playlistDetails[activePlaylistId]) {
        const playlistSongs = playlistDetails[activePlaylistId].songs;
        
        if (playlistSongs && playlistSongs.length > 0) {
          const currentIndex = playlistSongs.findIndex(song => song.id === currentlyPlaying);
          
          if (currentIndex !== -1) {
            // We're playing from this playlist, use its order
            const prevIndex = isShuffleOn
              ? getRandomExcluding(playlistSongs.length, currentIndex)
              : (currentIndex - 1 + playlistSongs.length) % playlistSongs.length;
            
            const prevSong = playlistSongs[prevIndex];
            playSong(prevSong.id, prevSong.file_url, prevIndex, playlistSongs);
            return;
          }
        }
      }
    
      // Default behavior - use the current playlist
      const currentSongIndex = currentPlaylist.findIndex(song => song.id === currentlyPlaying);
      const prevIndex = isShuffleOn
        ? getRandomExcluding(currentPlaylist.length, currentSongIndex)
        : (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
      
      const prevSong = currentPlaylist[prevIndex];
      playSong(prevSong.id, prevSong.file_url, prevIndex, currentPlaylist);
    }
  };

  // Toggle shuffle mode
  const handleToggleShuffle = () => {
    setIsShuffleOn(!isShuffleOn);
  };

  // Toggle repeat mode
  const handleToggleRepeat = () => {
    setIsRepeatOn(!isRepeatOn);
  };

  // Handle song ending
  useEffect(() => {
    if (audioRef.current) {
      const handleEnded = () => {
        if (isRepeatOn) {
          // If repeat is on, replay the current song
          if (currentSongData) {
            playSong(currentSongData.id, currentSongData.file_url, currentPlaylist.findIndex(song => song.id === currentSongData.id), currentPlaylist);
          }
        } else {
          // If repeat is off, play the next song
          handleNext();
        }
      };

      audioRef.current.addEventListener('ended', handleEnded);

      return () => {
        audioRef.current.removeEventListener('ended', handleEnded);
      };
    }
  }, [isRepeatOn, handleNext, currentSongData, currentPlaylist]);

  const value: MusicPlayerContextType = {
    currentSongData,
    currentlyPlaying,
    isPlaying,
    isLoadingSong,
    isShuffleOn,
    isRepeatOn,
    audioRef,
    currentPlaylist,
    setAllSongs,
    handlePlayPause,
    handleControlPlayPause,
    handleNext,
    handlePrevious,
    handleToggleShuffle,
    handleToggleRepeat,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};
