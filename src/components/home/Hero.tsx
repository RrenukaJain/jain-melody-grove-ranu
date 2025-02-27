import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Songs } from "@/components/songs/Songs";
import { useRef, useState, useEffect } from "react";

export const Hero = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  
  const songsComponentRef = useRef<{
    handlePlaySong: (songId: string) => void;
    isPlaying: () => boolean;
    getCurrentlyPlayingSongId: () => string | null;
    togglePlayPause: () => void;
  } | null>(null);

  // Check playback status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (songsComponentRef.current) {
        setIsPlaying(songsComponentRef.current.isPlaying());
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

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
    if (featuredSongs && featuredSongs.length > 0 && songsComponentRef.current) {
      if (isPlaying) {
        // If already playing, just toggle play/pause
        songsComponentRef.current.togglePlayPause();
      } else {
        // If not playing or playing a different song, start playing the first featured song
        const firstSong = featuredSongs[0];
        
        // Show toast only on initial play, not when toggling
        if (!hasStartedPlaying) {
          toast.success("Now playing featured songs");
          setHasStartedPlaying(true);
        }
        
        // Use the Songs component's handlePlaySong function
        songsComponentRef.current.handlePlaySong(firstSong.id);
      }
    } else {
      toast.error("No featured songs available");
    }
  };

  const handleBrowseCollection = () => {
    navigate('/collection');
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
                {isPlaying ? (
                  <>
                    <Pause className="h-6 w-6 mr-3" />
                    Pause Featured
                  </>
                ) : (
                  <>
                    <Play className="h-6 w-6 mr-3" />
                    Play Featured
                  </>
                )}
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
            <Songs ref={songsComponentRef} featured searchQuery="" />
          </div>
        </div>
      )}
    </>
  );
};
