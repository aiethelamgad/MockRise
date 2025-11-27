import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedHero } from "@/components/AnimatedHero";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PolicyModal } from "@/components/PolicyModal";
import { resourceService, Resource, DifficultyLevel } from "@/services/resource.service";
import { HierarchicalFilter } from "@/components/resources/HierarchicalFilter";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { getCloudinaryThumbnail, SKILL_TREE, CategoryName } from "@/config/skillTree";
import {
  Search,
  Filter,
  BookOpen,
  Video,
  FileText,
  Star,
  Clock,
  User,
  TrendingUp,
  Award,
  Play,
  Bookmark,
  Share2,
  Eye,
  MessageSquare,
  ThumbsUp,
  ChevronRight,
  Sparkles,
  Target,
  Brain,
  Zap,
  CheckCircle2,
  Facebook,
  Instagram,
  Lock,
  LinkedinIcon,
  Twitter,
  Users,
  Loader2,
  Book,
  GraduationCap,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "all">("all");
  const [activeTab, setActiveTab] = useState("guides");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Resource data from API
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    guides: 0,
    videos: 0,
    question_banks: 0,
    courses: 0,
    articles: 0,
  });
  const [categoryStats, setCategoryStats] = useState<Array<{_id: string; count: number}>>([]);
  const [subcategoryStats, setSubcategoryStats] = useState<Array<{
    _id: string;
    subcategories: Array<{ name: string; count: number }>;
  }>>([]);

  // Map resource type to tab name
  const getResourceTypeFromTab = (tab: string): Resource["resourceType"] | undefined => {
    switch (tab) {
      case "guides":
        return "guide";
      case "videos":
        return "video";
      case "questions":
        return "question_bank";
      case "courses":
        return "course";
      case "articles":
        return "article";
      default:
        return undefined;
    }
  };

  // Fetch all resources
  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const resourceType = getResourceTypeFromTab(activeTab);
      
      // Fetch resources for current tab
      // Apply filters correctly:
      // - Category can be applied independently
      // - Subcategory can only be applied when category is also selected
      // - When both are selected, both filters are applied
      // - When no filters are selected, show all resources
      const categoryFilter = selectedCategory !== "all" ? selectedCategory : undefined;
      const subcategoryFilter = selectedCategory !== "all" && selectedSubcategory !== "all" 
        ? selectedSubcategory 
        : undefined;
      
      const response = await resourceService.getResources({
        resourceType: resourceType || "all",
        category: categoryFilter,
        subcategory: subcategoryFilter,
        difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
        search: searchQuery && searchQuery.trim() ? searchQuery.trim() : undefined,
        limit: 100,
      });

      setAllResources(response.data);
      
      if (response.stats) {
        setStats(response.stats);
      }
      
      if (response.categoryStats) {
        setCategoryStats(response.categoryStats);
      }

      if (response.subcategoryStats) {
        setSubcategoryStats(response.subcategoryStats);
      }
    } catch (error: any) {
      console.error("Failed to fetch resources:", error);
      toast.error("Failed to load resources. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategory, selectedSubcategory, selectedDifficulty, searchQuery]);

  // Reset subcategory when category changes
  useEffect(() => {
    // Always reset subcategory when category changes to ensure it's valid for the new category
    setSelectedSubcategory("all");
  }, [selectedCategory]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Resources are already filtered server-side based on:
  // - Resource type (activeTab)
  // - Category filter
  // - Subcategory filter (only when category is selected)
  // - Difficulty filter
  // - Search query
  // So we use them directly - no additional client-side filtering needed
  const filteredResources = allResources;

  const getDifficultyColor = (difficulty: string) => {
    const difficultyLower = difficulty.toLowerCase();
    switch (difficultyLower) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const getTypeIcon = (type: Resource["resourceType"]) => {
    switch (type) {
      case "guide":
        return BookOpen;
      case "video":
        return Video;
      case "question_bank":
        return FileText;
      case "course":
        return GraduationCap;
      case "article":
        return Book;
      default:
        return FileText;
    }
  };

  // Validate and format URL
  const isValidUrl = (url: string | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      // If URL is relative or invalid, check if it's a valid path
      return url.trim().length > 0;
    }
  };

  // Get full URL for content - handle both absolute and relative URLs
  const getContentUrl = (resource: Resource): string | null => {
    if (!resource.contentUrl || typeof resource.contentUrl !== 'string') return null;
    
    const url = resource.contentUrl.trim();
    if (!url || url === 'null' || url === 'undefined') return null;

    // If it's already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative URL, make it absolute using the backend URL
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${backendUrl}${url.startsWith('/') ? url : '/' + url}`;
  };

  // Get thumbnail URL with Cloudinary fallback
  const getThumbnailUrl = (resource: Resource): string => {
    if (resource.thumbnailUrl && typeof resource.thumbnailUrl === 'string' && resource.thumbnailUrl.trim() && 
        resource.thumbnailUrl !== 'null' && resource.thumbnailUrl !== 'undefined' && 
        isValidUrl(resource.thumbnailUrl)) {
      return resource.thumbnailUrl.trim();
    }
    // Use Cloudinary with fallback
    return getCloudinaryThumbnail(resource.resourceType, resource.subcategory || undefined);
  };

  const handleOpen = async (resource: Resource) => {
    try {
      const contentUrl = getContentUrl(resource);
      
      if (!contentUrl) {
        toast.error("This resource doesn't have a valid URL");
        return;
      }

      // Prevent duplicate increments for the same resource within 5 seconds
      const resourceId = resource._id;
      const now = Date.now();
      const lastViewedKey = `viewed_${resourceId}`;
      const lastViewedTime = sessionStorage.getItem(lastViewedKey);
      
      // Only increment if not viewed in the last 5 seconds
      if (!lastViewedTime || (now - parseInt(lastViewedTime)) > 5000) {
        try {
          await resourceService.incrementViews(resourceId);
          // Update local state to reflect the new view count
          setAllResources(prevResources => 
            prevResources.map(r => 
              r._id === resourceId 
                ? { ...r, views: (r.views || 0) + 1 }
                : r
            )
          );
          // Store timestamp to prevent duplicate increments
          sessionStorage.setItem(lastViewedKey, now.toString());
        } catch (viewError) {
          // Silently fail if view increment doesn't work, but still open the resource
          console.error("Failed to increment views:", viewError);
        }
      }

      // Open the resource
      window.open(contentUrl, "_blank", "noopener,noreferrer");
      toast.success("Opening resource...");
    } catch (error: any) {
      console.error("Error opening resource:", error);
      toast.error("Failed to open resource. Please check the URL.");
    }
  };

  const handlePlay = (resource: Resource) => {
    const contentUrl = getContentUrl(resource);
    
    if (!contentUrl) {
      toast.error("This resource doesn't have a valid URL");
      return;
    }

    window.open(contentUrl, "_blank", "noopener,noreferrer");
  };

  // Render resource card based on type
  const renderResourceCard = (resource: Resource, index: number) => {
    const TypeIcon = getTypeIcon(resource.resourceType);
    const difficultyLabel = getDifficultyLabel(resource.difficulty);

    if (resource.resourceType === "video") {
      return (
        <motion.div
          key={resource._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <EnhancedCard className="p-0 overflow-hidden hover-lift h-full" variant="elevated">
            <div className="relative">
              <img
                src={getThumbnailUrl(resource)}
                alt={resource.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <EnhancedButton
                  variant="ghost"
                  size="icon"
                  className="bg-white/90 hover:text-white hover:bg-primary hover:opacity-85 text-black"
                  onClick={() => handlePlay(resource)}
                >
                  <Play className="h-6 w-6" />
                </EnhancedButton>
              </div>
              {resource.duration && (
                <div className="absolute bottom-4 right-4">
                  <Badge className="bg-black/80 text-white">
                    {resource.duration}
                  </Badge>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getDifficultyColor(resource.difficulty)}>
                  {difficultyLabel}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold mb-2">{resource.title || 'Untitled Resource'}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {resource.description || 'No description available'}
              </p>
              
              {/* Tags Display */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {resource.tags.slice(0, 5).map((tag, tagIndex) => (
                    <Badge 
                      key={tagIndex} 
                      variant="outline" 
                      className="text-xs hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {resource.tags.length > 5 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{resource.tags.length - 5} more
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {(resource.views || 0).toLocaleString()} views
                </span>
                {(resource.rating || 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-warning" />
                    {(resource.rating || 0).toFixed(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <EnhancedButton className="flex-1" onClick={() => handlePlay(resource)}>
                  <Play className="h-4 w-4 mr-2" />
                  Watch Now
                </EnhancedButton>
                <EnhancedButton variant="outline" size="icon" className="bg-background/80 hover:bg-[#FFCC00] hover:opacity-95">
                  <Bookmark className="h-4 w-4" />
                </EnhancedButton>
              </div>
            </div>
          </EnhancedCard>
        </motion.div>
      );
    }

    // Default card for guides, question banks, courses, articles
    return (
      <motion.div
        key={resource._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <EnhancedCard className="p-6 hover-lift h-full" variant="elevated">
          <div className="flex items-center gap-2 mb-3">
            <TypeIcon className="h-5 w-5 text-primary" />
            <Badge className={getDifficultyColor(resource.difficulty)}>
              {difficultyLabel}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold mb-2">{resource.title || 'Untitled Resource'}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {resource.description || 'No description available'}
          </p>
          
          {/* Tags Display */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {resource.tags.map((tag, tagIndex) => (
                <Badge 
                  key={tagIndex} 
                  variant="outline" 
                  className="text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {resource.resourceType === 'question_bank' && resource.questionText && (
            <div className="mb-3 text-xs text-muted-foreground">
              <p className="font-medium">Sample Question:</p>
              <p className="line-clamp-2">{resource.questionText}</p>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {(resource.views || 0).toLocaleString()}
              </span>
            </div>
            {(resource.rating || 0) > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-current text-warning" />
                {(resource.rating || 0).toFixed(1)}
              </span>
            )}
            {resource.category && (
              <span className="text-xs text-muted-foreground">{resource.category}</span>
            )}
          </div>
          <EnhancedButton 
            className="w-full" 
            onClick={() => handleOpen(resource)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {resource.resourceType === "course" ? "Enroll Now" : 
             resource.resourceType === "article" ? "Read Article" :
             "Open Resource"}
          </EnhancedButton>
        </EnhancedCard>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="space-y-8 pb-20 lg:pb-8">
          {/* Animated Hero Section */}
          <AnimatedHero
            title="Master Your Interview Skills"
            subtitle="Comprehensive guides, tutorials, and materials to boost your interview skills and land your dream job"
            badge="Learning Resources"
            badgeIcon={Sparkles}
          />

          {/* Mobile Hero Section - Only visible on mobile */}
          <div className="block md:hidden py-8 px-4">
            <div className="container text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-2xl font-bold mb-3">
                  Master Your Interview Skills
                </h1>
                <p className="text-base text-muted-foreground mb-4">
                  Comprehensive guides, tutorials, and materials to boost your interview skills and land your dream job
                </p>
                <EnhancedButton
                  size="lg"
                  onClick={() => window.location.href = '/login?signup=true'}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300 hover:scale-105"
                >
                  Get Started Today
                </EnhancedButton>
              </motion.div>
            </div>
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full px-4"
          >
            <div className="w-full max-w-7xl mx-auto">
              {/* All Filters on Single Horizontal Line */}
              <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-2 mb-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {/* Search Bar - Larger and more prominent */}
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 w-full focus:border-2 focus:border-primary focus:border-t-2 focus:border-l-2"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

              {/* Category Filter */}
              <div className="flex-shrink-0 min-w-[200px]">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full focus:border-2 focus:border-primary focus:border-t-2 focus:border-l-2">
                    <SelectValue placeholder="Category">
                      {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryStats.map((cat) => {
                      const categoryName = cat._id;
                      const count = cat.count || 0;
                      return (
                        <SelectItem key={categoryName} value={categoryName}>
                          {categoryName} ({count})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory Filter - Only show if category is selected */}
              {selectedCategory && selectedCategory !== 'all' && (
                <div className="flex-shrink-0 min-w-[200px]">
                  <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                    <SelectTrigger className="w-full focus:border-2 focus:border-primary focus:border-t-2 focus:border-l-2">
                      <SelectValue placeholder="Subcategory">
                        {selectedSubcategory === 'all' ? 'All Subcategories' : selectedSubcategory}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subcategories</SelectItem>
                      {(() => {
                        // Get subcategories from stats if available, otherwise fallback to SKILL_TREE
                        const categoryStat = subcategoryStats.find(s => 
                          s._id.toLowerCase() === selectedCategory.toLowerCase()
                        );
                        
                        if (categoryStat && categoryStat.subcategories && categoryStat.subcategories.length > 0) {
                          return categoryStat.subcategories.map((sub) => (
                            <SelectItem key={sub.name} value={sub.name}>
                              {sub.name} ({sub.count || 0})
                            </SelectItem>
                          ));
                        }
                        
                        // Fallback to SKILL_TREE structure
                        return (SKILL_TREE[selectedCategory as CategoryName]?.subcategories || []).map((subcategory) => (
                          <SelectItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Difficulty Filter */}
              <div className="flex-shrink-0 min-w-[180px]">
                <Select value={selectedDifficulty} onValueChange={(value: any) => setSelectedDifficulty(value)}>
                  <SelectTrigger className="w-full focus:border-2 focus:border-primary focus:border-t-2 focus:border-l-2">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {(selectedCategory !== 'all' || selectedSubcategory !== 'all' || selectedDifficulty !== 'all' || searchQuery.trim()) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                    setSelectedDifficulty('all');
                    setSearchQuery('');
                  }}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
              </div>
            </div>

            {/* Active Filter Badges */}
            {(selectedCategory !== 'all' || selectedSubcategory !== 'all' || selectedDifficulty !== 'all' || searchQuery.trim()) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="gap-2">
                    {selectedCategory}
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedSubcategory('all');
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
                      onClick={() => setSelectedSubcategory('all')}
                      className="ml-1 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedDifficulty !== 'all' && (
                  <Badge variant="secondary" className="gap-2">
                    {selectedDifficulty}
                    <button
                      onClick={() => setSelectedDifficulty('all')}
                      className="ml-1 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {searchQuery.trim() && (
                  <Badge variant="secondary" className="gap-2">
                    Search: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </motion.div>

          {/* Resource Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="container"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="grid w-full max-w-2xl grid-cols-5">
                  <TabsTrigger value="guides" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Guides ({stats.guides})
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Videos ({stats.videos})
                  </TabsTrigger>
                  <TabsTrigger value="questions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Questions ({stats.question_banks})
                  </TabsTrigger>
                  <TabsTrigger value="courses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Courses ({stats.courses})
                  </TabsTrigger>
                  <TabsTrigger value="articles" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Articles ({stats.articles})
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Content Tabs */}
              {/* Content Tabs */}
              {loading ? (
                <TabsContent value={activeTab} className="space-y-6">
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading resources...</span>
                  </div>
                </TabsContent>
              ) : filteredResources.length === 0 ? (
                <TabsContent value={activeTab} className="space-y-6">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No resources found in this category.</p>
                    <EnhancedButton variant="outline" onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubcategory('all');
                      setSelectedDifficulty('all');
                      setSearchQuery('');
                    }}>
                      Clear Filters
                    </EnhancedButton>
                  </div>
                </TabsContent>
              ) : (
                <TabsContent value={activeTab} className="space-y-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource, index) => (
                      <ResourceCard
                        key={resource._id}
                        resource={resource}
                        index={index}
                        onOpen={handleOpen}
                        onPlay={handlePlay}
                      />
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </motion.div>


          {/* Footer */}
          <footer className="bg-background border-t border-border py-12">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-5 gap-8 mb-8">
                <div>
                  <Link to="/" className="flex items-center space-x-2 group">
                    <div className="relative">
                      <Sparkles className="h-6 w-6 text-primary transition-all duration-300 group-hover:text-secondary group-hover:rotate-12" />
                      <div className="absolute inset-0 blur-lg bg-primary/20 group-hover:bg-secondary/30 transition-all duration-300 -z-10" />
                    </div>
                    <span className="text-xl font-bold gradient-text">MockRise</span>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Empowering job seekers with AI-powered interview practice for a brighter future.
                  </p>

                  {/* Social Media Icons */}
                  <div className="flex gap-2">
                    {[
                      { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
                      { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                      { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                      { icon: LinkedinIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
                    ].map((social, i) => (
                      <motion.a
                        key={i}
                        href={social.href}
                        aria-label={social.label}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-xl bg-muted/20 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <social.icon className="h-5 w-5" />
                      </motion.a>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-lg">Product</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-lg">Resources</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link to="/resources" className="hover:text-primary transition-colors">Resources</Link></li>
                    <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-lg">Company</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
                    <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
                    <li><a href="#resources" className="hover:text-primary transition-colors">Careers</a></li>
                    <li><a href="#resources" className="hover:text-primary transition-colors">Blog</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-lg">Legal</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <button
                        onClick={() => setShowPrivacy(true)}
                        className="hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <Lock className="h-3 w-3" />
                        Privacy Policy
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setShowTerms(true)}
                        className="hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <FileText className="h-3 w-3" />
                        Terms of Service
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
                <p>&copy; 2025 MockRise. All rights reserved.</p>
              </div>
            </div>
          </footer>

          {/* Modals */}
          <PolicyModal
            open={showPrivacy}
            onOpenChange={setShowPrivacy}
            type="privacy"
          />
          <PolicyModal
            open={showTerms}
            onOpenChange={setShowTerms}
            type="terms"
          />
        </div>
      </div>
    </div>
  );
}
