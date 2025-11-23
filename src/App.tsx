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
  const [sidebarTab, setSidebarTab] = useState<'sites' | 'authors'>('sites');
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set());
  const [selectedAuthors, setSelectedAuthors] = useState<Set<string>>(new Set());

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

  const toggleSite = (site: string) => {
    setSelectedSites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(site)) {
        newSet.delete(site);
      } else {
        newSet.add(site);
      }
      return newSet;
    });
  };

  const toggleAuthor = (author: string) => {
    setSelectedAuthors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(author)) {
        newSet.delete(author);
      } else {
        newSet.add(author);
      }
      return newSet;
    });
  };

  const handleTabChange = (tab: 'sites' | 'authors') => {
    setSidebarTab(tab);
    setSelectedSites(new Set());
    setSelectedAuthors(new Set());
  };

  const themes = ['All', ...new Set(feeds.map((f) => f.theme).filter(Boolean))];

  // Filter articles by theme only (for sidebar stats)
  const themeFilteredArticles = articles.filter((article) => {
    if (selectedTheme === 'All') return true;
    const feed = feeds.find((f) => f.name === article.feedName);
    return feed?.theme === selectedTheme;
  });

  // Filter articles by theme + sites + authors (for display)
  const filteredArticles = themeFilteredArticles.filter((article) => {
    // Filter by selected sites
    if (selectedSites.size > 0 && !selectedSites.has(article.feedName)) {
      return false;
    }

    // Filter by selected authors
    if (selectedAuthors.size > 0 && (!article.creator || !selectedAuthors.has(article.creator))) {
      return false;
    }

    return true;
  });

  // Calculate author statistics (from theme-filtered articles only)
  const authorCounts = themeFilteredArticles.reduce((acc, article) => {
    if (article.creator) {
      acc[article.creator] = (acc[article.creator] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedAuthors = Object.entries(authorCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([author, count]) => ({ author, count }));

  // Calculate site statistics (from theme-filtered articles only)
  const siteCounts = themeFilteredArticles.reduce((acc, article) => {
    acc[article.feedName] = (acc[article.feedName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedSites = Object.entries(siteCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([site, count]) => ({ site, count }));

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900 font-sans selection:bg-blue-500 selection:text-white">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm">
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
        <div className="md:hidden max-w-7xl mx-auto px-4 pb-4 overflow-x-auto">
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
        {error && (
          <div className="bg-red-50 rounded-2xl p-6 mb-6 flex items-center gap-4 text-red-700">
            <AlertCircle size={24} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {loading && articles.length === 0 ? (
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 h-64 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-5"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-5"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
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
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Tabs */}
                <div className="flex gap-2 mb-4 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => handleTabChange('sites')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                      sidebarTab === 'sites'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Sites
                  </button>
                  <button
                    onClick={() => handleTabChange('authors')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                      sidebarTab === 'authors'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Authors
                  </button>
                </div>

                {/* Content */}
                {sidebarTab === 'sites' ? (
                  sortedSites.length > 0 ? (
                    <div className="space-y-2">
                      {sortedSites.map(({ site, count }) => {
                        const isSelected = selectedSites.has(site);
                        return (
                          <button
                            key={site}
                            onClick={() => toggleSite(site)}
                            className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all ${
                              isSelected
                                ? 'bg-blue-100 border-2 border-blue-500'
                                : 'hover:bg-gray-50 border-2 border-transparent'
                            }`}
                          >
                            <span className={`text-sm font-medium truncate ${
                              isSelected ? 'text-blue-700' : 'text-gray-700'
                            }`}>{site}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                              isSelected ? 'text-white bg-blue-600' : 'text-blue-600 bg-blue-50'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No sites found</p>
                  )
                ) : (
                  sortedAuthors.length > 0 ? (
                    <div className="space-y-2">
                      {sortedAuthors.map(({ author, count }) => {
                        const isSelected = selectedAuthors.has(author);
                        return (
                          <button
                            key={author}
                            onClick={() => toggleAuthor(author)}
                            className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all ${
                              isSelected
                                ? 'bg-blue-100 border-2 border-blue-500'
                                : 'hover:bg-gray-50 border-2 border-transparent'
                            }`}
                          >
                            <span className={`text-sm font-medium truncate ${
                              isSelected ? 'text-blue-700' : 'text-gray-700'
                            }`}>{author}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                              isSelected ? 'text-white bg-blue-600' : 'text-blue-600 bg-blue-50'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No authors found</p>
                  )
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
