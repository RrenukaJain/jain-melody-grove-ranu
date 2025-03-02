import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';
import { MusicPlayerProvider } from '@/components/songs/context/MusicPlayerContext';
import Index from "@/pages/Index";
import Collection from "@/pages/Collection";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MusicPlayerProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </MusicPlayerProvider>
    </QueryClientProvider>
  );
}

export default App;
