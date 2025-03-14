
import { useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { MusicControl } from "@/components/songs/MusicControl";
import { useMusicPlayer } from "@/components/songs/context/MusicPlayerContext";

const Index = () => {
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
        <h1 className="text-4xl font-bold text-white mb-8">Welcome to Jain Music App</h1>
        <p className="text-xl text-gray-300 mb-12">Discover and play your favorite Jain spiritual songs</p>
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

export default Index;
