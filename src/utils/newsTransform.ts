
import { GNewsArticle } from '@/hooks/useGNews';

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  readTime: string;
  url: string;
}

export const transformGNewsArticle = (article: GNewsArticle, index: number, category: string): Article => {
  // Generate a simple hash-based ID from the article URL
  const id = Math.abs(article.url.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0)) + index;

  // Estimate read time based on content length
  const wordCount = article.description?.split(' ').length || 100;
  const readTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute

  return {
    id,
    title: article.title,
    excerpt: article.description || 'No description available',
    category: category === 'All' ? 'General' : category,
    author: article.source.name,
    publishedAt: article.publishedAt,
    imageUrl: article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop',
    readTime: `${readTime} min read`,
    url: article.url
  };
};
