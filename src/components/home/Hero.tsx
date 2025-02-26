import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/components/songs/hooks/useAudioPlayer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const { handlePlayPause } = useAudioPlayer();
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

  return (
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
      
      {/* Display featured songs below hero */}
      {featuredSongs && featuredSongs.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0">
          <Songs featured searchQuery="" />
        </div>
      )}
    </div>
  );
};
