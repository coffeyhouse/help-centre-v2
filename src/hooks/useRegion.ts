/**
 * useRegion hook - Access region context
 *
 * Provides convenient access to the current region state and configuration
 * throughout the application.
 */

import { useContext } from 'react';
import { RegionContext } from '../context/RegionContext';
import type { RegionContextValue } from '../types';

/**
 * Custom hook to access region context
 *
 * @returns RegionContextValue containing region, config, and changeRegion function
 * @throws Error if used outside of RegionProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { region, regionConfig, changeRegion, loading, error } = useRegion();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       <h1>Current Region: {regionConfig?.displayName}</h1>
 *       <button onClick={() => changeRegion('ie')}>
 *         Switch to Ireland
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useRegion(): RegionContextValue {
  const context = useContext(RegionContext);

  if (context === undefined) {
    throw new Error(
      'useRegion must be used within a RegionProvider. ' +
      'Make sure your component is wrapped with <RegionProvider>.'
    );
  }

  return context;
}
