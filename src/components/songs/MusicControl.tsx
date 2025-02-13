
import { useState, useEffect } from "react";
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
}

export const MusicControl = ({
  currentSong,
  audio,
  onPlayPause,
  onNext,
  onPrevious,
  isPlaying,
}: MusicControlProps) => {
  const [volume, setVolume] = useState(100);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [showTimePreview, setShowTimePreview] = useState<number | null>(null);

  useEffect(() => {
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audio]);

  const handleVolumeChange = (value: number[]) => {
    if (!audio) return;
    const newVolume = value[0];
    setVolume(newVolume);
    audio.volume = newVolume / 100;
  };

  const handleSeek = (value: number[]) => {
    if (!audio) return;
    const time = (value[0] / 100) * duration;
    audio.currentTime = time;
    setProgress(value[0]);
  };

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

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#282828] shadow-lg p-4 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Left section - Song info */}
          <div className="flex items-center space-x-4 w-1/4">
            <div className="w-14 h-14 bg-[#282828] rounded flex items-center justify-center">
              <div className="text-2xl text-gray-400">🎵</div>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">{currentSong.title}</h3>
              <p className="text-xs text-gray-400">{currentSong.artist}</p>
            </div>
          </div>

          {/* Center section - Player controls */}
          <div className="flex flex-col items-center w-2/4">
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsShuffleOn(!isShuffleOn)}
                className={`text-gray-400 hover:text-white ${
                  isShuffleOn ? "text-[#1DB954]" : ""
                }`}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevious}
                className="text-gray-400 hover:text-white"
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onPlayPause}
                className="w-12 h-12 bg-white rounded-full hover:scale-105 transition-transform flex items-center justify-center text-black hover:bg-gray-100"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                className="text-gray-400 hover:text-white"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRepeatOn(!isRepeatOn)}
                className={`text-gray-400 hover:text-white ${
                  isRepeatOn ? "text-[#1DB954]" : ""
                }`}
              >
                <Repeat className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-gray-400 w-12 text-right">
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
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                {showTimePreview !== null && (
                  <div
                    className="absolute -top-8 px-2 py-1 rounded bg-[#282828] text-white text-xs transform -translate-x-1/2"
                    style={{
                      left: `${(showTimePreview / duration) * 100}%`,
                    }}
                  >
                    {formatTime(showTimePreview)}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400 w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right section - Volume control */}
          <div className="flex items-center justify-end gap-2 w-1/4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-gray-400 hover:text-white"
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
