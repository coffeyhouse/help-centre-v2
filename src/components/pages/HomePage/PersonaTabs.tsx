/**
 * PersonaTabs - Tab component for selecting user persona
 *
 * Features:
 * - Two tabs: Customer and Accountant/Bookkeeper
 * - Green underline for active tab
 * - Integrates with PersonaContext
 * - Accessible tab navigation
 * - Filters products based on selection
 */

import { usePersona } from '../../../hooks/usePersona';
import { useRegion } from '../../../hooks/useRegion';
import type { Persona } from '../../../types';

export default function PersonaTabs() {
  const { persona, setPersona } = usePersona();
  const { regionConfig } = useRegion();

  const personas = regionConfig?.personas || [];

  const handleTabClick = (personaId: string) => {
    setPersona(personaId as 'customer' | 'accountant');
  };

  return (
    <div className="border-b border-gray-200 mb-8">
      <div className="flex gap-8">
        {personas.map((p: Persona) => (
          <button
            key={p.id}
            onClick={() => handleTabClick(p.id)}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
              persona === p.id
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-current={persona === p.id ? 'page' : undefined}
          >
            {p.label}

            {/* Green underline for active tab */}
            {persona === p.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
