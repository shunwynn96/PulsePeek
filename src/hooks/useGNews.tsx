
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

const GNEWS_API_KEY = 'e9c4d437426b91736f2718aeebaefe7b';
const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

export const useGNews = (category: string = 'general', searchQuery: string = '') => {
  const fetchNews = async (): Promise<GNewsResponse> => {
    let url = `${GNEWS_BASE_URL}/top-headlines?apikey=${GNEWS_API_KEY}&lang=en&max=10`;
    
    if (category !== 'All') {
      url += `&category=${category.toLowerCase()}`;
    }
    
    if (searchQuery.trim()) {
      url = `${GNEWS_BASE_URL}/search?apikey=${GNEWS_API_KEY}&q=${encodeURIComponent(searchQuery)}&lang=en&max=10`;
    }

    console.log('Fetching from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  };

  return useQuery({
    queryKey: ['gnews', category, searchQuery],
    queryFn: fetchNews,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
