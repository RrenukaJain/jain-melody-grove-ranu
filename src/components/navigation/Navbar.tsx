import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth, SignedIn, SignedOut } from "@/context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, Play, Search, FileAudio, List } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
  { href: "/collection", label: "Collection", icon: <FileAudio className="w-5 h-5" /> },
  { href: "/playlists", label: "Playlists", icon: <List className="w-5 h-5" /> },
];

interface NavbarProps {
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <nav className="bg-[#1a1a1a] border-b border-gray-700 fixed top-0 left-0 right-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Links */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center text-white font-bold text-xl">
            <Play className="mr-2 text-[#1DB954]" />
            JainVaani
          </Link>
          <div className="hidden md:flex space-x-4">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center flex-grow max-w-md">
          <Search className="w-5 h-5 text-gray-500 absolute ml-3 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search..."
            className="bg-[#262626] text-white placeholder-gray-500 pl-10 pr-4 py-2 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#1DB954] transition-shadow duration-200"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Authentication Buttons */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.imageUrl} alt={user?.firstName || "Avatar"} />
                    <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1a1a] border-none text-white">
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer hover:bg-[#262626]">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>
          <SignedOut>
            <Link to="/auth" className="text-white hover:text-[#1DB954] transition-colors duration-200">
              Sign In
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};
