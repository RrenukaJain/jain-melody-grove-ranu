
import { useState } from "react";
import { PlusCircle, Check, Music, List, FolderPlus } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePlaylists } from "./context/PlaylistsContext";
import { useAuth, SignedIn, SignedOut } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PlaylistAddButtonProps {
  songId: string;
  minimal?: boolean;
}

export const PlaylistAddButton = ({ songId, minimal = false }: PlaylistAddButtonProps) => {
  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylists();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToPlaylist = async (playlistId: string) => {
    setIsAdding(true);
    try {
      await addSongToPlaylist({
        playlist_id: playlistId,
        song_id: songId,
      });
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleCreateAndAddToPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    
    setIsAdding(true);
    try {
      const playlist = await createPlaylist({ name: newPlaylistName });
      if (playlist) {
        await addSongToPlaylist({
          playlist_id: playlist.id,
          song_id: songId,
        });
        setNewPlaylistName("");
        setCreateDialogOpen(false);
        toast.success(`Added to new playlist "${playlist.name}"`);
      }
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleLoginRedirect = () => {
    navigate("/auth", { state: { from: window.location.pathname, songId } });
  };
  
  if (minimal) {
    return (
      <SignedIn>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#3a3a3a]"
              disabled={isAdding}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#282828] border-none text-white min-w-44">
            <div className="px-2 py-1.5 text-sm font-medium text-gray-400">
              Add to playlist
            </div>
            
            <DropdownMenuSeparator className="bg-gray-700" />
            
            {playlists.length === 0 ? (
              <div className="px-2 py-3 text-sm text-gray-400 text-center">
                <Music className="h-5 w-5 mx-auto mb-1" />
                <p>No playlists found</p>
              </div>
            ) : (
              playlists.map(playlist => (
                <DropdownMenuItem 
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="cursor-pointer hover:bg-[#3a3a3a]"
                >
                  <List className="h-4 w-4 mr-2" />
                  {playlist.name}
                </DropdownMenuItem>
              ))
            )}
            
            <DropdownMenuSeparator className="bg-gray-700" />
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-[#3a3a3a]"
                  onSelect={(e) => e.preventDefault()}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create new playlist
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#282828] border-none text-white">
                <DialogHeader>
                  <DialogTitle>Create New Playlist</DialogTitle>
                </DialogHeader>
                
                <div className="py-4">
                  <Input
                    placeholder="Playlist name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="bg-[#3a3a3a] border-none text-white"
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    className="border-gray-700 text-white hover:bg-[#3a3a3a]"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateAndAddToPlaylist} 
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
                    disabled={!newPlaylistName.trim() || isAdding}
                  >
                    {isAdding ? "Adding..." : "Create & Add"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SignedIn>
    );
  }
  
  return (
    <>
      <SignedIn>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white hover:bg-[#282828]"
              disabled={isAdding}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add to playlist
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#282828] border-none text-white min-w-44">
            {playlists.length === 0 ? (
              <div className="px-2 py-3 text-sm text-gray-400 text-center">
                <Music className="h-5 w-5 mx-auto mb-1" />
                <p>No playlists found</p>
              </div>
            ) : (
              playlists.map(playlist => (
                <DropdownMenuItem 
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="cursor-pointer hover:bg-[#3a3a3a]"
                >
                  <List className="h-4 w-4 mr-2" />
                  {playlist.name}
                </DropdownMenuItem>
              ))
            )}
            
            <DropdownMenuSeparator className="bg-gray-700" />
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-[#3a3a3a]"
                  onSelect={(e) => e.preventDefault()}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create new playlist
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#282828] border-none text-white">
                <DialogHeader>
                  <DialogTitle>Create New Playlist</DialogTitle>
                </DialogHeader>
                
                <div className="py-4">
                  <Input
                    placeholder="Playlist name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="bg-[#3a3a3a] border-none text-white"
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    className="border-gray-700 text-white hover:bg-[#3a3a3a]"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateAndAddToPlaylist} 
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
                    disabled={!newPlaylistName.trim() || isAdding}
                  >
                    {isAdding ? "Adding..." : "Create & Add"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SignedIn>
      
      <SignedOut>
        <Button 
          variant="ghost" 
          className="text-gray-300 hover:text-white hover:bg-[#282828]"
          onClick={handleLoginRedirect}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add to playlist
        </Button>
      </SignedOut>
    </>
  );
};
