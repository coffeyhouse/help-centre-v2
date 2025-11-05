/**
 * ArticlesGrid - Grid of article cards for a topic
 *
 * Features:
 * - 2-column grid of article cards
 * - Uses Card component
 * - Links to article pages (placeholder for now)
 * - Responsive grid
 */

import Card from '../../common/Card';
import type { Article } from '../../../types';

interface ArticlesGridProps {
  articles: Article[];
  topicId: string;
}

export default function ArticlesGrid({ articles }: ArticlesGridProps) {
  return (
    <div className="mb-12">
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <Card
            key={article.id}
            title={article.title}
            description={article.description}
            href={`#article-${article.id}`}
          />
        ))}
      </div>

      {/* No articles message */}
      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No articles available for this topic.
          </p>
        </div>
      )}
    </div>
  );
}
