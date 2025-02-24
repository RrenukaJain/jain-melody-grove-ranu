
import { useState } from "react";
import { Home, Search, Library, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

export const Navbar = () => {
  const [open, setOpen] = useState(false);

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
                  <NavItem icon={<Home className="h-5 w-5" />} label="Home" active />
                  <NavItem icon={<Library className="h-5 w-5" />} label="Library" />
                </div>
              </SheetContent>
            </Sheet>
            <span className="hidden sm:inline ml-2 text-lg font-semibold">Jain Melody Grove</span>
          </div>

          {/* Center section with search - always visible */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-400 h-4 w-4" />
              <Input 
                type="search"
                placeholder="Search songs..."
                className="w-full pl-10 bg-white/10 border-none text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          
          {/* Right section - desktop navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavItem icon={<Home className="h-5 w-5" />} label="Home" active />
            <NavItem icon={<Library className="h-5 w-5" />} label="Library" />
          </div>

          {/* Sign in button */}
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="text-sm whitespace-nowrap">
              Sign In
            </Button>
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
