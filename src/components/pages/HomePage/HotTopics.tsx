/**
 * HotTopics - Display hot/trending topics
 *
 * Features:
 * - Shows hot topics from products data
 * - Simple card layout with icons
 * - Links to topic pages (placeholder URLs for now)
 * - Heading and subheading
 * - Responsive grid
 */

import Card from '../../common/Card';
import type { HotTopic } from '../../../types';

interface HotTopicsProps {
  hotTopics: HotTopic[];
}

export default function HotTopics({ hotTopics }: HotTopicsProps) {
  if (!hotTopics || hotTopics.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Hot topics</h2>
        <p className="text-gray-600">
          Stay one step ahead with the latest news and trending topics
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hotTopics.map((topic) => (
          <Card
            key={topic.id}
            title={topic.title}
            icon={topic.icon}
            href={topic.url || '#'}
          />
        ))}
      </div>
    </div>
  );
}
