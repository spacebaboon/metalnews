import Parser from 'rss-parser';
import type { Article, FeedConfig } from '../types';

/**
 * Custom fetcher function for rss-parser to use the Workers global fetch API.
 * * @param url - The URL to fetch (RequestInfo is the standard web type for a URL or Request object).
 * @param options - The request options (RequestInit is the standard web type).
 * @returns A promise that resolves to the Response object.
 */
const customFetcher = async (
  url: RequestInfo,
  options?: RequestInit
): Promise<Response> => {
  // Pass the request to the native Workers fetch API
  return fetch(url, options);
};

const parser = new Parser({
  fetch: customFetcher
} as any);

const CORS_PROXY = 'https://corsproxy.io/?';

// Decode HTML entities
const decodeHTMLEntities = (text: string | undefined): string | undefined => {
    if (!text) return text;
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
};

export const fetchFeed = async (feedConfig: FeedConfig): Promise<Article[]> => {
    try {
        const encodedUrl = encodeURIComponent(feedConfig.url);
        const response = await fetch(`${CORS_PROXY}${encodedUrl}`);
        const text = await response.text();

        const feed = await parser.parseString(text);

        return feed.items.map((item) => ({
            title: decodeHTMLEntities(item.title) || 'No Title',
            link: item.link || '#',
            pubDate: item.pubDate || new Date().toISOString(),
            contentSnippet: item.contentSnippet,
            content: item.content,
            creator: decodeHTMLEntities(item.creator),
            isoDate: item.isoDate,
            feedName: feedConfig.name,
        }));
    } catch (error) {
        console.error(`Error fetching feed ${feedConfig.name}:`, error);
        return [];
    }
};

export const fetchAllFeeds = async (configs: FeedConfig[]): Promise<Article[]> => {
    const promises = configs.map(fetchFeed);
    const results = await Promise.all(promises);
    return results.flat().sort((a, b) => {
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });
};
