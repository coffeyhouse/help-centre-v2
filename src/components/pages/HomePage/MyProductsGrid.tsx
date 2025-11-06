/**
 * MyProductsGrid - Grid of products owned by the logged-in user
 *
 * Features:
 * - Shows products that the user owns
 * - Uses Card component for each product
 * - Links to Product Landing pages
 * - Toggle button to show/hide owned products in category sections
 * - Responsive grid
 */

import { useMemo } from 'react';
import { useRegion } from '../../../hooks/useRegion';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../common/Card';
import Button from '../../common/Button';
import type { Product } from '../../../types';

interface MyProductsGridProps {
  products: Product[];
  showAllProducts: boolean;
  onToggleShowAll: () => void;
}

export default function MyProductsGrid({ products, showAllProducts, onToggleShowAll }: MyProductsGridProps) {
  const { region } = useRegion();
  const { user } = useAuth();

  // Filter products to show only owned products
  const ownedProducts = useMemo(() => {
    if (!user) return [];

    return products.filter((product) =>
      user.ownedProducts.includes(product.id)
    );
  }, [products, user]);

  if (!user || ownedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      {/* Section Header with Title and Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your products</h2>
        <Button
          variant="secondary"
          onClick={onToggleShowAll}
        >
          {showAllProducts ? 'Hide my products from categories' : 'Show all products'}
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ownedProducts.map((product) => (
          <Card
            key={product.id}
            title={product.name}
            description={product.description}
            type={product.type}
            icon={product.icon}
            href={`/${region}/products/${product.id}`}
          />
        ))}
      </div>
    </div>
  );
}
