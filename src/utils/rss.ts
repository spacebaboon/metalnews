import Parser from 'rss-parser';
import type { Article, FeedConfig } from '../types';

const parser = new Parser();

const CORS_PROXY = 'https://corsproxy.io/?';

export const fetchFeed = async (feedConfig: FeedConfig): Promise<Article[]> => {
    try {
        const encodedUrl = encodeURIComponent(feedConfig.url);
        const response = await fetch(`${CORS_PROXY}${encodedUrl}`);
        const text = await response.text();

        const feed = await parser.parseString(text);

        return feed.items.map((item) => ({
            title: item.title || 'No Title',
            link: item.link || '#',
            pubDate: item.pubDate || new Date().toISOString(),
            contentSnippet: item.contentSnippet,
            content: item.content,
            creator: item.creator,
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
