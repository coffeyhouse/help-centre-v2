/**
 * SupportHubsGrid - Grid of support hub/topic cards
 *
 * Features:
 * - 2x3 grid of support hub cards
 * - Filters hubs by current product
 * - Uses Card component
 * - Links to Topic pages
 * - Toggle to view all topics
 * - Responsive grid
 */

import { useMemo, useState } from 'react';
import { useRegion } from '../../../hooks/useRegion';
import Card from '../../common/Card';
import Button from '../../common/Button';
import type { SupportHub } from '../../../types';

interface SupportHubsGridProps {
  supportHubs: SupportHub[];
  productId: string;
}

export default function SupportHubsGrid({ supportHubs, productId }: SupportHubsGridProps) {
  const { region } = useRegion();
  const [showAllTopics, setShowAllTopics] = useState(false);

  // Filter support hubs by current product
  // Exclude subtopics unless they have showOnProductLanding: true
  const filteredHubs = useMemo(() => {
    return supportHubs.filter((hub) => {
      if (hub.productId !== productId) return false;

      // If it's a subtopic (has parentTopicId), only show if showOnProductLanding is true
      if (hub.parentTopicId) {
        return hub.showOnProductLanding === true;
      }

      // Top-level topics are always shown
      return true;
    });
  }, [supportHubs, productId]);

  // Show first 6 hubs or all based on state
  const visibleHubs = showAllTopics ? filteredHubs : filteredHubs.slice(0, 6);

  return (
    <div className="mb-12">
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">
          What do you need help with today?
        </h2>
      </div>

      {/* Support Hubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {visibleHubs.map((hub) => (
          <Card
            key={hub.id}
            title={hub.title}
            description={hub.description}
            icon={hub.icon}
            href={`/${region}/products/${productId}/topics/${hub.id}`}
          />
        ))}
      </div>

      {/* View all button */}
      {filteredHubs.length > 6 && (
        <div className="text-center">
          <Button
            variant="secondary"
            onClick={() => setShowAllTopics(!showAllTopics)}
          >
            {showAllTopics
              ? 'Show fewer topics'
              : `View all topics (${filteredHubs.length - 6} more)`
            }
          </Button>
        </div>
      )}

      {/* No hubs message */}
      {filteredHubs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No support hubs available for this product.
          </p>
        </div>
      )}
    </div>
  );
}
