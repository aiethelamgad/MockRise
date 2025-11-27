/**
 * Hierarchical Skill Tree Configuration for Frontend
 * Defines categories, subcategories for resource filtering
 */
export const SKILL_TREE = {
  'Front-End Development': {
    subcategories: [
      'HTML',
      'CSS',
      'JavaScript',
      'React',
      'Next.js',
      'Vue.js',
      'Tailwind',
      'Bootstrap',
    ],
  },
  'Back-End Development': {
    subcategories: [
      'Node.js',
      'Express',
      'Django',
      'Flask',
      'Laravel',
      'PHP',
      'MongoDB',
      'PostgreSQL',
    ],
  },
  'Full-Stack Development': {
    subcategories: [],
  },
  'Mobile Development': {
    subcategories: [
      'Flutter',
      'React Native',
    ],
  },
  'DevOps & Cloud': {
    subcategories: [
      'Docker',
      'Kubernetes',
      'CI/CD',
      'AWS',
      'GCP',
      'Azure',
    ],
  },
  'Software Testing & QA': {
    subcategories: [
      'Manual Testing',
      'Automation Testing',
      'Cypress',
      'Selenium',
      'API Testing',
    ],
  },
  'UI/UX Design': {
    subcategories: [
      'UI Fundamentals',
      'UX Research',
      'Wireframing & Prototyping',
      'Figma Tutorials',
      'Design Systems',
      'Usability Testing',
    ],
  },
  'Soft Skills & Career': {
    subcategories: [
      'Communication',
      'Interview Preparation',
      'Leadership',
      'Productivity',
    ],
  },
} as const;

export type CategoryName = keyof typeof SKILL_TREE;
export type SubcategoryName = typeof SKILL_TREE[CategoryName]['subcategories'][number];

// Helper function to get Cloudinary thumbnail URL
// Using Cloudinary transformations for optimized images
export const getCloudinaryThumbnail = (
  resourceType: 'guide' | 'video' | 'question_bank' | 'course' | 'article',
  subcategory?: string
): string => {
  // Using Cloudinary demo account with transformations for different resource types
  const cloudinaryBase = 'https://res.cloudinary.com/demo/image/upload';
  
  // Default thumbnails based on resource type with transformations
  const thumbnails: Record<string, string> = {
    guide: `${cloudinaryBase}/w_400,h_200,c_fill,e_blur:300,q_auto/sample.jpg`, // Guide thumbnail
    video: `${cloudinaryBase}/w_400,h_200,c_fill,q_auto/video.jpg`, // Video thumbnail
    question_bank: `${cloudinaryBase}/w_400,h_200,c_fill,e_art:hokusai,q_auto/sample.jpg`, // Question bank
    course: `${cloudinaryBase}/w_400,h_200,c_fill,e_brightness:10,q_auto/sample.jpg`, // Course
    article: `${cloudinaryBase}/w_400,h_200,c_fill,e_sharpen,q_auto/sample.jpg`, // Article
  };
  
  // Fallback to Unsplash for reliable placeholder images if Cloudinary fails
  const fallbacks: Record<string, string> = {
    guide: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
    video: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop',
    question_bank: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop',
    course: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=200&fit=crop',
    article: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop',
  };
  
  // Return Cloudinary URL, fallback handled in component
  return thumbnails[resourceType] || fallbacks[resourceType] || fallbacks.guide;
};

