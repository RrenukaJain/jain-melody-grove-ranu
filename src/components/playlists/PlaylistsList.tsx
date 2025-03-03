
import { useEffect } from "react";
import { usePlaylists } from "./context/PlaylistsContext";
import { PlusCircle, Trash2, Edit, Music } from "lucide-react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth, SignedIn, SignedOut } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const PlaylistsList = () => {
  const { 
    playlists, 
    createPlaylist, 
    deletePlaylist, 
    updatePlaylist,
    activePlaylistId,
    setActivePlaylistId 
  } = usePlaylists();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form state
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingPlaylist, setEditingPlaylist] = useState<{ id: string, name: string } | null>(null);
  const [deletingPlaylistId, setDeletingPlaylistId] = useState<string | null>(null);
  
  // Handle create playlist
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    
    const playlist = await createPlaylist({ name: newPlaylistName });
    if (playlist) {
      setNewPlaylistName("");
      setCreateDialogOpen(false);
    }
  };
  
  // Handle edit playlist
  const handleEditPlaylist = async () => {
    if (!editingPlaylist || !editingPlaylist.name.trim()) return;
    
    await updatePlaylist(editingPlaylist.id, { name: editingPlaylist.name });
    setEditingPlaylist(null);
    setEditDialogOpen(false);
  };
  
  // Handle delete playlist
  const handleDeletePlaylist = async () => {
    if (!deletingPlaylistId) return;
    
    await deletePlaylist(deletingPlaylistId);
    setDeletingPlaylistId(null);
    setDeleteDialogOpen(false);
    
    // If deleting active playlist, clear active selection
    if (deletingPlaylistId === activePlaylistId) {
      setActivePlaylistId(null);
    }
  };
  
  // Handle selecting a playlist
  const handleSelectPlaylist = (id: string) => {
    setActivePlaylistId(id);
  };
  
  // Prepare edit dialog
  const openEditDialog = (playlist: { id: string, name: string }) => {
    setEditingPlaylist(playlist);
    setEditDialogOpen(true);
  };
  
  // Prepare delete dialog
  const openDeleteDialog = (id: string) => {
    setDeletingPlaylistId(id);
    setDeleteDialogOpen(true);
  };
  
  // Handle login redirect
  const handleLoginRedirect = () => {
    navigate("/auth", { state: { from: "/playlists" } });
  };
  
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">My Playlists</h2>
        
        <SignedIn>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#1DB954] hover:text-[#1ed760] hover:bg-[#282828]"
              >
                <PlusCircle className="h-5 w-5 mr-1" />
                New
              </Button>
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
                  onClick={handleCreatePlaylist} 
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
                  disabled={!newPlaylistName.trim()}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SignedIn>
        
        <SignedOut>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#1DB954] hover:text-[#1ed760] hover:bg-[#282828]"
            onClick={handleLoginRedirect}
          >
            <PlusCircle className="h-5 w-5 mr-1" />
            New
          </Button>
        </SignedOut>
      </div>
      
      <SignedIn>
        {playlists.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No playlists yet. Create your first playlist!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {playlists.map(playlist => (
              <li key={playlist.id} className="group">
                <div 
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md cursor-pointer group-hover:bg-[#282828] transition-colors",
                    activePlaylistId === playlist.id ? "bg-[#282828]" : ""
                  )}
                  onClick={() => handleSelectPlaylist(playlist.id)}
                >
                  <span className="text-white truncate">{playlist.name}</span>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#3a3a3a]"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(playlist);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#3a3a3a]"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(playlist.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {/* Edit Playlist Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md bg-[#282828] border-none text-white">
            <DialogHeader>
              <DialogTitle>Edit Playlist</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <Input
                placeholder="Playlist name"
                value={editingPlaylist?.name || ""}
                onChange={(e) => setEditingPlaylist(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="bg-[#3a3a3a] border-none text-white"
              />
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-gray-700 text-white hover:bg-[#3a3a3a]"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditPlaylist} 
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
                disabled={!editingPlaylist?.name.trim()}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Playlist Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md bg-[#282828] border-none text-white">
            <DialogHeader>
              <DialogTitle>Delete Playlist</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p>Are you sure you want to delete this playlist? This action cannot be undone.</p>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-gray-700 text-white hover:bg-[#3a3a3a]"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeletePlaylist} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SignedIn>
      
      <SignedOut>
        <div className="text-center py-6 text-gray-400">
          <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Sign in to create and manage playlists</p>
          <Button 
            className="mt-4 bg-[#1DB954] hover:bg-[#1ed760] text-black"
            onClick={handleLoginRedirect}
          >
            Sign In
          </Button>
        </div>
      </SignedOut>
    </div>
  );
};
