/**
 * usePersona hook - Access persona context
 *
 * Provides convenient access to the current persona state
 * throughout the application.
 */

import { useContext } from 'react';
import { PersonaContext } from '../context/PersonaContext';
import type { PersonaContextValue } from '../types';

/**
 * Custom hook to access persona context
 *
 * @returns PersonaContextValue containing persona and setPersona function
 * @throws Error if used outside of PersonaProvider
 *
 * @example
 * ```tsx
 * function PersonaSelector() {
 *   const { persona, setPersona } = usePersona();
 *
 *   return (
 *     <div>
 *       <h2>Current Persona: {persona}</h2>
 *       <button onClick={() => setPersona('customer')}>
 *         Customer
 *       </button>
 *       <button onClick={() => setPersona('accountant')}>
 *         Accountant
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePersona(): PersonaContextValue {
  const context = useContext(PersonaContext);

  if (context === undefined) {
    throw new Error(
      'usePersona must be used within a PersonaProvider. ' +
      'Make sure your component is wrapped with <PersonaProvider>.'
    );
  }

  return context;
}
