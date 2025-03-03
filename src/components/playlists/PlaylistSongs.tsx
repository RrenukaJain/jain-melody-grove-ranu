
import { useEffect } from "react";
import { usePlaylists } from "./context/PlaylistsContext";
import { useAuth } from "@/context/AuthContext";
import { SongCard } from "../songs/SongCard";
import { useMusicPlayer } from "../songs/context/MusicPlayerContext";
import { PlayCircle, PauseCircle, Info, ListMusic, DragVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song } from "../songs/types";

export const PlaylistSongs = () => {
  const { activePlaylistId, playlistDetails, fetchPlaylistDetails, removeSongFromPlaylist } = usePlaylists();
  const { isAuthenticated } = useAuth();
  const { 
    handlePlayPause, 
    isPlaying, 
    isLoadingSong, 
    currentlyPlaying 
  } = useMusicPlayer();
  
  const activePlaylist = activePlaylistId ? playlistDetails[activePlaylistId] : null;
  
  useEffect(() => {
    if (activePlaylistId && isAuthenticated) {
      fetchPlaylistDetails(activePlaylistId);
    }
  }, [activePlaylistId, isAuthenticated, fetchPlaylistDetails]);
  
  if (!activePlaylistId) {
    return (
      <div className="py-16 text-center text-gray-400">
        <ListMusic className="h-16 w-16 mx-auto mb-4 opacity-40" />
        <h3 className="text-xl font-semibold mb-2">Select a playlist</h3>
        <p>Choose a playlist from the list to view its songs</p>
      </div>
    );
  }
  
  if (!activePlaylist) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse h-6 w-24 bg-gray-700 rounded"></div>
      </div>
    );
  }
  
  const handlePlayPlaylist = () => {
    if (activePlaylist.songs && activePlaylist.songs.length > 0) {
      const firstSong = activePlaylist.songs[0];
      handlePlayPause(firstSong.id, firstSong.file_url, 0, activePlaylist.songs);
    }
  };
  
  const handleRemoveSong = async (songId: string) => {
    if (activePlaylistId) {
      await removeSongFromPlaylist({
        playlist_id: activePlaylistId,
        song_id: songId
      });
    }
  };
  
  return (
    <div className="bg-[#121212] rounded-lg">
      {/* Playlist header */}
      <div className="p-6 bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
        <h2 className="text-2xl font-bold text-white mb-2">{activePlaylist.name}</h2>
        <p className="text-gray-400 mb-4">{activePlaylist.songs?.length || 0} songs</p>
        
        <div className="flex items-center space-x-4">
          {activePlaylist.songs && activePlaylist.songs.length > 0 ? (
            <Button 
              className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-6"
              onClick={handlePlayPlaylist}
            >
              {isPlaying && activePlaylist.songs.some(song => song.id === currentlyPlaying) ? (
                <>
                  <PauseCircle className="h-5 w-5 mr-2" /> Pause
                </>
              ) : (
                <>
                  <PlayCircle className="h-5 w-5 mr-2" /> Play
                </>
              )}
            </Button>
          ) : (
            <Button 
              className="bg-gray-800 text-gray-400 cursor-not-allowed px-6"
              disabled
            >
              <Info className="h-5 w-5 mr-2" /> No songs
            </Button>
          )}
        </div>
      </div>
      
      {/* Songs list */}
      <div className="p-4">
        {activePlaylist.songs && activePlaylist.songs.length > 0 ? (
          <div className="space-y-2">
            {activePlaylist.songs.map((song: Song, index: number) => (
              <div key={song.id} className="flex items-center group">
                <div className="w-8 flex-shrink-0 text-gray-500 text-center mr-2 group-hover:hidden">
                  {index + 1}
                </div>
                <div className="w-8 flex-shrink-0 text-gray-500 hidden group-hover:flex justify-center mr-2">
                  <DragVertical className="h-5 w-5" />
                </div>
                <div className="flex-grow">
                  <SongCard
                    song={song}
                    index={index}
                    isPlaying={isPlaying}
                    isLoading={isLoadingSong}
                    currentlyPlaying={currentlyPlaying}
                    onPlayPause={(songId, fileUrl, idx) => 
                      handlePlayPause(songId, fileUrl, idx, activePlaylist.songs as Song[])
                    }
                    onRemove={handleRemoveSong}
                    inPlaylist
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-400">
            <p>This playlist is empty. Add songs to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
