export type NewsCategory = 'resultado' | 'club' | 'cantera' | 'evento' | 'general';
export type NewsSource = 'instagram' | 'twitter' | 'facebook' | 'youtube' | 'web';

export interface MediaItem {
  url: string;
  type: string;
  thumbnail?: string;
}

export interface News {
  id: number;
  authorId?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  imageUrl?: string;
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  source?: NewsSource;
  sourceUrl?: string;
  media?: MediaItem[];
  createdAt: string;
  updatedAt: string;
  author?: { id: number; name: string; email: string };
}

export interface NewsListResponse {
  data: News[];
  total: number;
  page: number;
  limit: number;
}

export interface HeroSlide {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  publishedAt: string | null;
  slug: string;
  source?: NewsSource;
  sourceUrl?: string;
}


