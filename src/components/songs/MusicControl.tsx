import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Loader2,
} from "lucide-react";

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

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressHover = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const percent = ((event.clientX - bounds.left) / bounds.width) * 100;
    const previewTime = (percent / 100) * duration;
    setShowTimePreview(previewTime);
  };

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

  // Render helpers
  const renderPlayButton = () => (
    <Button
      size="icon"
      onClick={onPlayPause}
      disabled={isLoading}
      aria-label={isPlaying ? "Pause" : "Play"}
      className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full hover:scale-105 transition-transform flex items-center justify-center text-black hover:bg-white"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
      ) : isPlaying ? (
        <Pause className="h-5 w-5 md:h-6 md:w-6" />
      ) : (
        <Play className="h-5 w-5 md:h-6 md:w-6" />
      )}
    </Button>
  );

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#282828] shadow-lg p-2 md:p-4 z-50">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-sm py-1 px-4 text-center transform -translate-y-full">
          {error}
        </div>
      )}
      <div className="container mx-auto">
        {/* Main wrapper - Changed to vertical layout on mobile */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          {/* Left section - Song info */}
            <div className="flex items-center justify-center space-x-4 w-full md:w-1/4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-[#282828] rounded flex items-center justify-center">
              <div className="text-xl md:text-2xl text-gray-400">🎵</div>
            </div>
            <div className="min-w-0 text-center"> {/* Added text-center */}
              <h3 className="font-semibold text-sm text-white truncate">{currentSong.title}</h3>
              <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
            </div>
            </div>

          {/* Center section - Player controls */}
          <div className="flex flex-col items-center w-full md:w-2/4">
            <div className="flex items-center gap-2 md:gap-4 mb-2">
              <Button
              variant="ghost"
              size="icon"
              onClick={onToggleShuffle}
              aria-label={isShuffleOn ? "Disable shuffle" : "Enable shuffle"}
              className={`text-gray-400 hover:text-white transition-colors ${
              isShuffleOn ? "text-[#1DB954]" : ""
              }`}
              >
              <Shuffle className="h-4 w-4" />
              </Button>
              <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              aria-label="Previous"
              className="text-gray-400 hover:text-white transition-colors"
              >
              <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              {renderPlayButton()}
              <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              aria-label="Next"
              className="text-gray-400 hover:text-white transition-colors"
              >
              <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button
              variant="ghost"
              size="icon"
              onClick={onToggleRepeat}
              aria-label={isRepeatOn ? "Disable repeat" : "Enable repeat"}
              className={`text-gray-400 hover:text-white transition-colors ${
              isRepeatOn ? "text-[#1DB954]" : ""
              }`}
              >
              <Repeat className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-[10px] md:text-xs text-gray-400 w-8 md:w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <div
                className="relative flex-1"
                onMouseMove={handleProgressHover}
                onMouseLeave={() => setShowTimePreview(null)}
              >
                <Slider
                  value={[progress]}
                  onValueChange={handleSeek}
                  onValueCommit={handleSeekCommit}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                {showTimePreview !== null && (
                  <div
                    className="absolute -top-8 px-2 py-1 rounded bg-[#282828] text-white text-xs transform -translate-x-1/2 hidden md:block"
                    style={{
                      left: `${(showTimePreview / duration) * 100}%`,
                    }}
                  >
                    {formatTime(showTimePreview)}
                  </div>
                )}
              </div>
              <span className="text-[10px] md:text-xs text-gray-400 w-8 md:w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right section - Volume control */}
          <div className="hidden md:flex items-center justify-end gap-2 w-1/4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={100}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
