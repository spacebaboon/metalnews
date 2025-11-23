import React from 'react';
import type { Article } from '../types';
import { ExternalLink, Calendar, User, Rss } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ArticleCardProps {
    article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
    const formattedDate = article.pubDate
        ? formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })
        : 'Unknown date';

    return (
        <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
        >
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-blue-600 uppercase tracking-wider">
                    <Rss size={14} />
                    <span>{article.feedName}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                </h3>

                <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                    {article.contentSnippet || article.content?.substring(0, 200).replace(/<[^>]*>?/gm, '') + '...'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-5 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 font-medium">
                            <Calendar size={14} />
                            {formattedDate}
                        </span>
                        {article.creator && (
                            <span className="flex items-center gap-1.5 font-medium">
                                <User size={14} />
                                {article.creator}
                            </span>
                        )}
                    </div>
                    <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                </div>
            </div>
        </a>
    );
};
