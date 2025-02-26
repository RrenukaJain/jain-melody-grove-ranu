
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navigation/Navbar";
import { Songs } from "@/components/songs/Songs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Collection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

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
    <div className="min-h-screen bg-[#121212]">
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
            <Songs searchQuery={searchQuery} categoryFilter={null} />
          </TabsContent>
          
          {categories?.map((category) => (
            <TabsContent key={category} value={category}>
              <Songs searchQuery={searchQuery} categoryFilter={category} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default Collection;
