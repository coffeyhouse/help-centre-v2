/**
 * CategoryProductGrid - Grid of products organized by category
 *
 * Features:
 * - Groups products by category
 * - Shows category headings
 * - Shows all products (including owned products)
 * - Uses Card component for each product
 * - Links to Product Landing pages
 * - Responsive grid
 */

import { useMemo } from 'react';
import { useRegion } from '../../../hooks/useRegion';
import Card from '../../common/Card';
import type { Product, ProductCategory } from '../../../types';

interface CategoryProductGridProps {
  products: Product[];
}

// Category display names
const categoryNames: Record<ProductCategory, string> = {
  'accounting-software': 'Accounting software',
  'people-payroll': 'People and Payroll',
  'business-management': 'Business management',
  'solutions-accountants-bookkeepers': 'Solutions for accountants and bookkeepers',
};

// Category order
const categoryOrder: ProductCategory[] = [
  'accounting-software',
  'people-payroll',
  'business-management',
  'solutions-accountants-bookkeepers',
];

export default function CategoryProductGrid({ products }: CategoryProductGridProps) {
  const { region } = useRegion();

  // Filter products by country and group by category
  const productsByCategory = useMemo(() => {
    // Filter products based on country only (show all products including owned)
    const availableProducts = products.filter((product) => {
      // Check if product is available for the current country
      const matchesCountry = !product.countries || product.countries.includes(region);

      return matchesCountry;
    });

    // Group products by category
    const grouped = new Map<ProductCategory, Product[]>();

    availableProducts.forEach((product) => {
      product.categories.forEach((category) => {
        if (!grouped.has(category)) {
          grouped.set(category, []);
        }
        // Only add if not already in this category (avoid duplicates)
        const categoryProducts = grouped.get(category)!;
        if (!categoryProducts.find(p => p.id === product.id)) {
          categoryProducts.push(product);
        }
      });
    });

    return grouped;
  }, [products, region]);

  // If no products available, show message
  if (productsByCategory.size === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No additional products available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {categoryOrder.map((category) => {
        const categoryProducts = productsByCategory.get(category);

        // Skip if no products in this category
        if (!categoryProducts || categoryProducts.length === 0) {
          return null;
        }

        return (
          <div key={category}>
            {/* Category Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {categoryNames[category]}
            </h2>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product) => (
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
      })}
    </div>
  );
}
