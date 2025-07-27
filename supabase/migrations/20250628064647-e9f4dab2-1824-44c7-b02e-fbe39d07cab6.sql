
-- Add columns to bookmarks table to store complete article details
ALTER TABLE public.bookmarks 
ADD COLUMN IF NOT EXISTS article_description TEXT,
ADD COLUMN IF NOT EXISTS article_image_url TEXT,
ADD COLUMN IF NOT EXISTS article_source TEXT,
ADD COLUMN IF NOT EXISTS article_published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS article_category TEXT;

-- Add columns to reading_history table to store complete article details  
ALTER TABLE public.reading_history
ADD COLUMN IF NOT EXISTS article_description TEXT,
ADD COLUMN IF NOT EXISTS article_image_url TEXT,
ADD COLUMN IF NOT EXISTS article_source TEXT,
ADD COLUMN IF NOT EXISTS article_published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS article_category TEXT;
