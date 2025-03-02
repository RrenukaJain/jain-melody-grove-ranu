
import { useState } from "react";
import { Home, Search, Library, Menu, LogOut, LogIn, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, SignedIn, SignedOut } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface NavbarProps {
  onSearch: (query: string) => void;
}

export const Navbar = ({ onSearch }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section with menu and logo */}
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-[#121212] border-r border-white/10">
                <div className="flex flex-col space-y-4 mt-6">
                  <Link to="/">
                    <NavItem icon={<Home className="h-5 w-5" />} label="Home" active={window.location.pathname === "/"} />
                  </Link>
                  <Link to="/collection">
                    <NavItem icon={<Library className="h-5 w-5" />} label="Library" active={window.location.pathname === "/collection"} />
                  </Link>
                  
                  <SignedIn>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start space-x-2 w-full"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </Button>
                  </SignedIn>
                  
                  <SignedOut>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start space-x-2 w-full"
                      onClick={handleLogin}
                    >
                      <LogIn className="h-5 w-5" />
                      <span>Sign In</span>
                    </Button>
                  </SignedOut>
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="ml-2">
              <span className="hidden sm:inline text-lg font-semibold">Jain Melody Grove</span>
            </Link>
          </div>

          {/* Center section with search - always visible */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-400 h-4 w-4" />
              <Input 
                type="search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search songs..."
                className="w-full pl-10 bg-white/10 border-none text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          
          {/* Right section - desktop navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/">
              <NavItem icon={<Home className="h-5 w-5" />} label="Home" active={window.location.pathname === "/"} />
            </Link>
            <Link to="/collection">
              <NavItem icon={<Library className="h-5 w-5" />} label="Library" active={window.location.pathname === "/collection"} />
            </Link>
          </div>

          {/* Sign in/out button */}
          <div className="flex items-center">
            <SignedIn>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <User className="h-5 w-5 mr-2" />
                    <span className="hidden md:inline">{user?.username || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#262626] border-none text-white" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-[#333]"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>
            
            <SignedOut>
              <Button variant="ghost" size="sm" className="text-sm whitespace-nowrap" onClick={handleLogin}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ 
  icon, 
  label, 
  active 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
}) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "flex items-center space-x-2 w-full justify-start",
        active && "bg-jain-blue/20"
      )}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
};
