
import { useState, useEffect, useCallback } from "react";
import { PlaybackControls } from "./PlaybackControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { SongDrawer2 } from "./SongDrawer";
import { SongInfo } from "./music-controls/SongInfo";
import { DrawerToggle } from "./music-controls/DrawerToggle";
import { ErrorMessage } from "./music-controls/ErrorMessage";
import { TimeDisplay } from "./music-controls/TimeDisplay";

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

  // Handle audio timeupdate and metadata loading
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

  // Handle volume changes
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

  // Handle seeking during playback
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

  // Handle seek operation completion
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

  // Toggle mute state
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

  // Progress bar hover preview
  const handleProgressHover = useCallback((previewTime: number | null) => {
    setShowTimePreview(previewTime);
  }, []);

  // Error message timeout
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
        <ErrorMessage message={error} />
        <div className="container mx-auto relative">
          {/* Drawer Toggle Button */}
          <DrawerToggle onClick={() => setDrawerOpen(true)} />
          
          {/* Main wrapper - Changed to vertical layout on mobile */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
            {/* Left section - Song info */}
            <SongInfo title={currentSong.title} artist={currentSong.artist} />

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
              <div className="w-full flex items-center gap-2">
                <TimeDisplay currentTime={currentTime} duration={duration} />
                <div
                  className="relative flex-1"
                  onMouseMove={(e) => {
                    if (!handleProgressHover) return;
                    const bounds = e.currentTarget.getBoundingClientRect();
                    const percent = ((e.clientX - bounds.left) / bounds.width) * 100;
                    const previewTime = (percent / 100) * duration;
                    handleProgressHover(previewTime);
                  }}
                  onMouseLeave={() => handleProgressHover(null)}
                >
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
              </div>
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

      {/* Drawer for expanded song details - Updated to use SongDrawer2 */}
      <SongDrawer2
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
