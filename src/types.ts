export interface Article {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  content?: string;
  creator?: string;
  isoDate?: string;
  feedName: string;
}

export interface FeedConfig {
  url: string;
  name: string;
  theme: string;
}

export interface FeedData {
  items: Article[];
}
