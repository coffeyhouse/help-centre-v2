/**
 * ProductGrid - Grid of product cards filtered by persona
 *
 * Features:
 * - 2x3 grid layout (6 products visible)
 * - Filters products by selected persona
 * - Uses Card component for each product
 * - Links to Product Landing pages
 * - "See more products" button
 * - Responsive grid
 */

import { useMemo } from 'react';
import { usePersona } from '../../../hooks/usePersona';
import { useRegion } from '../../../hooks/useRegion';
import Card from '../../common/Card';
import Button from '../../common/Button';
import type { Product } from '../../../types';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { persona } = usePersona();
  const { region } = useRegion();

  // Filter products by selected persona and country
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Check if product is available for the selected persona
      const matchesPersona = product.personas.includes(persona);

      // Check if product is available for the current country
      // If countries array doesn't exist, show the product (backwards compatibility)
      const matchesCountry = !product.countries || product.countries.includes(region);

      return matchesPersona && matchesCountry;
    });
  }, [products, persona, region]);

  // Show first 6 products
  const visibleProducts = filteredProducts.slice(0, 6);

  return (
    <div className="mb-12">
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {visibleProducts.map((product) => (
          <Card
            key={product.id}
            title={product.name}
            type={product.type}
            icon={product.icon}
            href={`/${region}/products/${product.id}`}
          />
        ))}
      </div>

      {/* See more button */}
      {filteredProducts.length > 6 && (
        <div className="text-center">
          <Button variant="secondary" href={`/${region}`}>
            See more products ({filteredProducts.length - 6} more)
          </Button>
        </div>
      )}

      {/* No products message */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No products available for this persona.
          </p>
        </div>
      )}
    </div>
  );
}
