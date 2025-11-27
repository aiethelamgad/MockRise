import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2, Eye, BookOpen, FileText, Star, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

export type Question = {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  tags: string[];
  usageCount: number;
  lastUsed: string;
};

export type ContentResource = {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  views: number;
  rating: number;
  lastUpdated: string;
};

export default function QuestionsManagement() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for questions
  const [questions] = useState<Question[]>([
    {
      id: '1',
      text: 'Explain the concept of dependency injection',
      category: 'Software Design',
      difficulty: 'Intermediate',
      tags: ['Design Patterns', 'Architecture'],
      usageCount: 45,
      lastUsed: '2025-10-28'
    },
    {
      id: '2',
      text: 'What is the difference between REST and GraphQL?',
      category: 'API Design',
      difficulty: 'Intermediate',
      tags: ['API', 'Backend'],
      usageCount: 32,
      lastUsed: '2025-10-25'
    },
  ]);

  // Mock data for content resources (from dashboard Content category)
  const [contentResources] = useState<ContentResource[]>([
    {
      id: "1",
      title: "Technical Interview Guide",
      type: "Guide",
      category: "Technical",
      status: "published",
      views: 1250,
      rating: 4.7,
      lastUpdated: "2024-01-10",
    },
    {
      id: "2",
      title: "Behavioral Questions Bank",
      type: "Question Bank",
      category: "Behavioral",
      status: "draft",
      views: 890,
      rating: 4.5,
      lastUpdated: "2024-01-12",
    },
    {
      id: "3",
      title: "System Design Interview Prep",
      type: "Course",
      category: "Technical",
      status: "published",
      views: 2100,
      rating: 4.8,
      lastUpdated: "2024-01-08",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || q.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const filteredContent = contentResources.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Summary stats
  const stats = {
    totalQuestions: questions.length,
    totalContent: contentResources.length,
    published: contentResources.filter(c => c.status === 'published').length,
    drafts: contentResources.filter(c => c.status === 'draft').length,
    totalViews: contentResources.reduce((sum, c) => sum + c.views, 0),
    avgRating: contentResources.reduce((sum, c) => sum + c.rating, 0) / contentResources.length || 0,
  };

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Question Bank & Content Management</h1>
        <p className="text-muted-foreground">
          Manage interview questions and educational content resources
        </p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
      >
        <EnhancedCard className="p-4" variant="elevated">
          <p className="text-sm text-muted-foreground">Total Questions</p>
          <p className="text-2xl font-bold mt-1">{stats.totalQuestions}</p>
        </EnhancedCard>
        <EnhancedCard className="p-4" variant="elevated">
          <p className="text-sm text-muted-foreground">Content Items</p>
          <p className="text-2xl font-bold mt-1">{stats.totalContent}</p>
        </EnhancedCard>
        <EnhancedCard className="p-4" variant="elevated">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="text-2xl font-bold mt-1 text-success">{stats.published}</p>
        </EnhancedCard>
        <EnhancedCard className="p-4" variant="elevated">
          <p className="text-sm text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold mt-1">{stats.drafts}</p>
        </EnhancedCard>
        <EnhancedCard className="p-4" variant="elevated">
          <p className="text-sm text-muted-foreground">Total Views</p>
          <p className="text-2xl font-bold mt-1">{stats.totalViews.toLocaleString()}</p>
        </EnhancedCard>
        <EnhancedCard className="p-4" variant="elevated">
          <p className="text-sm text-muted-foreground">Avg Rating</p>
          <p className="text-2xl font-bold mt-1 flex items-center gap-1">
            <Star className="h-5 w-5 text-warning fill-current" />
            {stats.avgRating.toFixed(1)}
          </p>
        </EnhancedCard>
      </motion.div>

      {/* Content Resources Section */}
      <EnhancedCard className="p-6" variant="elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Content Management
          </h2>
          <EnhancedButton>
            <FileText className="h-4 w-4 mr-2" />
            Create Content
          </EnhancedButton>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content by title or category..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <EnhancedButton variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </EnhancedButton>
        </div>

        <div className="space-y-4">
          {filteredContent.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {resource.type} • {resource.category}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{resource.views} views</span>
                      <span>Updated: {new Date(resource.lastUpdated).toLocaleDateString()}</span>
                      {resource.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-warning fill-current" />
                          {resource.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(resource.status)}>
                    {resource.status}
                  </Badge>
                  <EnhancedButton variant="outline" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </EnhancedButton>
                  <EnhancedButton variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </EnhancedButton>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </EnhancedCard>

      {/* Questions Section */}
      <EnhancedCard className="p-6" variant="elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Interview Questions
          </h2>
          <EnhancedButton>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </EnhancedButton>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="behavioral">Behavioral</SelectItem>
              <SelectItem value="system-design">System Design</SelectItem>
            </SelectContent>
          </Select>
          <EnhancedButton variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </EnhancedButton>
        </div>

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Question</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Difficulty</th>
                <th className="text-left p-4 font-medium">Tags</th>
                <th className="text-left p-4 font-medium">Usage</th>
                <th className="text-left p-4 font-medium">Last Used</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 max-w-md">{question.text}</td>
                  <td className="p-4">{question.category}</td>
                  <td className="p-4">
                    <Badge variant={
                      question.difficulty === 'Easy' ? 'default' :
                      question.difficulty === 'Intermediate' ? 'secondary' : 'destructive'
                    }>
                      {question.difficulty}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {question.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">{question.usageCount}</td>
                  <td className="p-4">{new Date(question.lastUsed).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <EnhancedButton variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </EnhancedButton>
                      <EnhancedButton variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </EnhancedButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EnhancedCard>
    </div>
  );
}