import fs from 'fs';
import path from 'path';
import type { FeedConfig } from '../../types';

export const loadFeedConfig = async (): Promise<FeedConfig[]> => {
    try {
        const filePath = path.join(process.cwd(), 'feeds.json');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(fileContents) as {
            feeds: Record<string, Record<string, { url: string }>>
        };

        // Transform nested structure to flat array
        const feedsArray: FeedConfig[] = [];
        for (const [theme, feeds] of Object.entries(parsed.feeds)) {
            for (const [name, config] of Object.entries(feeds)) {
                feedsArray.push({
                    url: config.url,
                    name,
                    theme
                });
            }
        }

        return feedsArray;
    } catch (error) {
        console.error('Error loading feeds.json:', error);
        return [];
    }
};
