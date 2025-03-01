
import { ChevronUp } from "lucide-react";

interface DrawerToggleProps {
  onClick: () => void;
}

export const DrawerToggle = ({ onClick }: DrawerToggleProps) => {
  return (
    <div 
      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-[#282828] p-1 rounded-full hover:bg-[#3E3E3E] transition-colors">
        <ChevronUp className="h-5 w-5 text-white" />
      </div>
    </div>
  );
};
