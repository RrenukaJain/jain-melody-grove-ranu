
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
}

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
