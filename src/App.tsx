import { useEffect, useState } from 'react';
import type { Article, FeedConfig } from './types';
import { loadFeedConfig } from './utils/yamlLoader';
import { fetchAllFeeds } from './utils/rss';
import { ArticleCard } from './components/ArticleCard';
import { LayoutGrid, RefreshCw, AlertCircle } from 'lucide-react';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [feeds, setFeeds] = useState<FeedConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('All');

  const init = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedFeeds = await loadFeedConfig();
      setFeeds(loadedFeeds);

      if (loadedFeeds.length === 0) {
        setError('No feeds found in feeds.yaml');
        setLoading(false);
        return;
      }

      const fetchedArticles = await fetchAllFeeds(loadedFeeds);
      setArticles(fetchedArticles);
    } catch (err) {
      console.error(err);
      setError('Failed to load feeds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const themes = ['All', ...new Set(feeds.map((f) => f.theme).filter(Boolean))];

  const filteredArticles = articles.filter((article) => {
    if (selectedTheme === 'All') return true;
    const feed = feeds.find((f) => f.name === article.feedName);
    return feed?.theme === selectedTheme;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900 font-sans selection:bg-blue-500 selection:text-white">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-md">
              <LayoutGrid size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Board Game Feed
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-gray-100 rounded-xl p-1.5 shadow-inner">
              {themes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedTheme === theme
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {theme}
                </button>
              ))}
            </div>

            <span className="text-sm text-gray-600 font-medium hidden sm:block">
              {feeds.length} Sources • {filteredArticles.length} Articles
            </span>
            <button
              onClick={init}
              disabled={loading}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh feeds"
            >
              <RefreshCw size={20} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        {/* Mobile Theme Selector */}
        <div className="md:hidden px-4 pb-4 overflow-x-auto">
          <div className="flex gap-2">
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${selectedTheme === theme
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-10 flex items-center gap-4 text-red-700 shadow-sm">
            <AlertCircle size={24} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {loading && articles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-8 h-80 animate-pulse shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-5"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-5"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <ArticleCard key={`${article.link}-${index}`} article={article} />
            ))}
          </div>
        )}

        {!loading && filteredArticles.length === 0 && !error && (
          <div className="text-center py-32">
            <p className="text-gray-500 text-lg font-medium">No articles found for this theme.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
