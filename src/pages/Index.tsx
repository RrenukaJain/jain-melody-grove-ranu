
import { Navbar } from "@/components/navigation/Navbar";
import { Hero } from "@/components/home/Hero";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Hero />
      </main>
    </div>
  );
};

export default Index;
