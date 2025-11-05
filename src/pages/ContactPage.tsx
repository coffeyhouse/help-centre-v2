/**
 * ContactPage - Contact and support options page
 *
 * Features:
 * - Hero section
 * - Contact form with dropdowns (Region, Persona, Product)
 * - Quick access topics grid
 * - Contact methods (Community, Chat, Phone)
 */

import { useRegion } from '../hooks/useRegion';
import { usePersona } from '../hooks/usePersona';

export default function ContactPage() {
  const { region, regionConfig, loading, error } = useRegion();
  const { persona } = usePersona();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get in touch
          </h1>
          <p className="text-lg text-gray-300">
            If you want to get in touch with us, select an option below.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">ContactPage - Placeholder</h2>
          <p className="text-gray-600 mb-4">
            This is a placeholder for the ContactPage component.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Current Region:</strong> {region}</p>
            <p><strong>Region Display Name:</strong> {regionConfig?.displayName}</p>
            <p><strong>Current Persona:</strong> {persona}</p>
            <p><strong>URL Path:</strong> /{region}/contact</p>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-900">
              <strong>Phase 4:</strong> Routing is now working! This page will be implemented in Phase 10 with:
            </p>
            <ul className="list-disc list-inside text-sm text-blue-800 mt-2">
              <li>Contact form with dropdowns (Region, Persona, Product)</li>
              <li>Quick access topics grid</li>
              <li>Contact methods (Community Hub, Phone)</li>
              <li>Region-specific contact information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
