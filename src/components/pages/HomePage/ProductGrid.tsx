/**
 * ProductGrid - Grid of product cards filtered by persona
 *
 * Features:
 * - 2x3 grid layout (6 products visible)
 * - Filters products by selected persona
 * - Filters out owned products when user is logged in
 * - Uses Card component for each product
 * - Links to Product Landing pages
 * - "See more products" button
 * - Responsive grid
 */

import { useMemo } from 'react';
import { usePersona } from '../../../hooks/usePersona';
import { useRegion } from '../../../hooks/useRegion';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../common/Card';
import Button from '../../common/Button';
import type { Product } from '../../../types';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { persona } = usePersona();
  const { region } = useRegion();
  const { user } = useAuth();

  // Filter products by selected persona, country, and exclude owned products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Check if product is available for the selected persona
      // If personas array doesn't exist, show the product (backwards compatibility)
      const matchesPersona = !product.personas || product.personas.includes(persona);

      // Check if product is available for the current country
      // If countries array doesn't exist, show the product (backwards compatibility)
      const matchesCountry = !product.countries || product.countries.includes(region);

      // Exclude products owned by the user (if logged in)
      const isNotOwned = !user || !user.ownedProducts.includes(product.id);

      return matchesPersona && matchesCountry && isNotOwned;
    });
  }, [products, persona, region, user]);

  // Show first 6 products
  const visibleProducts = filteredProducts.slice(0, 6);

  return (
    <div className="mb-12">
      {/* Section Title - Only show when logged in */}
      {user && filteredProducts.length > 0 && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse other products</h2>
      )}

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
