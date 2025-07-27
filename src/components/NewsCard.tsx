
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User, Bookmark, BookmarkCheck, MessageCircle, Eye, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useUserInteractions } from "@/hooks/useUserInteractions";
import { useGNews } from "@/hooks/useGNews";
import Comments from "./Comments";

interface RelatedArticleCardProps {
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  onClick: () => void;
}

const RelatedArticleCard = ({ title, excerpt, imageUrl, publishedAt, onClick }: RelatedArticleCardProps) => (
  <div 
    onClick={onClick}
    className="group cursor-pointer p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
  >
    <div className="flex space-x-3">
      <img
        src={imageUrl}
        alt={title}
        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
          {title}
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {excerpt}
        </p>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {publishedAt}
        </span>
      </div>
    </div>
  </div>
);

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  readTime: string;
  url?: string;
}

interface NewsCardProps {
  article: Article;
}

const NewsCard = ({ article }: NewsCardProps) => {
  const { user } = useAuth();
  const { addBookmark, removeBookmark, isBookmarked, addToReadingHistory } = useUserInteractions();
  const [isOpen, setIsOpen] = useState(false);
  const [readStartTime, setReadStartTime] = useState<number | null>(null);
  const [selectedRelatedArticle, setSelectedRelatedArticle] = useState<any>(null);
  
  // Get related articles from the same category, excluding current article
  const { data: relatedData } = useGNews(article.category === 'All' ? 'general' : article.category.toLowerCase());
  const relatedArticles = relatedData?.articles?.filter(a => a.title !== article.title).slice(0, 4) || [];

  const handleBookmarkToggle = () => {
    if (!user) return;
    
    if (isBookmarked(article.id)) {
      removeBookmark(article.id);
    } else {
      addBookmark({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        imageUrl: article.imageUrl,
        author: article.author,
        publishedAt: article.publishedAt,
        category: article.category,
        url: article.url,
      });
    }
  };

  const handleCardClick = () => {
    // Always open in dialog for better user experience
    setIsOpen(true);
    setReadStartTime(Date.now());
    
    if (user) {
      addToReadingHistory({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        imageUrl: article.imageUrl,
        author: article.author,
        publishedAt: article.publishedAt,
        category: article.category,
        url: article.url,
      });
    }
  };

  const handleReadArticle = () => {
    if (article.url) {
      // Open external article and track reading history
      if (user) {
        addToReadingHistory({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          imageUrl: article.imageUrl,
          author: article.author,
          publishedAt: article.publishedAt,
          category: article.category,
          url: article.url,
        });
      }
      window.open(article.url, '_blank');
    } else {
      // Fallback to dialog for mock articles
      handleCardClick();
    }
  };

  const handleCloseDialog = () => {
    if (readStartTime && user) {
      const readDuration = Math.round((Date.now() - readStartTime) / 1000);
      addToReadingHistory({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        imageUrl: article.imageUrl,
        author: article.author,
        publishedAt: article.publishedAt,
        category: article.category,
      }, readDuration);
    }
    setIsOpen(false);
    setReadStartTime(null);
  };

  const categoryColors = {
    Technology: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Environment: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Science: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Business: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    Sports: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Entertainment: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  };

  return (
    <>
      <Card 
        className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex flex-col h-full cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="p-0">
          <div className="relative overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop';
              }}
            />
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  categoryColors[article.category as keyof typeof categoryColors] ||
                  "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {article.category}
              </span>
            </div>
            {user && (
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmarkToggle();
                  }}
                  className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                >
                  {isBookmarked(article.id) ? (
                    <BookmarkCheck className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Bookmark className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
            <span>{formatDistanceToNow(new Date(article.publishedAt))} ago</span>
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 mt-auto">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleReadArticle();
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {article.url ? (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Read Full Article
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Read Article
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Article Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold leading-tight">
              {article.title}
            </DialogTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
              <span>{formatDistanceToNow(new Date(article.publishedAt))} ago</span>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                {article.excerpt}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                This is a full article view. In a real application, you would fetch and display the complete article content here. 
                The article would include detailed information, images, and comprehensive coverage of the topic.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              {article.url && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Want to read the complete article from the original source?
                  </p>
                  <Button
                    onClick={() => window.open(article.url, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Read Full Article
                  </Button>
                </div>
              )}
            </div>

            <Comments articleId={article.id} />
            
            {/* Related Articles Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedArticles.map((relatedArticle, index) => (
                  <RelatedArticleCard 
                    key={index}
                    title={relatedArticle.title}
                    excerpt={relatedArticle.description}
                    imageUrl={relatedArticle.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'}
                    publishedAt={formatDistanceToNow(new Date(relatedArticle.publishedAt)) + ' ago'}
                    onClick={() => {
                      const relatedArticleData = {
                        id: relatedArticle.title.length * Math.random(), // Generate simple ID
                        title: relatedArticle.title,
                        excerpt: relatedArticle.description,
                        category: article.category,
                        author: relatedArticle.source.name,
                        publishedAt: relatedArticle.publishedAt,
                        imageUrl: relatedArticle.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop',
                        readTime: '5 min read',
                        url: relatedArticle.url
                      };
                      setSelectedRelatedArticle(relatedArticleData);
                      setIsOpen(false); // Close current dialog
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            {user && (
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmarkToggle();
                }}
              >
                {isBookmarked(article.id) ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2 text-blue-600" />
                    Bookmarked
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmark
                  </>
                )}
              </Button>
            )}
            <Button onClick={handleCloseDialog}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Related Article Dialog */}
      {selectedRelatedArticle && (
        <Dialog open={!!selectedRelatedArticle} onOpenChange={() => setSelectedRelatedArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <NewsCard 
              article={selectedRelatedArticle} 
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default NewsCard;
