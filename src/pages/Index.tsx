
import { useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Hero } from "@/components/home/Hero";
import { MusicControl } from "@/components/songs/MusicControl";
import { useMusicPlayer } from "@/components/songs/context/MusicPlayerContext";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentlyPlaying, isPlaying, currentSongData, audioRef, isLoadingSong, 
    handleControlPlayPause, handleNext, handlePrevious, 
    isShuffleOn, isRepeatOn, handleToggleShuffle, handleToggleRepeat } = useMusicPlayer();

  return (
    <div className="min-h-screen">
      <Navbar onSearch={setSearchQuery} />
      <main className="pt-16">
        <Hero />
      </main>

      {/* Music Control - always visible when playing */}
      {(isPlaying || currentlyPlaying) && currentSongData && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <MusicControl
            currentSong={currentSongData}
            audio={audioRef}
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
