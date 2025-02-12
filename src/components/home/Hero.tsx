
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center">
      {/* Background with animated gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-jain-green/40 via-jain-yellow/30 to-jain-blue/40 animate-gradient-shift -z-10"
        style={{
          maskImage: "radial-gradient(circle at center, black 40%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 70%)",
        }}
      />
      
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-jain-yellow/40 text-black/80 mb-8 backdrop-blur-sm">
            ✨ Welcome to Your Spiritual Journey
          </span>
          <h1 className="text-6xl font-bold mb-8 leading-tight bg-gradient-to-r from-black/80 to-black/60 bg-clip-text text-transparent">
            Discover the Sacred Sounds of Jainism
          </h1>
          <p className="text-xl text-black/70 mb-10 leading-relaxed max-w-2xl mx-auto">
            Immerse yourself in a curated collection of spiritual music that connects you with the ancient wisdom of Jain traditions.
          </p>
          <div className="flex items-center justify-center space-x-6">
            <Button size="lg" className="bg-black text-white hover:bg-black/90 px-8 py-6 text-lg">
              <Play className="h-6 w-6 mr-3" />
              Play Featured
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2">
              Browse Collection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
