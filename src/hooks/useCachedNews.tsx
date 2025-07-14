
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GNewsArticle } from './useGNews';

interface CachedArticle {
  id: string;
  article_id: number;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  source_name: string;
  source_url: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

const GNEWS_API_KEY = 'e9c4d437426b91736f2718aeebaefe7b';
const GNEWS_BASE_URL = 'https://gnews.io/api/v4';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useCachedNews = (category: string = 'general', searchQuery: string = '') => {
  const [shouldFetchFromAPI, setShouldFetchFromAPI] = useState(false);

  // Check if we need fresh data from the API
  const checkCacheAge = async () => {
    try {
      const { data: cachedData, error } = await supabase
        .from('cached_articles')
        .select('created_at')
        .eq('category', category === 'All' ? 'general' : category.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking cache:', error);
        setShouldFetchFromAPI(true);
        return;
      }

      if (!cachedData || cachedData.length === 0) {
        setShouldFetchFromAPI(true);
        return;
      }

      const cacheAge = Date.now() - new Date(cachedData[0].created_at).getTime();
      setShouldFetchFromAPI(cacheAge > CACHE_DURATION);
    } catch (error) {
      console.error('Error checking cache age:', error);
      setShouldFetchFromAPI(true);
    }
  };

  // Fetch fresh data from GNews API
  const fetchFromAPI = async () => {
    let url = `${GNEWS_BASE_URL}/top-headlines?apikey=${GNEWS_API_KEY}&lang=en&max=10`;
    
    if (category !== 'All') {
      url += `&category=${category.toLowerCase()}`;
    }
    
    if (searchQuery.trim()) {
      url = `${GNEWS_BASE_URL}/search?apikey=${GNEWS_API_KEY}&q=${encodeURIComponent(searchQuery)}&lang=en&max=10`;
    }

    console.log('Fetching fresh data from API:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the new data
    await cacheArticles(data.articles, category === 'All' ? 'general' : category);
    
    return data;
  };

  // Cache articles in the database
  const cacheArticles = async (articles: GNewsArticle[], categoryToCache: string) => {
    try {
      // Clear old articles for this category
      await supabase
        .from('cached_articles')
        .delete()
        .eq('category', categoryToCache.toLowerCase());

      // Insert new articles
      const articlesToInsert = articles.map((article, index) => ({
        article_id: Math.abs(article.url.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0)) + index,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image_url: article.image,
        published_at: article.publishedAt,
        source_name: article.source.name,
        source_url: article.source.url,
        category: categoryToCache.toLowerCase()
      }));

      const { error } = await supabase
        .from('cached_articles')
        .insert(articlesToInsert);

      if (error) {
        console.error('Error caching articles:', error);
      } else {
        console.log(`Cached ${articlesToInsert.length} articles for category: ${categoryToCache}`);
      }
    } catch (error) {
      console.error('Error in cacheArticles:', error);
    }
  };

  // Fetch cached data from database
  const fetchCachedData = async (): Promise<{ totalArticles: number; articles: GNewsArticle[] }> => {
    const { data: cachedData, error } = await supabase
      .from('cached_articles')
      .select('*')
      .eq('category', category === 'All' ? 'general' : category.toLowerCase())
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching cached data:', error);
      throw error;
    }

    // Transform cached data to GNewsArticle format
    const articles: GNewsArticle[] = cachedData.map((cached: CachedArticle) => ({
      title: cached.title,
      description: cached.description || '',
      content: cached.content || '',
      url: cached.url,
      image: cached.image_url || '',
      publishedAt: cached.published_at,
      source: {
        name: cached.source_name,
        url: cached.source_url || ''
      }
    }));

    return {
      totalArticles: articles.length,
      articles
    };
  };

  // Check cache age on mount and category change
  useEffect(() => {
    if (!searchQuery.trim()) { // Only check cache for non-search queries
      checkCacheAge();
    } else {
      setShouldFetchFromAPI(true); // Always fetch fresh data for searches
    }
  }, [category, searchQuery]);

  // Main query - fetch from API if needed, otherwise use cached data
  return useQuery({
    queryKey: ['cached-news', category, searchQuery, shouldFetchFromAPI],
    queryFn: async () => {
      if (shouldFetchFromAPI || searchQuery.trim()) {
        return await fetchFromAPI();
      } else {
        return await fetchCachedData();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
