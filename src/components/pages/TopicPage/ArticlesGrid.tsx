/**
 * ArticlesGrid - Grid of article/subtopic cards for a topic
 *
 * Features:
 * - 2-column grid of cards
 * - Can display subtopics or articles
 * - Uses Card component
 * - Links to subtopics or article pages
 * - Responsive grid
 */

import Card from '../../common/Card';
import type { Article, SupportHub } from '../../../types';

interface ArticlesGridProps {
  articles: Article[];
  subtopics?: SupportHub[];
  topicId: string;
  region: string;
  productId: string | undefined;
}

export default function ArticlesGrid({
  articles,
  subtopics = [],
  topicId,
  region,
  productId,
}: ArticlesGridProps) {
  const hasSubtopics = subtopics.length > 0;
  const hasArticles = articles.length > 0;

  return (
    <div className="mb-12">
      {/* Subtopics Grid (when viewing a parent topic) */}
      {hasSubtopics && (
        <>
          <h2 className="text-xl font-semibold mb-4">Browse by category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subtopics.map((subtopic) => (
              <Card
                key={subtopic.id}
                title={subtopic.title}
                description={subtopic.description}
                href={`/${region}/products/${productId}/topics/${topicId}/${subtopic.id}`}
                icon={subtopic.icon}
              />
            ))}
          </div>
        </>
      )}

      {/* Articles Grid (when viewing a leaf topic/subtopic) */}
      {!hasSubtopics && hasArticles && (
        <>
          <h2 className="text-xl font-semibold mb-4">Articles</h2>
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
        </>
      )}

      {/* No content message */}
      {!hasSubtopics && !hasArticles && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No articles available for this topic.
          </p>
        </div>
      )}
    </div>
  );
}
