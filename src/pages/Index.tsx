
import { Navbar } from "@/components/navigation/Navbar";
import { Hero } from "@/components/home/Hero";
import { Songs } from "@/components/songs/Songs";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Songs />
      </main>
    </div>
  );
};

export default Index;
