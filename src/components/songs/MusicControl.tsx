
import { useState, useEffect, useCallback } from "react";
import { ChevronUp } from "lucide-react";
import { PlaybackControls } from "./PlaybackControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { SongDrawer } from "./SongDrawer";

interface MusicControlProps {
  currentSong: {
    id: string;
    title: string;
    artist: string;
    duration: string;
  } | null;
  audio: HTMLAudioElement | null;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isPlaying: boolean;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  isShuffleOn: boolean;
  isRepeatOn: boolean;
}

export const MusicControl = ({
  currentSong,
  audio,
  onPlayPause,
  onNext,
  onPrevious,
  isPlaying,
  onToggleShuffle,
  onToggleRepeat,
  isShuffleOn,
  isRepeatOn,
}: MusicControlProps) => {
  const [volume, setVolume] = useState(100);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTimePreview, setShowTimePreview] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Reset states when audio source changes
  useEffect(() => {
    if (!audio) return;
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, [currentSong?.id]);

  useEffect(() => {
    if (!audio) return;

    const updateProgress = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    // Update duration immediately if audio is already loaded
    if (audio.readyState >= 1) {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    }

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
    };
  }, [audio, isDragging]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (!audio) return;
    try {
      const newVolume = value[0];
      setVolume(newVolume);
      audio.volume = newVolume / 100;
    } catch (error) {
      console.error('Error changing volume:', error);
      setError('Failed to change volume');
    }
  }, [audio]);

  const handleSeek = useCallback((value: number[]) => {
    if (!audio) return;
    try {
      setIsDragging(true);
      const time = (value[0] / 100) * duration;
      setProgress(value[0]);
      setCurrentTime(time);
    } catch (error) {
      console.error('Error seeking:', error);
      setError('Failed to seek');
    }
  }, [audio, duration]);

  const handleSeekCommit = useCallback(() => {
    if (!audio) return;
    try {
      setIsLoading(true);
      const time = (progress / 100) * duration;
      audio.currentTime = time;
      setIsDragging(false);
    } catch (error) {
      console.error('Error committing seek:', error);
      setError('Failed to update playback position');
    } finally {
      setIsLoading(false);
    }
  }, [audio, progress, duration]);

  const toggleMute = () => {
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume / 100;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handleProgressHover = useCallback((previewTime: number | null) => {
    setShowTimePreview(previewTime);
  }, []);

  // Error effect
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Enhanced audio event handling
  useEffect(() => {
    if (!audio) return;

    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e);
      setError('An error occurred during playback');
      setIsLoading(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    audio.addEventListener('error', handleError as EventListener);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('error', handleError as EventListener);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [audio]);

  if (!currentSong) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#282828] shadow-lg p-2 md:p-4 z-50">
        {error && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-sm py-1 px-4 text-center transform -translate-y-full">
            {error}
          </div>
        )}
        <div className="container mx-auto relative">
          {/* Drawer Toggle Button */}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 cursor-pointer"
            onClick={() => setDrawerOpen(true)}
          >
            <div className="bg-[#282828] p-1 rounded-full hover:bg-[#3E3E3E] transition-colors">
              <ChevronUp className="h-5 w-5 text-white" />
            </div>
          </div>
          
          {/* Main wrapper - Changed to vertical layout on mobile */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
            {/* Left section - Song info */}
            <div className="flex items-center justify-center space-x-4 w-full md:w-1/4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#282828] rounded flex items-center justify-center">
                <div className="text-xl md:text-2xl text-gray-400">🎵</div>
              </div>
              <div className="min-w-0 text-center md:text-left">
                <h3 className="font-semibold text-sm text-white truncate">{currentSong.title}</h3>
                <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
              </div>
            </div>

            {/* Center section - Player controls */}
            <div className="flex flex-col items-center w-full md:w-2/4">
              <div className="mb-2">
                <PlaybackControls
                  onPlayPause={onPlayPause}
                  onNext={onNext}
                  onPrevious={onPrevious}
                  onToggleShuffle={onToggleShuffle}
                  onToggleRepeat={onToggleRepeat}
                  isPlaying={isPlaying}
                  isLoading={isLoading}
                  isShuffleOn={isShuffleOn}
                  isRepeatOn={isRepeatOn}
                />
              </div>

              {/* Progress bar */}
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                progress={progress}
                onSeek={handleSeek}
                onSeekCommit={handleSeekCommit}
                onProgressHover={handleProgressHover}
                showTimePreview={showTimePreview}
              />
            </div>

            {/* Right section - Volume control */}
            <div className="hidden md:flex items-center justify-end gap-2 w-1/4">
              <VolumeControl
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={handleVolumeChange}
                onToggleMute={toggleMute}
                compact
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drawer for expanded song details */}
      <SongDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        currentSong={currentSong}
        duration={duration}
        currentTime={currentTime}
        progress={progress}
        volume={volume}
        isMuted={isMuted}
        isPlaying={isPlaying}
        isLoading={isLoading}
        isShuffleOn={isShuffleOn}
        isRepeatOn={isRepeatOn}
        onPlayPause={onPlayPause}
        onNext={onNext}
        onPrevious={onPrevious}
        onToggleShuffle={onToggleShuffle}
        onToggleRepeat={onToggleRepeat}
        onSeek={handleSeek}
        onSeekCommit={handleSeekCommit}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
      />
    </>
  );
};
