
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
    <div className="group bg-[#181818] rounded-lg p-4 hover:bg-[#282828] transition-all duration-300 relative overflow-hidden">
      {/* Album Art Container */}
      <div className="aspect-square w-full mb-4 rounded-md overflow-hidden bg-[#282828] relative">
        <img
          src={song.image_url || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=500&fit=crop"}
          alt={`${song.title} album art`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Button
          variant="ghost"
          size="icon"
          className={`
            absolute bottom-2 right-2 
            w-12 h-12
            text-[#1DB954] hover:text-[#1ed760] hover:scale-105
            opacity-0 group-hover:opacity-100 
            transition-all duration-300
            bg-black/70 hover:bg-black/90
            shadow-lg
            ${currentlyPlaying === song.id ? 'opacity-100' : ''}
          `}
          onClick={() => onPlayPause(song.id, song.file_url, index)}
          disabled={isLoading && currentlyPlaying !== song.id}
        >
          {isLoading && currentlyPlaying === song.id ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : currentlyPlaying === song.id ? (
            <PauseCircle className="h-8 w-8" />
          ) : (
            <PlayCircle className="h-8 w-8" />
          )}
        </Button>
      </div>

      {/* Song Information */}
      <div className="space-y-2">
        <h3 className="font-semibold text-base text-white truncate">
          {song.title}
        </h3>
        <div className="space-y-1">
          <p className="text-sm text-gray-400 truncate">
            {song.artist}
          </p>
          <p className="text-xs text-gray-500">
            {song.album || "Single"} • {song.duration}
          </p>
        </div>
      </div>

      {/* Playing Indicator */}
      {currentlyPlaying === song.id && (
        <div className="absolute top-2 left-2 bg-[#1DB954] text-white text-xs px-2 py-1 rounded-full">
          Now Playing
        </div>
      )}
    </div>
  );
};
