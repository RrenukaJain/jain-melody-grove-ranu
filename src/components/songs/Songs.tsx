
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const Songs = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const { toast } = useToast();
  const audioRef = useState<HTMLAudioElement | null>(null);

  const { data: songs, isLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data;
    },
  });

  const handlePlayPause = (songId: string, fileUrl: string) => {
    if (currentlyPlaying === songId) {
      // Pause current song
      audioRef[0]?.pause();
      setCurrentlyPlaying(null);
    } else {
      // Stop previous audio if playing
      if (audioRef[0]) {
        audioRef[0].pause();
      }

      // Play new song
      const audio = new Audio(fileUrl);
      audio.addEventListener('error', () => {
        toast({
          variant: "destructive",
          title: "Error playing song",
          description: "There was an error playing this song. Please try again later.",
        });
      });

      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        toast({
          variant: "destructive",
          title: "Playback error",
          description: "Unable to play this song. The file might be unavailable.",
        });
      });

      audioRef[0] = audio;
      setCurrentlyPlaying(songId);

      // Add ended event listener to reset playing state
      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading songs...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Featured Jain Songs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs?.map((song) => (
          <div
            key={song.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{song.title}</h3>
                <p className="text-gray-600">{song.artist}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Duration: {song.duration}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary/80"
                onClick={() => handlePlayPause(song.id, song.file_url)}
              >
                {currentlyPlaying === song.id ? (
                  <PauseCircle className="h-6 w-6" />
                ) : (
                  <PlayCircle className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
