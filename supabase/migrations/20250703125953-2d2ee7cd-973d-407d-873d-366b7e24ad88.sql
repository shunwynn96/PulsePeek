
-- Add policy to allow users to delete their own reading history
CREATE POLICY "Users can delete their own reading history" 
  ON public.reading_history 
  FOR DELETE 
  USING (auth.uid() = user_id);
