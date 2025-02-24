
import { useState } from "react";
import { Home, Search, Library, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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
                  <NavItem icon={<Search className="h-5 w-5" />} label="Search" />
                  <NavItem icon={<Library className="h-5 w-5" />} label="Library" />
                </div>
              </SheetContent>
            </Sheet>
            <span className="ml-2 text-lg font-semibold">Jain Melody Grove</span>
          </div>
          
          <div className="hidden lg:flex items-center space-x-8">
            <NavItem icon={<Home className="h-5 w-5" />} label="Home" active />
            <NavItem icon={<Search className="h-5 w-5" />} label="Search" />
            <NavItem icon={<Library className="h-5 w-5" />} label="Library" />
          </div>

          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="text-sm">
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
