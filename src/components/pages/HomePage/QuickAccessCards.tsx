/**
 * QuickAccessCards - Three promotional/quick access cards
 *
 * Features:
 * - 3 cards in a row
 * - Account management, Community Hub, Training
 * - Uses Card component
 * - Links to external/internal pages
 * - Responsive: stacks on mobile, row on desktop
 */

import Card from '../../common/Card';
import type { QuickAccessCard } from '../../../types';

interface QuickAccessCardsProps {
  cards: QuickAccessCard[];
}

export default function QuickAccessCards({ cards }: QuickAccessCardsProps) {
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      {/* Section Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Resources</h2>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card
            key={card.id}
            title={card.title}
            description={card.description}
            icon={card.icon}
            href={card.url || '#'}
          />
        ))}
      </div>
    </div>
  );
}
