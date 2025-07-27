import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Bookmark {
  id: string;
  article_id: number;
  article_title: string;
  article_url?: string;
  article_description?: string;
  article_image_url?: string;
  article_source?: string;
  article_published_at?: string;
  article_category?: string;
  created_at: string;
}

export interface ReadingHistoryItem {
  id: string;
  article_id: number;
  article_title: string;
  article_url?: string;
  article_description?: string;
  article_image_url?: string;
  article_source?: string;
  article_published_at?: string;
  article_category?: string;
  read_at: string;
  read_duration?: number;
}

export interface Comment {
  id: string;
  article_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ArticleData {
  id: number;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  author?: string;
  publishedAt?: string;
  category?: string;
  url?: string;
}

export const useUserInteractions = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user bookmarks
  const fetchBookmarks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookmarks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch reading history
  const fetchReadingHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.id)
        .order('read_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReadingHistory(data || []);
    } catch (error) {
      console.error('Error fetching reading history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reading history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add bookmark with complete article data
  const addBookmark = async (article: ArticleData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          article_id: article.id,
          article_title: article.title,
          article_url: article.url,
          article_description: article.excerpt,
          article_image_url: article.imageUrl,
          article_source: article.author,
          article_published_at: article.publishedAt,
          article_category: article.category,
        });

      if (error) throw error;
      
      toast({
        title: "Bookmarked!",
        description: "Article saved to your bookmarks",
      });
      
      fetchBookmarks();
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to bookmark article",
        variant: "destructive",
      });
    }
  };

  // Remove bookmark
  const removeBookmark = async (articleId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (error) throw error;
      
      toast({
        title: "Removed",
        description: "Article removed from bookmarks",
      });
      
      fetchBookmarks();
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive",
      });
    }
  };

  // Add to reading history with complete article data
  const addToReadingHistory = async (article: ArticleData, duration?: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reading_history')
        .upsert({
          user_id: user.id,
          article_id: article.id,
          article_title: article.title,
          article_url: article.url,
          article_description: article.excerpt,
          article_image_url: article.imageUrl,
          article_source: article.author,
          article_published_at: article.publishedAt,
          article_category: article.category,
          read_duration: duration,
        });

      if (error) throw error;
      // Don't refetch here to avoid overriding local state changes
    } catch (error) {
      console.error('Error adding to reading history:', error);
    }
  };

  // Remove individual reading history item
  const removeReadingHistoryItem = async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reading_history')
        .delete()
        .eq('user_id', user.id)
        .eq('id', itemId);

      if (error) throw error;
      
      // Update local state immediately
      setReadingHistory(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: "Removed",
        description: "Item removed from reading history",
      });
    } catch (error) {
      console.error('Error removing reading history item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from reading history",
        variant: "destructive",
      });
    }
  };

  // Clear all reading history
  const clearAllReadingHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reading_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update local state immediately
      setReadingHistory([]);
      
      toast({
        title: "Cleared",
        description: "All reading history has been cleared",
      });
    } catch (error) {
      console.error('Error clearing reading history:', error);
      toast({
        title: "Error",
        description: "Failed to clear reading history",
        variant: "destructive",
      });
    }
  };

  // Check if article is bookmarked
  const isBookmarked = (articleId: number) => {
    return bookmarks.some(bookmark => bookmark.article_id === articleId);
  };

  // Modified useEffect to only fetch when user changes, not on every mount
  useEffect(() => {
    if (user) {
      fetchBookmarks();
      fetchReadingHistory();
    } else {
      // Clear local state when user logs out
      setBookmarks([]);
      setReadingHistory([]);
    }
  }, [user?.id]); // Only depend on user ID, not the entire user object

  return {
    bookmarks,
    readingHistory,
    loading,
    addBookmark,
    removeBookmark,
    addToReadingHistory,
    removeReadingHistoryItem,
    clearAllReadingHistory,
    isBookmarked,
    fetchBookmarks,
    fetchReadingHistory,
  };
};
