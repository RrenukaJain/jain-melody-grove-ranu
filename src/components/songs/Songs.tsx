
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

export const Songs = () => {
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading songs...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Featured Songs</h2>
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
              >
                <PlayCircle className="h-6 w-6" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
