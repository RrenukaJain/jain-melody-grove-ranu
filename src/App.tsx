
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@/providers/ClerkProvider';
import { AuthProvider } from './context/AuthContext';
import { ReactQueryProvider } from './context/ReactQueryContext';
import Home from './pages/Home';
import Collection from './pages/Collection';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import NotFound from './pages/NotFound';
import { Toaster } from 'sonner';
import { MusicPlayerProvider } from './components/songs/context/MusicPlayerContext';
import Playlists from "./pages/Playlists";
import { PlaylistsProvider } from "./components/playlists/context/PlaylistsContext";

function App() {
  return (
    <ClerkProvider>
      <AuthProvider>
        <ReactQueryProvider>
          <PlaylistsProvider>
            <MusicPlayerProvider>
              <div className="min-h-screen bg-[#121212] text-white">
                <BrowserRouter>
                  <Toaster richColors />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/collection" element={<Collection />} />
                    <Route path="/playlists" element={<Playlists />} />
                    <Route path="/auth/*" element={<Auth />} />
                    <Route path="/auth/callback/*" element={<AuthCallback />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </div>
            </MusicPlayerProvider>
          </PlaylistsProvider>
        </ReactQueryProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;
