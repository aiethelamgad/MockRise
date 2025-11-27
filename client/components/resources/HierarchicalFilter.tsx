import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SKILL_TREE, CategoryName } from "@/config/skillTree";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HierarchicalFilterProps {
  selectedCategory: string;
  selectedSubcategory: string;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryStats?: Array<{ _id: string; count: number }>;
  subcategoryStats?: Array<{
    _id: string;
    subcategories: Array<{ name: string; count: number }>;
  }>;
}

export function HierarchicalFilter({
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  searchQuery,
  onSearchChange,
  categoryStats = [],
  subcategoryStats = [],
}: HierarchicalFilterProps) {
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Get available subcategories based on selected category
  const availableSubcategories = selectedCategory && selectedCategory !== 'all'
    ? (SKILL_TREE[selectedCategory as CategoryName]?.subcategories || [])
    : [];

  // Get subcategory counts from stats
  const getSubcategoryCount = (subcategoryName: string): number => {
    if (!selectedCategory || selectedCategory === 'all') return 0;
    const categoryStat = subcategoryStats.find(stat => 
      stat._id.toLowerCase() === selectedCategory.toLowerCase()
    );
    if (!categoryStat) return 0;
    const subcat = categoryStat.subcategories.find(sub => 
      sub.name.toLowerCase() === subcategoryName.toLowerCase()
    );
    return subcat?.count || 0;
  };

  // Get category count from stats
  const getCategoryCount = (categoryName: string): number => {
    const stat = categoryStats.find(s => 
      s._id.toLowerCase() === categoryName.toLowerCase()
    );
    return stat?.count || 0;
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  const clearFilters = () => {
    onCategoryChange('all');
    onSubcategoryChange('all');
    setSearchInput('');
    onSearchChange('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedSubcategory !== 'all' || searchInput.trim() !== '';

  return (
    <>
      {/* All Filters on Single Horizontal Line */}
      <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-2 mb-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {/* Search Bar */}
        <div className="relative flex-shrink-0 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                onSearchChange('');
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex-shrink-0 min-w-[200px]">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category">
                {selectedCategory === 'all' 
                  ? 'All Categories' 
                  : `${selectedCategory} (${getCategoryCount(selectedCategory)})`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.keys(SKILL_TREE).map((category) => (
                <SelectItem key={category} value={category}>
                  {category} ({getCategoryCount(category)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory Filter - Only show if category is selected */}
        <AnimatePresence>
          {selectedCategory && selectedCategory !== 'all' && availableSubcategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-shrink-0 min-w-[200px]"
            >
              <Select value={selectedSubcategory} onValueChange={onSubcategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Subcategory">
                    {selectedSubcategory === 'all' 
                      ? 'All Subcategories' 
                      : `${selectedSubcategory} (${getSubcategoryCount(selectedSubcategory)})`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subcategories</SelectItem>
                  {availableSubcategories.map((subcategory) => {
                    const count = getSubcategoryCount(subcategory);
                    return (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory} {count > 0 && `(${count})`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={clearFilters}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            <X className="h-4 w-4" />
            Clear
          </motion.button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="gap-2">
              {selectedCategory}
              <button
                onClick={() => {
                  onCategoryChange('all');
                  onSubcategoryChange('all');
                }}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedSubcategory !== 'all' && (
            <Badge variant="secondary" className="gap-2">
              {selectedSubcategory}
              <button
                onClick={() => onSubcategoryChange('all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchInput.trim() && (
            <Badge variant="secondary" className="gap-2">
              Search: {searchInput}
              <button
                onClick={() => {
                  setSearchInput('');
                  onSearchChange('');
                }}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

