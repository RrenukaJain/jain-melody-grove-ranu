
import { useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Hero } from "@/components/home/Hero";
import { Songs } from "@/components/songs/Songs";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen">
      <Navbar onSearch={setSearchQuery} />
      <main className="pt-16">
        <Hero />
        <Songs searchQuery={searchQuery} />
      </main>
    </div>
  );
};

export default Index;
