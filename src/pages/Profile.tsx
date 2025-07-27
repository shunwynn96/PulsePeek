
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserInteractions } from "@/hooks/useUserInteractions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Bookmark, History, User, Trash2, ExternalLink, Eye, Clock, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import Comments from "@/components/Comments";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { bookmarks, readingHistory, removeBookmark, removeReadingHistoryItem, clearAllReadingHistory, loading, addToReadingHistory } = useUserInteractions();
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [readStartTime, setReadStartTime] = useState<number | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleArticleClick = (item: any, isBookmark = false) => {
    if (item.article_url && item.article_url.startsWith('http')) {
      // External article - open in new tab and track reading
      if (user && isBookmark) {
        addToReadingHistory({
          id: item.article_id,
          title: item.article_title,
          excerpt: item.article_description,
          imageUrl: item.article_image_url,
          author: item.article_source,
          publishedAt: item.article_published_at,
          category: item.article_category,
          url: item.article_url,
        });
      }
      window.open(item.article_url, '_blank');
    } else {
      // Mock or saved article - open in dialog with complete details
      const articleDetails = {
        id: item.article_id,
        title: item.article_title,
        excerpt: item.article_description || "This article contains detailed information about the topic. Click the link below to read the full article.",
        imageUrl: item.article_image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop',
        author: item.article_source || "PulsePeek",
        publishedAt: item.article_published_at || (isBookmark ? item.created_at : item.read_at),
        category: item.article_category || "General",
        readTime: "5 min read",
        url: item.article_url
      };
      
      setSelectedArticle(articleDetails);
      setIsDialogOpen(true);
      setReadStartTime(Date.now());
      
      if (user && isBookmark) {
        addToReadingHistory({
          id: item.article_id,
          title: item.article_title,
          excerpt: item.article_description,
          imageUrl: item.article_image_url,
          author: item.article_source,
          publishedAt: item.article_published_at,
          category: item.article_category,
          url: item.article_url,
        });
      }
    }
  };

  const handleCloseDialog = () => {
    if (readStartTime && user && selectedArticle) {
      const readDuration = Math.round((Date.now() - readStartTime) / 1000);
      addToReadingHistory({
        id: selectedArticle.id,
        title: selectedArticle.title,
        excerpt: selectedArticle.excerpt,
        imageUrl: selectedArticle.imageUrl,
        author: selectedArticle.author,
        publishedAt: selectedArticle.publishedAt,
        category: selectedArticle.category,
        url: selectedArticle.url,
      }, readDuration);
    }
    setIsDialogOpen(false);
    setSelectedArticle(null);
    setReadStartTime(null);
  };

  const getCategoryBadgeColor = (category: string) => {
    const categoryColors = {
      Technology: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Environment: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Science: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Business: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Sports: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Entertainment: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    };
    return categoryColors[category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to view your profile.</p>
          <Button onClick={() => navigate("/login")}>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to News
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="bookmarks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bookmarks" className="flex items-center space-x-2">
                <Bookmark className="h-4 w-4" />
                <span>Bookmarks ({bookmarks.length})</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2">
                <History className="h-4 w-4" />
                <span>Reading History ({readingHistory.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookmarks">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bookmark className="h-5 w-5" />
                    <span>Saved Articles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Loading bookmarks...</p>
                    </div>
                  ) : bookmarks.length === 0 ? (
                    <div className="text-center py-8">
                      <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No bookmarks yet.</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Start saving articles you want to read later!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookmarks.map((bookmark) => (
                        <div key={bookmark.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                          {bookmark.article_image_url && (
                            <img
                              src={bookmark.article_image_url}
                              alt={bookmark.article_title}
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop';
                              }}
                            />
                          )}
                          <div 
                            className="flex-1 cursor-pointer min-h-0"
                            onClick={() => handleArticleClick(bookmark, true)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 pr-2">
                                {bookmark.article_title}
                              </h3>
                              {bookmark.article_url && bookmark.article_url.startsWith('http') ? (
                                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                              )}
                            </div>
                            {bookmark.article_description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                                {bookmark.article_description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {bookmark.article_category && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(bookmark.article_category)}`}>
                                    {bookmark.article_category}
                                  </span>
                                )}
                                {bookmark.article_source && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    by {bookmark.article_source}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Saved {formatDistanceToNow(new Date(bookmark.created_at))} ago
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBookmark(bookmark.article_id);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <History className="h-5 w-5" />
                      <span>Reading History</span>
                    </CardTitle>
                    {readingHistory.length > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Clear Reading History</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete all your reading history? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={clearAllReadingHistory} className="bg-red-600 hover:bg-red-700">
                              Clear All
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
                    </div>
                  ) : readingHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No reading history yet.</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Articles you read will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {readingHistory.map((item) => (
                        <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                          {item.article_image_url && (
                            <img
                              src={item.article_image_url}
                              alt={item.article_title}
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop';
                              }}
                            />
                          )}
                          <div 
                            className="flex-1 cursor-pointer min-h-0"
                            onClick={() => handleArticleClick(item, false)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 pr-2">
                                {item.article_title}
                              </h3>
                              {item.article_url && item.article_url.startsWith('http') ? (
                                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                              )}
                            </div>
                            {item.article_description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                                {item.article_description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-2">
                                {item.article_category && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(item.article_category)}`}>
                                    {item.article_category}
                                  </span>
                                )}
                                {item.article_source && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    by {item.article_source}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-xs">
                                <span>Read {formatDistanceToNow(new Date(item.read_at))} ago</span>
                                {item.read_duration && (
                                  <span>• {Math.floor(item.read_duration / 60)}m {item.read_duration % 60}s</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeReadingHistoryItem(item.id);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Article Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold leading-tight">
                  {selectedArticle.title}
                </DialogTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{selectedArticle.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{selectedArticle.readTime}</span>
                  </div>
                  <span>{formatDistanceToNow(new Date(selectedArticle.publishedAt))} ago</span>
                  {selectedArticle.category && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(selectedArticle.category)}`}>
                      {selectedArticle.category}
                    </span>
                  )}
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    {selectedArticle.excerpt}
                  </p>
                  {selectedArticle.url && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Want to read the complete article?
                      </p>
                      <Button
                        onClick={() => window.open(selectedArticle.url, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Read Full Article
                      </Button>
                    </div>
                  )}
                </div>

                <Comments articleId={selectedArticle.id} />
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button onClick={handleCloseDialog}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;
