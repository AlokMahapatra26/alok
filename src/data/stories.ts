export interface Comment {
  id: string;
  author: string;
  avatar?: string;
  date: string;
  text: string;
  likes: number;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  featured?: boolean;
  cover_image?: string;
  content: string[];
  initialComments: Comment[];
}

// Add your stories here
export const stories: Story[] = [];
