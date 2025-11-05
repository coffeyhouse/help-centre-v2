/**
 * ContactTopicsGrid - Quick access topics grid
 *
 * Features:
 * - 2x3 grid of topic cards
 * - Links to topic pages or contact methods
 * - Uses Card component
 * - "View more topics" button
 * - Responsive grid
 */

import { useRegion } from '../../../hooks/useRegion';
import Card from '../../common/Card';
import Button from '../../common/Button';
import type { ContactTopic } from '../../../types';

interface ContactTopicsGridProps {
  topics: ContactTopic[];
  productId?: string;
}

export default function ContactTopicsGrid({ topics, productId }: ContactTopicsGridProps) {
  const { region } = useRegion();

  // Show first 6 topics
  const visibleTopics = topics.slice(0, 6);

  return (
    <div className="mb-12">
      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {visibleTopics.map((topic) => (
          <Card
            key={topic.id}
            title={topic.title}
            icon={topic.icon}
            href={
              productId && topic.id !== 'other'
                ? `/${region}/products/${productId}/topics/${topic.id}`
                : `/${region}/contact`
            }
          />
        ))}
      </div>

      {/* View more button */}
      {topics.length > 6 && (
        <div className="text-center">
          <Button variant="secondary">
            View more topics
          </Button>
        </div>
      )}
    </div>
  );
}
