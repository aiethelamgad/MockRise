import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, MoreVertical, Edit, Eye, Trash2, BookOpen, Video, FileText, Loader2, X, Star, Clock, Book, GraduationCap } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { resourceService, Resource, CreateResourceData, UpdateResourceData, ResourceType, DifficultyLevel } from '@/services/resource.service';
import { HierarchicalFilter } from '@/components/resources/HierarchicalFilter';
import { SKILL_TREE, CategoryName } from '@/config/skillTree';

const RESOURCE_TYPES: { value: ResourceType; label: string; icon: typeof BookOpen }[] = [
  { value: 'guide', label: 'Guide', icon: BookOpen },
  { value: 'video', label: 'Video Tutorial', icon: Video },
  { value: 'question_bank', label: 'Question Bank', icon: FileText },
  { value: 'course', label: 'Course', icon: GraduationCap },
  { value: 'article', label: 'Article', icon: Book },
];

const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string; color: string }[] = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
];

export default function ResourcesManagement() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    guides: 0,
    videos: 0,
    question_banks: 0,
    courses: 0,
    articles: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all');
  const [categoryStats, setCategoryStats] = useState<Array<{_id: string; count: number}>>([]);
  const [subcategoryStats, setSubcategoryStats] = useState<Array<{
    _id: string;
    subcategories: Array<{ name: string; count: number }>;
  }>>([]);

  // Modal states
  const [addResourceOpen, setAddResourceOpen] = useState(false);
  const [editResourceOpen, setEditResourceOpen] = useState(false);
  const [viewResourceOpen, setViewResourceOpen] = useState(false);
  const [deleteResourceOpen, setDeleteResourceOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Form states
  const [resourceForm, setResourceForm] = useState<CreateResourceData>({
    resourceType: 'guide',
    title: '',
    description: '',
    difficulty: 'beginner',
    category: '',
    contentUrl: '',
    thumbnailUrl: '',
    tags: [],
    duration: '',
    author: '',
  });

  // Fetch resources
  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const response = await resourceService.getResources({
        page: 1,
        limit: 100,
        resourceType: typeFilter !== 'all' ? typeFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        subcategory: subcategoryFilter !== 'all' ? subcategoryFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        search: searchQuery || undefined,
      });

      setResources(response.data);
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
      toast.error(error.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, categoryFilter, subcategoryFilter, difficultyFilter, searchQuery]);

  // Reset subcategory when category changes
  useEffect(() => {
    if (categoryFilter === 'all') {
      setSubcategoryFilter('all');
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Get unique categories from resources
  const categories = Array.from(new Set(resources.map(r => r.category))).sort();

  // Get difficulty color
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    return DIFFICULTY_LEVELS.find(d => d.value === difficulty)?.color || 'bg-gray-100 text-gray-800';
  };

  // Get resource type icon
  const getResourceTypeIcon = (type: ResourceType) => {
    return RESOURCE_TYPES.find(t => t.value === type)?.icon || BookOpen;
  };

  // Reset form
  const resetForm = () => {
    setResourceForm({
      resourceType: 'guide',
      title: '',
      description: '',
      difficulty: 'beginner',
      category: '',
      subcategory: null,
      contentUrl: '',
      thumbnailUrl: '',
      tags: [],
      duration: '',
      author: '',
    });
    setSelectedResource(null);
  };

  // Open modals
  const openAddModal = () => {
    resetForm();
    setAddResourceOpen(true);
  };

  const openEditModal = (resource: Resource) => {
    setSelectedResource(resource);
    setResourceForm({
      resourceType: resource.resourceType,
      title: resource.title,
      description: resource.description,
      difficulty: resource.difficulty,
      category: resource.category,
      subcategory: resource.subcategory || null,
      contentUrl: resource.contentUrl || (resource.contentUrl === null ? '' : ''),
      thumbnailUrl: resource.thumbnailUrl || '',
      tags: resource.tags || [],
      duration: resource.duration || '',
      author: resource.author || '',
      questionText: resource.questionText || '',
      answerSample: resource.answerSample || '',
    });
    setEditResourceOpen(true);
  };

  const openViewModal = (resource: Resource) => {
    setSelectedResource(resource);
    setViewResourceOpen(true);
  };

  const openDeleteModal = (resource: Resource) => {
    setSelectedResource(resource);
    setDeleteResourceOpen(true);
  };

  // Handle create
  const handleCreate = async () => {
    try {
      if (!resourceForm.title || !resourceForm.description || !resourceForm.category || !resourceForm.contentUrl || !resourceForm.subcategory) {
        toast.error('Please fill in all required fields, including subcategory');
        return;
      }

      await resourceService.createResource(resourceForm);
      toast.success('Resource created successfully');
      setAddResourceOpen(false);
      resetForm();
      fetchResources();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create resource');
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!selectedResource) return;

    try {
      if (!resourceForm.title || !resourceForm.description || !resourceForm.category || !resourceForm.contentUrl) {
        toast.error('Please fill in all required fields');
        return;
      }

      await resourceService.updateResource(selectedResource._id, resourceForm);
      toast.success('Resource updated successfully');
      setEditResourceOpen(false);
      resetForm();
      fetchResources();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update resource');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedResource) return;

    try {
      await resourceService.deleteResource(selectedResource._id);
      toast.success('Resource deleted successfully');
      setDeleteResourceOpen(false);
      setSelectedResource(null);
      fetchResources();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete resource');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Resource Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage guides, videos, courses, articles, and question banks
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4"
      >
        <EnhancedCard className="p-4" variant="elevated">
          <p className="text-sm text-muted-foreground">Total Resources</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </EnhancedCard>
        <EnhancedCard className="p-4" variant="elevated">
          <p className="text-sm text-muted-foreground">Guides</p>
          <p className="text-2xl font-bold mt-1">{stats.guides}</p>
        </EnhancedCard>
        <EnhancedCard className="p-4" variant="elevated">
          <p className="text-sm text-muted-foreground">Videos</p>
          <p className="text-2xl font-bold mt-1">{stats.videos}</p>
        </EnhancedCard>
        <EnhancedCard className="p-4" variant="elevated">
          <p className="text-sm text-muted-foreground">Question Banks</p>
          <p className="text-2xl font-bold mt-1">{stats.question_banks}</p>
        </EnhancedCard>
        <EnhancedCard className="p-4" variant="elevated">
          <p className="text-sm text-muted-foreground">Courses</p>
          <p className="text-2xl font-bold mt-1">{stats.courses}</p>
        </EnhancedCard>
        <EnhancedCard className="p-4" variant="elevated">
          <p className="text-sm text-muted-foreground">Articles</p>
          <p className="text-2xl font-bold mt-1">{stats.articles}</p>
        </EnhancedCard>
      </motion.div>

      {/* Search and Filters */}
      <EnhancedCard className="p-6" variant="elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            All Resources
          </h2>
          <EnhancedButton onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </EnhancedButton>
        </div>

        {/* All Filters on Single Horizontal Line - Full Width */}
        <div className="w-full">
          <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap items-stretch sm:items-center gap-3 overflow-x-auto pb-2 mb-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {/* Resource Type Filter */}
            <div className="flex-shrink-0 min-w-[150px]">
              <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                <SelectTrigger className="w-full focus:border-2 focus:border-primary focus:border-t-2 focus:border-l-2">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {RESOURCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

            {/* Search - Larger and more prominent */}
            <div className="relative flex-1 min-w-full sm:min-w-[300px]">
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full focus:border-2 focus:border-primary focus:border-t-2 focus:border-l-2">
                  <SelectValue placeholder="Category">
                    {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
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

            {/* Subcategory Filter */}
            {categoryFilter && categoryFilter !== 'all' && (
              <div className="flex-shrink-0 min-w-[200px]">
                <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
                  <SelectTrigger className="w-full focus:border-2 focus:border-primary focus:border-t-2 focus:border-l-2">
                    <SelectValue placeholder="Subcategory">
                      {subcategoryFilter === 'all' ? 'All Subcategories' : subcategoryFilter}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subcategories</SelectItem>
                    {(() => {
                      // Get subcategories from stats if available, otherwise fallback to SKILL_TREE
                      const categoryStat = subcategoryStats.find(s => 
                        s._id.toLowerCase() === categoryFilter.toLowerCase()
                      );
                      
                      if (categoryStat && categoryStat.subcategories && categoryStat.subcategories.length > 0) {
                        return categoryStat.subcategories.map((sub) => (
                          <SelectItem key={sub.name} value={sub.name}>
                            {sub.name} ({sub.count || 0})
                          </SelectItem>
                        ));
                      }
                      
                      // Fallback to SKILL_TREE structure
                      return (SKILL_TREE[categoryFilter as CategoryName]?.subcategories || []).map((subcategory) => (
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
            <div className="flex-shrink-0 min-w-[150px]">
              <Select value={difficultyFilter} onValueChange={(value: any) => setDifficultyFilter(value)}>
                <SelectTrigger className="w-full focus:border-2 focus:border-primary focus:border-t-2 focus:border-l-2">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {DIFFICULTY_LEVELS.map((diff) => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {(typeFilter !== 'all' || categoryFilter !== 'all' || subcategoryFilter !== 'all' || difficultyFilter !== 'all' || searchQuery.trim()) && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setCategoryFilter('all');
                setSubcategoryFilter('all');
                setDifficultyFilter('all');
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
        {(typeFilter !== 'all' || categoryFilter !== 'all' || subcategoryFilter !== 'all' || difficultyFilter !== 'all' || searchQuery.trim()) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {typeFilter !== 'all' && (
              <Badge variant="secondary" className="gap-2">
                Type: {RESOURCE_TYPES.find(t => t.value === typeFilter)?.label}
                <button
                  onClick={() => setTypeFilter('all')}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {categoryFilter !== 'all' && (
              <Badge variant="secondary" className="gap-2">
                {categoryFilter}
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setSubcategoryFilter('all');
                  }}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {subcategoryFilter !== 'all' && (
              <Badge variant="secondary" className="gap-2">
                {subcategoryFilter}
                <button
                  onClick={() => setSubcategoryFilter('all')}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {difficultyFilter !== 'all' && (
              <Badge variant="secondary" className="gap-2">
                {difficultyFilter}
                <button
                  onClick={() => setDifficultyFilter('all')}
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

        {/* Resources List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No resources found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => {
              const TypeIcon = getResourceTypeIcon(resource.resourceType);
              return (
                <motion.div
                  key={resource._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors relative"
                >
                  {/* Kebab Menu - Top Right Corner */}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <EnhancedButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </EnhancedButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openViewModal(resource)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(resource)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteModal(resource)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-start justify-between mb-2 pr-8">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-primary" />
                      <Badge className={getDifficultyColor(resource.difficulty)}>
                        {resource.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1">{resource.title || 'Untitled Resource'}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {resource.description || 'No description'}
                  </p>
                  
                  {/* Tags Display - Show all tags as exact keywords, no counts */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {resource.tags.map((tag, tagIndex) => (
                        <Badge 
                          key={tagIndex} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{resource.category || 'Uncategorized'}</span>
                    {resource.subcategory && <span>{resource.subcategory}</span>}
                    {(resource.views || 0) > 0 && <span>{resource.views} views</span>}
                    {resource.questionText && (
                      <span className="text-primary">Has Question Text</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </EnhancedCard>

      {/* Add Resource Modal */}
      <Dialog open={addResourceOpen} onOpenChange={setAddResourceOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
            <DialogDescription>Create a new resource for the platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add-type">Resource Type *</Label>
                <Select
                  value={resourceForm.resourceType}
                  onValueChange={(value: any) => setResourceForm({ ...resourceForm, resourceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="add-difficulty">Difficulty Level *</Label>
                <Select
                  value={resourceForm.difficulty}
                  onValueChange={(value: any) => setResourceForm({ ...resourceForm, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="add-title">Title *</Label>
              <Input
                id="add-title"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                placeholder="Enter resource title"
              />
            </div>
            <div>
              <Label htmlFor="add-description">Description *</Label>
              <Textarea
                id="add-description"
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                placeholder="Enter resource description"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="add-category">Category *</Label>
              <Select
                value={resourceForm.category || ''}
                onValueChange={(value) => {
                  setResourceForm({ 
                    ...resourceForm, 
                    category: value,
                    subcategory: null // Reset subcategory when category changes
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryStats.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat._id}
                    </SelectItem>
                  ))}
                  {categoryStats.length === 0 && Object.keys(SKILL_TREE).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {resourceForm.category && resourceForm.category !== '' && (
              <div>
                <Label htmlFor="add-subcategory">Subcategory *</Label>
                <Select
                  value={resourceForm.subcategory || ''}
                  onValueChange={(value) => {
                    setResourceForm({ ...resourceForm, subcategory: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      // Get subcategories from SKILL_TREE based on selected category
                      const categoryData = SKILL_TREE[resourceForm.category as CategoryName];
                      if (categoryData && categoryData.subcategories && categoryData.subcategories.length > 0) {
                        return categoryData.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ));
                      }
                      return <SelectItem value="none" disabled>No subcategories available</SelectItem>;
                    })()}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="add-content-url">Content URL *</Label>
              <Input
                id="add-content-url"
                value={resourceForm.contentUrl}
                onChange={(e) => setResourceForm({ ...resourceForm, contentUrl: e.target.value })}
                placeholder="URL to PDF, video, or external link"
              />
            </div>
            <div>
              <Label htmlFor="add-thumbnail-url">Thumbnail URL</Label>
              <Input
                id="add-thumbnail-url"
                value={resourceForm.thumbnailUrl}
                onChange={(e) => setResourceForm({ ...resourceForm, thumbnailUrl: e.target.value })}
                placeholder="Optional thumbnail image URL"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add-duration">Duration</Label>
                <Input
                  id="add-duration"
                  value={resourceForm.duration}
                  onChange={(e) => setResourceForm({ ...resourceForm, duration: e.target.value })}
                  placeholder="e.g., 2 hours"
                />
              </div>
              <div>
                <Label htmlFor="add-author">Author</Label>
                <Input
                  id="add-author"
                  value={resourceForm.author}
                  onChange={(e) => setResourceForm({ ...resourceForm, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="add-tags">Tags (comma-separated)</Label>
              <Input
                id="add-tags"
                value={resourceForm.tags?.join(', ') || ''}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                  setResourceForm({ ...resourceForm, tags });
                }}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
          <DialogFooter>
            <EnhancedButton variant="outline" onClick={() => setAddResourceOpen(false)}>
              Cancel
            </EnhancedButton>
            <EnhancedButton onClick={handleCreate}>
              Create Resource
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Modal - Similar structure to Add Modal */}
      <Dialog open={editResourceOpen} onOpenChange={setEditResourceOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>Update resource information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Same form fields as Add Modal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Resource Type *</Label>
                <Select
                  value={resourceForm.resourceType}
                  onValueChange={(value: any) => setResourceForm({ ...resourceForm, resourceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-difficulty">Difficulty Level *</Label>
                <Select
                  value={resourceForm.difficulty}
                  onValueChange={(value: any) => setResourceForm({ ...resourceForm, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category *</Label>
              <Select
                value={resourceForm.category || ''}
                onValueChange={(value) => {
                  setResourceForm({ 
                    ...resourceForm, 
                    category: value,
                    subcategory: null // Reset subcategory when category changes
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryStats.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat._id}
                    </SelectItem>
                  ))}
                  {categoryStats.length === 0 && Object.keys(SKILL_TREE).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {resourceForm.category && resourceForm.category !== '' && (
              <div>
                <Label htmlFor="edit-subcategory">Subcategory</Label>
                <Select
                  value={resourceForm.subcategory || ''}
                  onValueChange={(value) => {
                    setResourceForm({ ...resourceForm, subcategory: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      // Get subcategories from SKILL_TREE based on selected category
                      const categoryData = SKILL_TREE[resourceForm.category as CategoryName];
                      if (categoryData && categoryData.subcategories && categoryData.subcategories.length > 0) {
                        return categoryData.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ));
                      }
                      return <SelectItem value="none" disabled>No subcategories available</SelectItem>;
                    })()}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="edit-content-url">Content URL *</Label>
              <Input
                id="edit-content-url"
                value={resourceForm.contentUrl}
                onChange={(e) => setResourceForm({ ...resourceForm, contentUrl: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-thumbnail-url">Thumbnail URL</Label>
              <Input
                id="edit-thumbnail-url"
                value={resourceForm.thumbnailUrl}
                onChange={(e) => setResourceForm({ ...resourceForm, thumbnailUrl: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={resourceForm.duration}
                  onChange={(e) => setResourceForm({ ...resourceForm, duration: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-author">Author</Label>
                <Input
                  id="edit-author"
                  value={resourceForm.author}
                  onChange={(e) => setResourceForm({ ...resourceForm, author: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={resourceForm.tags?.join(', ') || ''}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                  setResourceForm({ ...resourceForm, tags });
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <EnhancedButton variant="outline" onClick={() => setEditResourceOpen(false)}>
              Cancel
            </EnhancedButton>
            <EnhancedButton onClick={handleUpdate}>
              Update Resource
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Resource Modal */}
      <Dialog open={viewResourceOpen} onOpenChange={setViewResourceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedResource?.title}</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <p className="font-medium">{RESOURCE_TYPES.find(t => t.value === selectedResource.resourceType)?.label}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="font-medium">{selectedResource.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <p className="font-medium">{selectedResource.category}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Difficulty</Label>
                  <Badge className={getDifficultyColor(selectedResource.difficulty)}>
                    {selectedResource.difficulty}
                  </Badge>
                </div>
              </div>
              {selectedResource.tags && selectedResource.tags.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedResource.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Content URL</Label>
                {selectedResource.contentUrl ? (
                  <a 
                    href={selectedResource.contentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline break-all"
                  >
                    {selectedResource.contentUrl}
                  </a>
                ) : (
                  <p className="text-muted-foreground text-sm">No content URL provided</p>
                )}
              </div>
              {selectedResource.thumbnailUrl && (
                <div>
                  <Label className="text-xs text-muted-foreground">Thumbnail</Label>
                  <img 
                    src={selectedResource.thumbnailUrl} 
                    alt={selectedResource.title} 
                    className="mt-2 rounded-lg max-w-full h-auto max-h-48"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {selectedResource.questionText && (
                <div>
                  <Label className="text-xs text-muted-foreground">Question Text</Label>
                  <p className="font-medium mt-1">{selectedResource.questionText}</p>
                </div>
              )}
              {selectedResource.answerSample && (
                <div>
                  <Label className="text-xs text-muted-foreground">Sample Answer</Label>
                  <p className="font-medium mt-1">{selectedResource.answerSample}</p>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Views</Label>
                <p className="font-medium">{selectedResource.views || 0}</p>
              </div>
              {selectedResource.subcategory && (
                <div>
                  <Label className="text-xs text-muted-foreground">Subcategory</Label>
                  <p className="font-medium">{selectedResource.subcategory}</p>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Created</Label>
                <p className="font-medium">{formatDate(selectedResource.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteResourceOpen} onOpenChange={setDeleteResourceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedResource?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <EnhancedButton variant="outline" onClick={() => setDeleteResourceOpen(false)}>
              Cancel
            </EnhancedButton>
            <EnhancedButton variant="destructive" onClick={handleDelete}>
              Delete
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

