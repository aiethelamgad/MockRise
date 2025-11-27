/**
 * Hierarchical Skill Tree Configuration
 * Defines categories, subcategories, and skills for resource filtering
 */
const SKILL_TREE = {
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
};

module.exports = { SKILL_TREE };

