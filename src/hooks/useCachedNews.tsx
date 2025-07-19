
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

import { useGNews } from './useGNews';

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useCachedNews = (category: string = 'general', searchQuery: string = '', country: string = 'us') => {
  const [shouldFetchFromAPI, setShouldFetchFromAPI] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use the GNews hook which handles API key rotation
  const { data: apiData, isLoading: apiLoading, error: apiError } = useGNews(
    category === 'All' ? 'general' : category, 
    searchQuery, 
    country
  );

  // Check if we need fresh data from the API
  const checkCacheAge = async () => {
    try {
      const cacheKey = `${country}-${category === 'All' ? 'general' : category.toLowerCase()}`;
      const { data: cachedData, error } = await supabase
        .from('cached_articles')
        .select('created_at')
        .eq('category', cacheKey)
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

  // Cache articles in the database
  const cacheArticles = async (articles: GNewsArticle[], categoryToCache: string) => {
    try {
      const cacheKey = `${country}-${categoryToCache.toLowerCase()}`;
      // Clear old articles for this category-language combination
      await supabase
        .from('cached_articles')
        .delete()
        .eq('category', cacheKey);

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
        category: cacheKey
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
    const cacheKey = `${country}-${category === 'All' ? 'general' : category.toLowerCase()}`;
    const { data: cachedData, error } = await supabase
      .from('cached_articles')
      .select('*')
      .eq('category', cacheKey)
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

  // Check cache age on mount and category/language change
  useEffect(() => {
    setIsTransitioning(true);
    if (!searchQuery.trim()) { // Only check cache for non-search queries
      checkCacheAge();
    } else {
      setShouldFetchFromAPI(true); // Always fetch fresh data for searches
    }
  }, [category, searchQuery, country]);

  // Force fresh fetch when country changes
  useEffect(() => {
    
    setIsTransitioning(true);
    setShouldFetchFromAPI(true);
  }, [country]);

  // Cache new API data when it arrives
  useEffect(() => {
    if (apiData && (shouldFetchFromAPI || searchQuery.trim())) {
      cacheArticles(apiData.articles, category === 'All' ? 'general' : category);
    }
  }, [apiData, shouldFetchFromAPI, searchQuery, category]);

  // Reset transitioning state when API loading completes
  useEffect(() => {
    if (!apiLoading && apiData) {
      setIsTransitioning(false);
    }
  }, [apiLoading, apiData]);

  // Main query - use API data if fetching from API, otherwise use cached data
  const query = useQuery({
    queryKey: ['cached-news', category, searchQuery, country, shouldFetchFromAPI],
    queryFn: async () => {
      try {
        if ((shouldFetchFromAPI || searchQuery.trim()) && apiData) {
          return apiData;
        } else if (!shouldFetchFromAPI && !searchQuery.trim()) {
          const cachedResult = await fetchCachedData();
          return cachedResult;
        }
        return { totalArticles: 0, articles: [] };
      } finally {
        // Always reset transitioning state when query completes
        setIsTransitioning(false);
      }
    },
    enabled: (!shouldFetchFromAPI && !searchQuery.trim()) || (shouldFetchFromAPI && apiData !== undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    isLoading: query.isLoading || isTransitioning || (shouldFetchFromAPI && apiLoading)
  };
};
