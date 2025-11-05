/**
 * SupportHubsGrid - Grid of support hub/topic cards
 *
 * Features:
 * - 2x3 grid of support hub cards
 * - Filters hubs by current product
 * - Uses Card component
 * - Links to Topic pages
 * - "View all support hubs" button
 * - Responsive grid
 */

import { useMemo } from 'react';
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

  // Filter support hubs by current product
  const filteredHubs = useMemo(() => {
    return supportHubs.filter((hub) =>
      hub.productId === productId
    );
  }, [supportHubs, productId]);

  // Show first 6 hubs
  const visibleHubs = filteredHubs.slice(0, 6);

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
          <Button variant="secondary">
            View all support hubs ({filteredHubs.length - 6} more)
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
