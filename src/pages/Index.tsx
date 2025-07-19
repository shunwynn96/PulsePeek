import { useState, useEffect, useRef } from "react";
import { Moon, Sun, Search, Menu, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import NewsCard from "@/components/NewsCard";
import CategoryTabs from "@/components/CategoryTabs";
import { useAuth } from "@/hooks/useAuth";
import { useCachedNews } from "@/hooks/useCachedNews";
import { transformGNewsArticle } from "@/utils/newsTransform";
import { toast } from "@/hooks/use-toast";
import { useCountry } from "@/contexts/CountryContext";
import { CountryDropdown } from "@/components/CountryDropdown";

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut, loading: authLoading } = useAuth();
  const { currentCountry } = useCountry();
  const navigate = useNavigate();

  const { data: newsData, isLoading: newsLoading, error } = useCachedNews(
    selectedCategory === "All" ? "general" : selectedCategory, 
    searchQuery,
    currentCountry.code
  );

  // Show welcome toast only once per login session
  useEffect(() => {
    if (user && !authLoading) {
      const welcomeShownKey = `welcome-shown-${user.id}`;
      const hasShownWelcome = sessionStorage.getItem(welcomeShownKey);
      
      if (!hasShownWelcome) {
        const toastInstance = toast({
          title: "Welcome back! 👋",
          description: "Stay informed with the latest news curated just for you.",
        });
        
        // Dismiss the toast after 3 seconds
        setTimeout(() => {
          toastInstance.dismiss();
        }, 3000);
        
        // Mark as shown for this session
        sessionStorage.setItem(welcomeShownKey, 'true');
      }
    }
    
    // Clean up sessionStorage when user logs out
    if (!user && !authLoading) {
      // Remove all welcome-shown entries
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('welcome-shown-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }, [user?.id, authLoading]);

  // Initialize dark mode on component mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Transform articles to our format
  const articles = newsData?.articles?.map((article, index) => 
    transformGNewsArticle(article, index, selectedCategory)
  ) || [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "dark" : ""
      }`}
    >
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PulsePeek
                </h1>
              </div>

              <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <CountryDropdown />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-600" />
                  )}
                </Button>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/profile")}
                      className="flex items-center space-x-2 border-gray-200 dark:border-gray-700"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="border-gray-200 dark:border-gray-700"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="flex items-center space-x-2 border-gray-200 dark:border-gray-700"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Search */}
        <div className="md:hidden px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-900"
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">

          {/* Category Tabs */}
          <CategoryTabs
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* News Grid */}
          <section className="mt-8">
            {error && (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-2">
                  Error loading news
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {error.message}
                </p>
              </div>
            )}
            
            {newsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Image skeleton */}
                    <Skeleton className="h-48 w-full rounded-none" />
                    
                    <div className="p-6 space-y-4">
                      {/* Category badge skeleton */}
                      <Skeleton className="h-5 w-20 rounded-full" />
                      
                      {/* Title skeleton - 2 lines */}
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-4/5" />
                      </div>
                      
                      {/* Description skeleton - 3 lines */}
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      
                      {/* Author and date skeleton */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-1 w-1 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                      
                      {/* Button skeleton */}
                      <Skeleton className="h-10 w-32 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-600 text-lg">
                  No articles found matching your criteria.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>&copy; 2024 PulsePeek. Stay informed, stay connected.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
