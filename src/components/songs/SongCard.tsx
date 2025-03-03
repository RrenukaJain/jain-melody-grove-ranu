
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, Loader2, Disc, Plus, Trash2 } from "lucide-react";
import { Song } from "./types";
import { useAuth, SignedIn, SignedOut } from "@/context/AuthContext";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import LoginModal from "@/components/auth/LoginModal";
import { PlaylistAddButton } from "../playlists/PlaylistAddButton";

interface SongCardProps {
  song: Song;
  index: number;
  isPlaying: boolean;
  isLoading: boolean;
  currentlyPlaying: string | null;
  onPlayPause: (songId: string, fileUrl: string, index: number) => void;
  onRemove?: (songId: string) => void;
  inPlaylist?: boolean;
}

export const SongCard = ({
  song,
  index,
  isPlaying,
  isLoading,
  currentlyPlaying,
  onPlayPause,
  onRemove,
  inPlaylist = false,
}: SongCardProps) => {
  const { isAuthenticated } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handlePlayClick = () => {
    if (isAuthenticated) {
      onPlayPause(song.id, song.file_url, index);
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleCloseLoginModal = () => {
    setLoginModalOpen(false);
  };

  return (
    <div className="group bg-[#181818] rounded-lg p-3 hover:bg-[#282828] transition-all duration-300 relative overflow-hidden flex items-center gap-4">
      {/* Album Art Container - Smaller size */}
      <div className="w-12 h-12 rounded-md overflow-hidden bg-[#282828] relative flex-shrink-0">
        {song.cover_image ? (
          <img
            src={song.cover_image}
            alt={`${song.title} album art`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Disc className="w-6 h-6" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`
                absolute inset-0 
                w-full h-full
                text-[#1DB954] hover:text-[#1ed760]
                opacity-0 group-hover:opacity-100 
                transition-all duration-300
                bg-black/40 hover:bg-black/60
                ${currentlyPlaying === song.id ? 'opacity-100' : ''}
              `}
              onClick={handlePlayClick}
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
          </DialogTrigger>
          
          <SignedOut>
            {loginModalOpen && (
              <LoginModal onClose={handleCloseLoginModal} songId={song.id} />
            )}
          </SignedOut>
        </Dialog>
      </div>

      {/* Song Information */}
      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-sm text-white truncate">
          {song.title}
        </h3>
        <p className="text-xs text-gray-400 truncate">
          {song.artist}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Add to playlist button */}
        {!inPlaylist && (
          <PlaylistAddButton songId={song.id} minimal />
        )}
        
        {/* Remove from playlist button (only shown when in playlist view) */}
        {inPlaylist && onRemove && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#3a3a3a] opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(song.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Duration */}
      <div className="text-xs text-gray-400 flex-shrink-0">
        {song.duration}
      </div>

      {/* Playing Indicator */}
      {currentlyPlaying === song.id && (
        <div className="absolute top-1 right-1 bg-[#1DB954] text-white text-xs px-1.5 py-0.5 rounded-full">
          Playing
        </div>
      )}
    </div>
  );
};
