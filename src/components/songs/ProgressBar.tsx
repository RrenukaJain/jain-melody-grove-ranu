
import { Slider } from "@/components/ui/slider";
import { useCallback } from "react";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  progress: number;
  onSeek: (value: number[]) => void;
  onSeekCommit: () => void;
  onProgressHover?: (time: number | null) => void;
  showTimePreview?: number | null;
  size?: "sm" | "lg";
}

export const ProgressBar = ({
  currentTime,
  duration,
  progress,
  onSeek,
  onSeekCommit,
  onProgressHover,
  showTimePreview,
  size = "sm"
}: ProgressBarProps) => {
  const formatTime = useCallback((time: number) => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const handleProgressHover = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!onProgressHover) return;
    
    const bounds = event.currentTarget.getBoundingClientRect();
    const percent = ((event.clientX - bounds.left) / bounds.width) * 100;
    const previewTime = (percent / 100) * duration;
    onProgressHover(previewTime);
  }, [duration, onProgressHover]);

  const handleMouseLeave = useCallback(() => {
    if (onProgressHover) {
      onProgressHover(null);
    }
  }, [onProgressHover]);

  return (
    <div className="w-full flex items-center gap-2">
      <span className={`${size === "lg" ? "text-sm" : "text-[10px] md:text-xs"} text-gray-400 ${size === "lg" ? "w-12" : "w-8 md:w-12"} text-right`}>
        {formatTime(currentTime)}
      </span>
      <div
        className="relative flex-1"
        onMouseMove={onProgressHover ? handleProgressHover : undefined}
        onMouseLeave={onProgressHover ? handleMouseLeave : undefined}
      >
        <Slider
          value={[progress]}
          onValueChange={onSeek}
          onValueCommit={onSeekCommit}
          max={100}
          step={0.1}
          className="w-full"
        />
        {showTimePreview !== null && onProgressHover && (
          <div
            className={`absolute -top-8 px-2 py-1 rounded bg-[#282828] text-white text-xs transform -translate-x-1/2 ${size === "sm" ? "hidden md:block" : "block"}`}
            style={{
              left: `${(showTimePreview / duration) * 100}%`,
            }}
          >
            {formatTime(showTimePreview)}
          </div>
        )}
      </div>
      <span className={`${size === "lg" ? "text-sm" : "text-[10px] md:text-xs"} text-gray-400 ${size === "lg" ? "w-12" : "w-8 md:w-12"}`}>
        {formatTime(duration)}
      </span>
    </div>
  );
};
