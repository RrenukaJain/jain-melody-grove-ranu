
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreVertical, Play, Pause, Loader2 } from "lucide-react";
import { useMusicPlayer } from "./context/MusicPlayerContext";
import { Song } from "./types";
import { PlaylistAddButton } from "../playlists/PlaylistAddButton";

interface SongDrawerProps {
  song: Song;
  // For when used as standalone component
}

// Add a new interface for when used from MusicControl
interface FullScreenDrawerProps {
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

// Regular SongDrawer component for when used in song list
export function SongDrawer({ song }: SongDrawerProps) {
  const { currentlyPlaying, isPlaying, isLoadingSong, handlePlayPause } =
    useMusicPlayer();
  const isLoading = isLoadingSong && currentlyPlaying === song.id;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg bg-[#1a1a1a] border-none text-white">
        <SheetHeader className="space-y-2">
          <SheetTitle>{song.title}</SheetTitle>
          <SheetDescription>
            Learn more about this song and artist.
          </SheetDescription>
        </SheetHeader>

        {/* Song Information */}
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
            <img
              src={song.cover_image || "/images/default.png"}
              alt="Album Cover"
              className="w-24 h-24 rounded-md"
            />
            <div>
              <h2 className="text-2xl font-bold">{song.title}</h2>
              <p className="text-gray-400">Artist: {song.artist}</p>
              <p className="text-gray-400">Duration: {song.duration}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-gray-400">
              No description available.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-4">
          <Button
            className={cn(
              "flex-1 text-black",
              isPlaying
                ? "bg-white hover:bg-gray-200"
                : "bg-[#1DB954] hover:bg-[#1ed760]"
            )}
            onClick={() => handlePlayPause(song.id, song.file_url, 0, [song])}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading
              </>
            ) : isPlaying ? (
              <>
                <Pause className="h-5 w-5 mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" /> Play
              </>
            )}
          </Button>

          {/* Add to playlist button */}
          <PlaylistAddButton songId={song.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Export the full screen drawer component for use in MusicControl
export function SongDrawer2(props: FullScreenDrawerProps) {
  if (!props.currentSong) return null;
  
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent className="sm:max-w-lg bg-[#1a1a1a] border-none text-white">
        <SheetHeader className="space-y-2">
          <SheetTitle>{props.currentSong.title}</SheetTitle>
          <SheetDescription>
            Learn more about this song and artist.
          </SheetDescription>
        </SheetHeader>

        {/* Song Information */}
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
            <img
              src="/images/default.png"
              alt="Album Cover"
              className="w-24 h-24 rounded-md"
            />
            <div>
              <h2 className="text-2xl font-bold">{props.currentSong.title}</h2>
              <p className="text-gray-400">Artist: {props.currentSong.artist}</p>
              <p className="text-gray-400">Duration: {props.currentSong.duration}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-gray-400">
              No description available.
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="mt-6">
          {/* ... Additional expanded controls can be added here if needed */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={props.onToggleShuffle}
              className={props.isShuffleOn ? "text-[#1DB954]" : "text-white"}
            >
              {/* Shuffle Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shuffle"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"></path><path d="m18 2 4 4-4 4"></path><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"></path><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"></path><path d="m18 14 4 4-4 4"></path></svg>
            </Button>
            
            <Button variant="ghost" size="icon" onClick={props.onPrevious}>
              {/* Previous Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-back"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" x2="5" y1="19" y2="5"></line></svg>
            </Button>
            
            <Button 
              className="h-12 w-12 rounded-full bg-white hover:bg-gray-200 text-black"
              onClick={props.onPlayPause}
              disabled={props.isLoading}
            >
              {props.isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : props.isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={props.onNext}>
              {/* Next Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-forward"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" x2="19" y1="5" y2="19"></line></svg>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={props.onToggleRepeat}
              className={props.isRepeatOn ? "text-[#1DB954]" : "text-white"}
            >
              {/* Repeat Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-repeat"><path d="m17 2 4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="m7 22-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
