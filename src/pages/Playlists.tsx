
import { useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { PlaylistsList } from "@/components/playlists/PlaylistsList";
import { PlaylistSongs } from "@/components/playlists/PlaylistSongs";
import { MusicControl } from "@/components/songs/MusicControl";
import { useMusicPlayer } from "@/components/songs/context/MusicPlayerContext";

const Playlists = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    currentlyPlaying, 
    isPlaying, 
    currentSongData, 
    audioRef, 
    handleControlPlayPause, 
    handleNext, 
    handlePrevious, 
    isShuffleOn, 
    isRepeatOn, 
    handleToggleShuffle, 
    handleToggleRepeat 
  } = useMusicPlayer();

  return (
    <div className="min-h-screen bg-[#121212] pb-32">
      <Navbar onSearch={setSearchQuery} />
      <main className="pt-24 container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">My Playlists</h1>
          <p className="text-gray-400">Create and manage your personal music collections</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with playlist list */}
          <div className="lg:col-span-1">
            <PlaylistsList />
          </div>
          
          {/* Main content with songs */}
          <div className="lg:col-span-3">
            <PlaylistSongs />
          </div>
        </div>
      </main>

      {/* Music Control - always visible when playing */}
      {(isPlaying || currentlyPlaying) && currentSongData && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <MusicControl
            currentSong={currentSongData}
            audio={audioRef.current}
            onPlayPause={handleControlPlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isPlaying={isPlaying}
            onToggleShuffle={handleToggleShuffle}
            onToggleRepeat={handleToggleRepeat}
            isShuffleOn={isShuffleOn}
            isRepeatOn={isRepeatOn}
          />
        </div>
      )}
    </div>
  );
};

export default Playlists;
