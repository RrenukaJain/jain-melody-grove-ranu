
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navigation/Navbar";
import { Songs } from "@/components/songs/Songs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MusicControl } from "@/components/songs/MusicControl";
import { useMusicPlayer } from "@/components/songs/context/MusicPlayerContext";

const Collection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { currentlyPlaying, isPlaying, currentSongData, audioRef, isLoadingSong, 
    handleControlPlayPause, handleNext, handlePrevious, 
    isShuffleOn, isRepeatOn, handleToggleShuffle, handleToggleRepeat } = useMusicPlayer();

  // Ref to control the Songs component
  const songsRef = useRef<{
    handlePlaySong: (songId: string) => void;
    isPlaying: () => boolean;
    getCurrentlyPlayingSongId: () => string | null;
    togglePlayPause: () => void;
  }>(null);

  const { data: categories } = useQuery({
    queryKey: ['song-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('artist')
        .not('artist', 'is', null);
      
      if (error) throw error;
      
      const uniqueCategories = Array.from(new Set(data.map(song => song.artist)));
      return uniqueCategories.filter(Boolean);
    },
  });

  return (
    <div className="min-h-screen bg-[#121212] pb-32">
      <Navbar onSearch={setSearchQuery} />
      <main className="pt-24 container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Jain Song Collection</h1>
          <p className="text-gray-400">Explore our curated collection of spiritual Jain songs</p>
        </div>

        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-8">
            <TabsTrigger value="all">All Songs</TabsTrigger>
            {categories?.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <Songs 
              ref={songsRef}
              searchQuery={searchQuery} 
              categoryFilter={null} 
            />
          </TabsContent>
          
          {categories?.map((category) => (
            <TabsContent key={category} value={category}>
              <Songs 
                ref={songsRef}
                searchQuery={searchQuery} 
                categoryFilter={category} 
              />
            </TabsContent>
          ))}
        </Tabs>
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

export default Collection;
