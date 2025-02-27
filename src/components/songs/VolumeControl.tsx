
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (value: number[]) => void;
  onToggleMute: () => void;
  className?: string;
  compact?: boolean;
}

export const VolumeControl = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  className = "",
  compact = false
}: VolumeControlProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMute}
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
        onValueChange={onVolumeChange}
        max={100}
        className={compact ? "w-24" : "w-full max-w-40"}
      />
    </div>
  );
};
