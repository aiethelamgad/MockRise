import { motion } from "framer-motion";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Resource } from "@/services/resource.service";
import { getCloudinaryThumbnail } from "@/config/skillTree";
import {
  Play,
  Eye,
  Star,
  Clock,
  Bookmark,
  BookOpen,
  Video,
  FileText,
  GraduationCap,
  Book as BookIcon,
  ExternalLink,
} from "lucide-react";

interface ResourceCardProps {
  resource: Resource;
  index: number;
  onOpen: (resource: Resource) => void;
  onPlay?: (resource: Resource) => void;
}

export function ResourceCard({ resource, index, onOpen, onPlay }: ResourceCardProps) {
  const getTypeIcon = (type: string) => {
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
        return BookIcon;
      default:
        return FileText;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const TypeIcon = getTypeIcon(resource.resourceType);
  const difficultyLabel = getDifficultyLabel(resource.difficulty);
  
  // Use Cloudinary thumbnail or fallback
  const thumbnailUrl = resource.thumbnailUrl || getCloudinaryThumbnail(resource.resourceType, resource.subcategory || undefined);

  // Get action button text based on resource type
  const getActionButtonText = () => {
    switch (resource.resourceType) {
      case "video":
        return "Watch Now";
      case "course":
        return "Enroll Now";
      case "article":
        return "Read Article";
      default:
        return "Open Resource";
    }
  };

  const getActionIcon = () => {
    switch (resource.resourceType) {
      case "video":
        return Play;
      default:
        return ExternalLink;
    }
  };

  const ActionIcon = getActionIcon();
  const handleAction = resource.resourceType === "video" && onPlay ? onPlay : onOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <EnhancedCard 
        className="p-0 overflow-hidden hover-lift h-full flex flex-col" 
        variant="elevated"
      >
        {/* Thumbnail */}
        <div className="relative w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
          {resource.thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={resource.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getCloudinaryThumbnail(resource.resourceType, resource.subcategory || undefined);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
              <TypeIcon className="h-16 w-16 text-primary/50" />
            </div>
          )}
          
          {/* Play button overlay for videos */}
          {resource.resourceType === "video" && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <EnhancedButton
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:text-white hover:bg-primary hover:opacity-85 text-black h-14 w-14"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPlay) onPlay(resource);
                }}
              >
                <Play className="h-7 w-7" />
              </EnhancedButton>
            </div>
          )}

          {/* Duration badge */}
          {resource.duration && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/80 text-white border-0">
                <Clock className="h-3 w-3 mr-1" />
                {resource.duration}
              </Badge>
            </div>
          )}

          {/* Difficulty badge */}
          <div className="absolute top-3 left-3">
            <Badge className={getDifficultyColor(resource.difficulty)}>
              {difficultyLabel}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Category and Subcategory */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {resource.category}
            </Badge>
            {resource.subcategory && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {resource.subcategory}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 min-h-[3.5rem]">
            {resource.title || 'Untitled Resource'}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-1">
            {resource.description || 'No description available'}
          </p>

          {/* Tags - Show all tags as exact keywords, no counts */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {resource.tags.map((tag, tagIndex) => (
                <Badge
                  key={tagIndex}
                  variant="outline"
                  className="text-xs hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {(resource.views || 0).toLocaleString()} {resource.views === 1 ? 'view' : 'views'}
            </span>
            {(resource.rating || 0) > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {(resource.rating || 0).toFixed(1)}
              </span>
            )}
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 mt-auto">
            <EnhancedButton
              className="flex-1"
              onClick={() => handleAction(resource)}
            >
              <ActionIcon className="h-4 w-4 mr-2" />
              {getActionButtonText()}
            </EnhancedButton>
            <EnhancedButton
              variant="outline"
              size="icon"
              className="bg-background/80 hover:bg-primary/10 hover:text-primary"
            >
              <Bookmark className="h-4 w-4" />
            </EnhancedButton>
          </div>
        </div>
      </EnhancedCard>
    </motion.div>
  );
}

