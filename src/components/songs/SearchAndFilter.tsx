
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SortAsc, SortDesc, Filter } from "lucide-react";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  sortBy: "title" | "duration" | "popularity";
  onSortChange: (by: "title" | "duration" | "popularity") => void;
  onSortOrderChange: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  sortOrder,
  sortBy,
  onSortChange,
  onSortOrderChange,
  selectedCategory,
  onCategoryChange,
}: SearchAndFilterProps) => {
  const categories = ["All", "Bhajan", "Stavan", "Stuti", "Aarti"];

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-[#282828] border-none text-white placeholder:text-gray-400"
        />
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap gap-2">
        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSortOrderChange}
            className="bg-[#282828] border-none text-white hover:bg-[#383838]"
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant={sortBy === "title" ? "default" : "outline"}
            size="sm"
            onClick={() => onSortChange("title")}
            className={sortBy === "title" ? "bg-[#1DB954] hover:bg-[#1ed760]" : "bg-[#282828] border-none text-white hover:bg-[#383838]"}
          >
            Name
          </Button>
          <Button
            variant={sortBy === "duration" ? "default" : "outline"}
            size="sm"
            onClick={() => onSortChange("duration")}
            className={sortBy === "duration" ? "bg-[#1DB954] hover:bg-[#1ed760]" : "bg-[#282828] border-none text-white hover:bg-[#383838]"}
          >
            Duration
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 ml-auto">
          <Filter className="h-4 w-4 text-gray-400" />
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className={selectedCategory === category ? "bg-[#1DB954] hover:bg-[#1ed760]" : "bg-[#282828] border-none text-white hover:bg-[#383838]"}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
