
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, Loader2 } from "lucide-react";
import { Song } from "./types";

interface SongCardProps {
  song: Song;
  index: number;
  isPlaying: boolean;
  isLoading: boolean;
  currentlyPlaying: string | null;
  onPlayPause: (songId: string, fileUrl: string, index: number) => void;
}

export const SongCard = ({
  song,
  index,
  isPlaying,
  isLoading,
  currentlyPlaying,
  onPlayPause,
}: SongCardProps) => {
  return (
    <div className="bg-[#181818] rounded-lg p-6 hover:bg-[#282828] transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2 text-white">{song.title}</h3>
          <p className="text-gray-400 mb-2">{song.artist}</p>
          <p className="text-sm text-gray-500">
            Duration: {song.duration}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#1DB954] hover:text-[#1ed760] relative"
          onClick={() => onPlayPause(song.id, song.file_url, index)}
          disabled={isLoading && currentlyPlaying !== song.id}
        >
          {isLoading && currentlyPlaying === song.id ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : currentlyPlaying === song.id ? (
            <PauseCircle className="h-6 w-6" />
          ) : (
            <PlayCircle className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
};
