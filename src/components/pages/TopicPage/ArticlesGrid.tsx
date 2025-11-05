/**
 * ArticlesGrid - Grid of article/subtopic cards for a topic
 *
 * Features:
 * - 2-column grid of cards
 * - Can display mixed articles and subtopics in order
 * - Uses Card component
 * - Links to subtopics or article pages
 * - Responsive grid
 * - Subtopics have visual badge to distinguish them
 */

import Card from '../../common/Card';
import type { ArticleItem, TopicsData } from '../../../types';

interface ArticlesGridProps {
  items: ArticleItem[];
  topicsData: TopicsData | null;
  topicId: string;
  region: string;
  productId: string | undefined;
}

export default function ArticlesGrid({
  items,
  topicsData,
  topicId,
  region,
  productId,
}: ArticlesGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No content available for this topic.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => {
          const isSubtopic = item.type === 'subtopic';

          if (isSubtopic) {
            // Look up subtopic details from topicsData
            const subtopic = topicsData?.supportHubs.find((hub) => hub.id === item.id);

            if (!subtopic) {
              console.warn(`Subtopic with id "${item.id}" not found in topics data`);
              return null;
            }

            // Use overrides from articles.json if provided, otherwise use topic data
            const title = item.title || subtopic.title;
            const description = item.description || subtopic.description;
            const icon = item.icon || subtopic.icon;

            return (
              <Card
                key={item.id}
                title={title}
                description={description}
                href={`/${region}/products/${productId}/topics/${topicId}/${subtopic.id}`}
                icon={icon}
                type="Topic"
              />
            );
          } else {
            // Regular article
            return (
              <Card
                key={item.id}
                title={item.title || ''}
                description={item.description}
                href={`#article-${item.id}`}
              />
            );
          }
        })}
      </div>
    </div>
  );
}
