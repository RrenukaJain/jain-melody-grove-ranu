
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="relative h-[70vh] flex items-center">
      <div 
        className="absolute inset-0 bg-gradient-to-r from-jain-green/30 to-jain-blue/30 -z-10"
        style={{
          maskImage: "radial-gradient(circle at center, black, transparent)",
          WebkitMaskImage: "radial-gradient(circle at center, black, transparent)",
        }}
      />
      
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-jain-yellow/30 text-black/70 mb-6">
            Featured Collection
          </span>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Discover the Sacred Sounds of Jainism
          </h1>
          <p className="text-lg text-black/70 mb-8">
            Immerse yourself in a curated collection of spiritual music that connects you with the ancient wisdom of Jain traditions.
          </p>
          <div className="flex space-x-4">
            <Button size="lg" className="bg-black text-white hover:bg-black/90">
              <Play className="h-5 w-5 mr-2" />
              Play Featured
            </Button>
            <Button size="lg" variant="outline">
              Browse Collection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
