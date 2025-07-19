
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

let currentKeyIndex = 0;
let cachedKeys: string[] = [];
let lastKeysFetch = 0;
const KEYS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getApiKeys = async (): Promise<string[]> => {
  const now = Date.now();
  
  // Use cached keys if they're still fresh
  if (cachedKeys.length > 0 && (now - lastKeysFetch) < KEYS_CACHE_DURATION) {
    return cachedKeys;
  }
  
  const { data, error } = await supabase.functions.invoke('get-gnews-keys');
  if (error || !data?.keys?.length) {
    throw new Error('No API keys configured. Please set up your GNews API keys in Supabase secrets.');
  }
  
  cachedKeys = data.keys;
  lastKeysFetch = now;
  return cachedKeys;
};

const getNextApiKey = async (): Promise<string> => {
  const keys = await getApiKeys();
  const key = keys[currentKeyIndex % keys.length];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return key;
};

export const useGNews = (category: string = 'general', searchQuery: string = '', language: string = 'us') => {
  const fetchNews = async (): Promise<GNewsResponse> => {
    const availableKeys = await getApiKeys();

    let baseUrl = '';
    let attempts = 0;
    const maxAttempts = availableKeys.length;

    while (attempts < maxAttempts) {
      const apiKey = await getNextApiKey();
      
      if (category !== 'All' && !searchQuery.trim()) {
        baseUrl = `${GNEWS_BASE_URL}/top-headlines?apikey=${apiKey}&country=${language}&max=10&category=${category.toLowerCase()}`;
      } else if (searchQuery.trim()) {
        baseUrl = `${GNEWS_BASE_URL}/search?apikey=${apiKey}&q=${encodeURIComponent(searchQuery)}&country=${language}&max=10`;
      } else {
        baseUrl = `${GNEWS_BASE_URL}/top-headlines?apikey=${apiKey}&country=${language}&max=10`;
      }

      console.log('Fetching from:', baseUrl.replace(apiKey, '***'));
      
      const response = await fetch(baseUrl);
      
      if (response.status === 429) {
        console.log(`Rate limit hit for key ${attempts + 1}, trying next key...`);
        attempts++;
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    }

    throw new Error('All API keys have reached their rate limit. Please try again later.');
  };

  return useQuery({
    queryKey: ['gnews', category, searchQuery, language],
    queryFn: fetchNews,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry if it's an API key configuration error
      if (error.message.includes('No API keys configured')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};
