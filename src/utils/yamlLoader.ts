import yaml from 'js-yaml';
import type { FeedConfig } from '../types';

export const loadFeedConfig = async (): Promise<FeedConfig[]> => {
    try {
        const response = await fetch('/feeds.yaml');
        const text = await response.text();
        const parsed = yaml.load(text) as { feeds: FeedConfig[] };
        return parsed.feeds || [];
    } catch (error) {
        console.error('Error loading feeds.yaml:', error);
        return [];
    }
};
