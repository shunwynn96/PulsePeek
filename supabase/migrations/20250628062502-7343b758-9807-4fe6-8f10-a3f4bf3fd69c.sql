
-- Create a table to store cached news articles
CREATE TABLE public.cached_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_cached_articles_category ON public.cached_articles(category);
CREATE INDEX idx_cached_articles_created_at ON public.cached_articles(created_at);

-- Enable RLS (though we'll make it public for now since news is public data)
ALTER TABLE public.cached_articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read cached articles
CREATE POLICY "Anyone can view cached articles" 
  ON public.cached_articles 
  FOR SELECT 
  USING (true);

-- Create policy to allow anyone to insert/update cached articles (for API updates)
CREATE POLICY "Anyone can manage cached articles" 
  ON public.cached_articles 
  FOR ALL 
  USING (true);
