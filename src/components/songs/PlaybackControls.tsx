
import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward, Play, Pause, Repeat, Shuffle, Loader2 } from "lucide-react";

interface PlaybackControlsProps {
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  isShuffleOn: boolean;
  isRepeatOn: boolean;
  size?: "sm" | "lg";
}

export const PlaybackControls = ({
  onPlayPause,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
  isPlaying,
  isLoading,
  isShuffleOn,
  isRepeatOn,
  size = "sm"
}: PlaybackControlsProps) => {
  // Render play/pause button helper
  const renderPlayButton = () => (
    <Button
      size={size === "lg" ? "lg" : "icon"}
      onClick={onPlayPause}
      disabled={isLoading}
      aria-label={isPlaying ? "Pause" : "Play"}
      className={`
        ${size === "lg" 
          ? "w-16 h-16 rounded-full" 
          : "w-10 h-10 md:w-12 md:h-12 rounded-full"
        }
        bg-white hover:scale-105 transition-transform flex items-center justify-center text-black hover:bg-white
      `}
    >
      {isLoading ? (
        <Loader2 className={`${size === "lg" ? "h-8 w-8" : "h-5 w-5 md:h-6 md:w-6"} animate-spin`} />
      ) : isPlaying ? (
        <Pause className={size === "lg" ? "h-8 w-8" : "h-5 w-5 md:h-6 md:w-6"} />
      ) : (
        <Play className={size === "lg" ? "h-8 w-8" : "h-5 w-5 md:h-6 md:w-6"} />
      )}
    </Button>
  );

  return (
    <div className={`flex items-center ${size === "lg" ? "gap-6" : "gap-2 md:gap-4"}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleShuffle}
        aria-label={isShuffleOn ? "Disable shuffle" : "Enable shuffle"}
        className={`
          text-gray-400 hover:text-white transition-colors 
          ${isShuffleOn ? "text-[#1DB954]" : ""}
          ${size === "lg" ? "h-12 w-12" : ""}
        `}
      >
        <Shuffle className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        aria-label="Previous"
        className={`
          text-gray-400 hover:text-white transition-colors
          ${size === "lg" ? "h-12 w-12" : ""}
        `}
      >
        <SkipBack className={size === "lg" ? "h-6 w-6" : "h-4 w-4 md:h-5 md:w-5"} />
      </Button>
      {renderPlayButton()}
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        aria-label="Next"
        className={`
          text-gray-400 hover:text-white transition-colors
          ${size === "lg" ? "h-12 w-12" : ""}
        `}
      >
        <SkipForward className={size === "lg" ? "h-6 w-6" : "h-4 w-4 md:h-5 md:w-5"} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleRepeat}
        aria-label={isRepeatOn ? "Disable repeat" : "Enable repeat"}
        className={`
          text-gray-400 hover:text-white transition-colors 
          ${isRepeatOn ? "text-[#1DB954]" : ""}
          ${size === "lg" ? "h-12 w-12" : ""}
        `}
      >
        <Repeat className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
      </Button>
    </div>
  );
};
