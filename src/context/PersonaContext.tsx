/**
 * PersonaContext - Manages user persona selection
 *
 * Provides:
 * - Current persona (customer, accountant, partner, developer)
 * - Function to change persona
 * - Automatic persistence to localStorage
 * - Affects product filtering and content display
 */

import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { PersonaContextValue, PersonaId } from '../types';

// Create the context with undefined default (will be provided by PersonaProvider)
export const PersonaContext = createContext<PersonaContextValue | undefined>(undefined);

interface PersonaProviderProps {
  children: ReactNode;
  initialPersona?: PersonaId;
}

/**
 * PersonaProvider component
 *
 * Wraps the application and provides persona state to all child components
 * via Context API. Persists persona selection to localStorage.
 *
 * @example
 * ```tsx
 * <PersonaProvider initialPersona="customer">
 *   <App />
 * </PersonaProvider>
 * ```
 */
export function PersonaProvider({ children, initialPersona = 'customer' }: PersonaProviderProps) {
  // Get initial persona from localStorage or use default
  const [persona, setPersonaState] = useState<PersonaId>(() => {
    if (typeof window !== 'undefined') {
      const savedPersona = localStorage.getItem('selectedPersona');
      // Validate that the saved persona is a valid PersonaId
      if (savedPersona && isValidPersona(savedPersona)) {
        return savedPersona as PersonaId;
      }
    }
    return initialPersona;
  });

  // Save persona to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedPersona', persona);
    }
  }, [persona]);

  /**
   * Change the current persona
   * This will trigger product filtering and content updates
   *
   * @param newPersona - The new persona to switch to
   */
  const setPersona = (newPersona: PersonaId) => {
    if (isValidPersona(newPersona) && newPersona !== persona) {
      setPersonaState(newPersona);
    }
  };

  const value: PersonaContextValue = {
    persona,
    setPersona,
  };

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
}

/**
 * Type guard to validate PersonaId
 * @param value - Value to check
 * @returns true if value is a valid PersonaId
 */
function isValidPersona(value: string): value is PersonaId {
  return ['customer', 'accountant', 'partner', 'developer'].includes(value);
}
