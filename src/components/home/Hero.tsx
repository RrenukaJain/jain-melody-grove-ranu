
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/components/songs/hooks/useAudioPlayer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Songs } from "@/components/songs/Songs";

export const Hero = () => {
  const { 
    handlePlayPause, 
    currentlyPlaying,
    isPlaying,
    isLoadingSong,
    audioRef,
    currentSongIndex,
    setIsPlaying 
  } = useAudioPlayer();
  const navigate = useNavigate();

  const { data: featuredSongs } = useQuery({
    queryKey: ['featured-songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handlePlayFeatured = () => {
    if (featuredSongs && featuredSongs.length > 0) {
      // Start playing the first featured song
      const firstSong = featuredSongs[0];
      handlePlayPause(firstSong.id, firstSong.file_url, 0);
      toast.success("Now playing featured songs");
    } else {
      toast.error("No featured songs available");
    }
  };

  const handleBrowseCollection = () => {
    navigate('/collection');
  };

  const handleControlPlayPause = () => {
    if (isPlaying) {
      audioRef?.pause();
      setIsPlaying(false);
    } else {
      audioRef?.play();
      setIsPlaying(true);
    }
  };

  const getCurrentSong = () => {
    if (!featuredSongs || currentSongIndex === -1) return null;
    return featuredSongs[currentSongIndex];
  };

  return (
    <>
      <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/20 via-[#121212] to-[#535353]/20 animate-gradient-shift"
          style={{
            maskImage: "radial-gradient(circle at center, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 80%)",
          }}
        />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#1DB954]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#535353]/10 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium glass text-[#1DB954] mb-8">
              ✨ Welcome to Your Spiritual Journey
            </span>
            
            <h1 className="text-6xl font-bold mb-8 leading-tight text-white">
              Discover the Sacred Sounds of{" "}
              <span className="bg-gradient-to-r from-[#1DB954] to-[#535353] text-transparent bg-clip-text">
                Jainism
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              Immerse yourself in a curated collection of spiritual music that connects you 
              with the ancient wisdom of Jain traditions.
            </p>
            
            <div className="flex items-center justify-center space-x-6">
              <Button 
                size="lg" 
                className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
                onClick={handlePlayFeatured}
              >
                <Play className="h-6 w-6 mr-3" />
                Play Featured
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg border-2 border-gray-700 hover:border-gray-500 text-white glass hover:bg-white/5 transition-all duration-300"
                onClick={handleBrowseCollection}
              >
                Browse Collection
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#121212] to-transparent" />
      </div>

      {/* Featured Songs Section */}
      {featuredSongs && featuredSongs.length > 0 && (
        <div className="bg-[#121212] py-16">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 px-4">Featured Songs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSongs.map((song, index) => (
                <div
                  key={song.id}
                  className={`group bg-[#181818] rounded-lg p-3 hover:bg-[#282828] transition-all duration-300 relative overflow-hidden flex items-center gap-4`}
                >
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
                    onClick={() => handlePlayPause(song.id, song.file_url, index)}
                    disabled={isLoadingSong && currentlyPlaying !== song.id}
                  >
                    <Play className="h-6 w-6" />
                  </Button>

                  {/* Song Information */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-sm text-white truncate">
                      {song.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {song.artist}
                    </p>
                  </div>

                  {/* Playing Indicator */}
                  {currentlyPlaying === song.id && (
                    <div className="absolute top-1 right-1 bg-[#1DB954] text-white text-xs px-1.5 py-0.5 rounded-full">
                      Playing
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Music Control Section */}
      {currentlyPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#282828] shadow-lg p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <h3 className="font-medium">{getCurrentSong()?.title}</h3>
                <p className="text-sm text-gray-400">{getCurrentSong()?.artist}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleControlPlayPause}
              className="text-white hover:text-[#1DB954]"
            >
              {isPlaying ? <Play className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
