
import { useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Hero } from "@/components/home/Hero";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen">
      <Navbar onSearch={setSearchQuery} />
      <main className="pt-16">
        <Hero />
      </main>
    </div>
  );
};

export default Index;
