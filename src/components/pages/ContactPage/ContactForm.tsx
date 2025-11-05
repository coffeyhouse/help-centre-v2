/**
 * ContactForm - Dropdown selectors for persona and product
 *
 * Features:
 * - Persona selector dropdown (I'm a...)
 * - Product selector dropdown (I need help with...)
 * - Integrates with PersonaContext
 * - Filters products by selected persona
 * - Helper text
 */

import { usePersona } from '../../../hooks/usePersona';
import Dropdown from '../../common/Dropdown';
import type { Product, Persona } from '../../../types';

interface ContactFormProps {
  personas: Persona[];
  products: Product[];
  selectedProduct: string;
  onProductChange: (productId: string) => void;
}

export default function ContactForm({
  personas,
  products,
  selectedProduct,
  onProductChange,
}: ContactFormProps) {
  const { persona, setPersona } = usePersona();

  // Filter products by selected persona
  const filteredProducts = products.filter((product) =>
    product.personas.includes(persona)
  );

  // Convert to dropdown options
  const personaOptions = personas.map((p) => ({
    value: p.id,
    label: p.label,
  }));

  const productOptions = filteredProducts.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <div className="bg-gray-50 rounded-lg p-8 mb-12">
      {/* Helper text */}
      <p className="text-gray-600 mb-6">
        To help us answer your query as quickly as possible, or to get in touch, select the topic you need help with:
      </p>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Persona selector */}
        <Dropdown
          label="I'm a"
          value={persona}
          options={personaOptions}
          onChange={(value) => setPersona(value as 'customer' | 'accountant')}
        />

        {/* Product selector */}
        <Dropdown
          label="I need help with"
          value={selectedProduct}
          options={productOptions}
          onChange={onProductChange}
        />
      </div>
    </div>
  );
}
