
import { Clock, Music, ListMusic, ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { PlaybackControls } from "./PlaybackControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";

interface SongDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSong: {
    id: string;
    title: string;
    artist: string;
    duration: string;
  } | null;
  duration: number;
  currentTime: number;
  progress: number;
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  isShuffleOn: boolean;
  isRepeatOn: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onSeek: (value: number[]) => void;
  onSeekCommit: () => void;
  onVolumeChange: (value: number[]) => void;
  onToggleMute: () => void;
}

export const SongDrawer = ({
  open,
  onOpenChange,
  currentSong,
  duration,
  currentTime,
  progress,
  volume,
  isMuted,
  isPlaying,
  isLoading,
  isShuffleOn,
  isRepeatOn,
  onPlayPause,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
  onSeek,
  onSeekCommit,
  onVolumeChange,
  onToggleMute
}: SongDrawerProps) => {
  if (!currentSong) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#121212] text-white border-t border-[#282828]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader className="text-center">
            <div className="flex justify-center my-2">
              <div 
                className="cursor-pointer hover:bg-[#282828] p-1 rounded-full transition-colors"
                onClick={() => onOpenChange(false)}
              >
                <ChevronDown className="h-6 w-6 text-white" />
              </div>
            </div>
            <DrawerTitle className="text-2xl font-bold">{currentSong.title}</DrawerTitle>
            <DrawerDescription className="text-gray-400 text-lg">{currentSong.artist}</DrawerDescription>
          </DrawerHeader>
          
          <div className="p-6">
            {/* Album Art / Visualization */}
            <div className="flex justify-center mb-8">
              <div className="w-48 h-48 md:w-64 md:h-64 bg-[#282828] rounded-lg flex items-center justify-center">
                <Music className="h-20 w-20 text-[#1DB954] opacity-50" />
              </div>
            </div>
            
            {/* Song Info Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-[#181818] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2" /> Duration
                </h3>
                <p className="text-lg">{currentSong.duration || formatTime(duration)}</p>
              </div>
              
              <div className="bg-[#181818] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                  <ListMusic className="h-4 w-4 mr-2" /> Genre
                </h3>
                <p className="text-lg">Spiritual</p>
              </div>
            </div>
            
            {/* Enhanced Playback Controls */}
            <div className="flex flex-col items-center">
              {/* Progress bar - Enhanced for drawer */}
              <div className="w-full mb-6">
                <ProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  progress={progress}
                  onSeek={onSeek}
                  onSeekCommit={onSeekCommit}
                  size="lg"
                />
              </div>
              
              {/* Playback Controls - Larger in drawer */}
              <div className="mb-6">
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
                  size="lg"
                />
              </div>
              
              {/* Volume Control */}
              <VolumeControl
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={onVolumeChange}
                onToggleMute={onToggleMute}
                className="w-full max-w-xs"
              />
            </div>
          </div>
          
          <DrawerFooter className="border-t border-[#282828] py-4">
            <p className="text-xs text-center text-gray-500">
              Listening to sacred Jain music • Enhancing your spiritual journey
            </p>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

// Helper function for time formatting
const formatTime = (time: number) => {
  if (!isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
