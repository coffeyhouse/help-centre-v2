import { useState } from 'react';
import { PersonaContext } from '../../context/PersonaContext';
import ProductGrid from '../pages/HomePage/ProductGrid';
import type { PersonaId } from '../../types';

interface PreviewPanelProps {
  fileId: string;
  data: any;
}

// Simple persona tabs for preview (doesn't rely on region config)
function PreviewPersonaTabs({ currentPersona, onPersonaChange }: {
  currentPersona: PersonaId;
  onPersonaChange: (persona: PersonaId) => void;
}) {
  const personas: Array<{ id: PersonaId; label: string }> = [
    { id: 'customer', label: 'Customer' },
    { id: 'accountant', label: 'Accountant / Bookkeeper' },
    { id: 'partner', label: 'Partner' },
    { id: 'developer', label: 'Developer' },
  ];

  return (
    <div className="border-b border-gray-200 mb-8">
      <div className="flex gap-8">
        {personas.map((p) => (
          <button
            key={p.id}
            onClick={() => onPersonaChange(p.id)}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
              currentPersona === p.id
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p.label}

            {/* Green underline for active tab */}
            {currentPersona === p.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Products preview wrapper component
function ProductsPreview({ products }: { products: any[] }) {
  const [currentPersona, setCurrentPersona] = useState<PersonaId>('customer');

  return (
    <PersonaContext.Provider value={{ persona: currentPersona, setPersona: setCurrentPersona }}>
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Products Preview</h3>
          <p className="text-sm text-gray-600 mb-6">
            This shows how products will appear on the homepage. Switch between personas to see different filtered views.
          </p>

          {/* Persona Tabs */}
          <PreviewPersonaTabs
            currentPersona={currentPersona}
            onPersonaChange={setCurrentPersona}
          />

          {/* Product Grid - exactly as it appears on homepage */}
          <ProductGrid products={products} />
        </div>
      </div>
    </PersonaContext.Provider>
  );
}

export default function PreviewPanel({ fileId, data }: PreviewPanelProps) {
  const renderPreview = () => {
    switch (fileId) {
      case 'uk-ireland-products':
        return data.products && <ProductsPreview products={data.products} />;

      case 'uk-ireland-incidents':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Banners ({data.banners?.length || 0})</h3>
            {data.banners?.map((banner: any) => (
              <div
                key={banner.id}
                className={`p-4 rounded-lg border ${
                  banner.state === 'error'
                    ? 'bg-red-50 border-red-200'
                    : banner.state === 'caution'
                    ? 'bg-yellow-50 border-yellow-200'
                    : banner.state === 'resolved'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="font-semibold text-sm">{banner.title}</div>
                <div className="text-sm mt-1">{banner.message}</div>
                <div className="text-xs text-gray-600 mt-2">
                  Status: {banner.active ? 'Active' : 'Inactive'} • Scope: {banner.scope?.type}
                </div>
              </div>
            ))}
          </div>
        );

      case 'uk-ireland-topics':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Support Hubs ({data.supportHubs?.length || 0})</h3>
            {data.supportHubs?.map((hub: any) => (
              <div key={hub.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="font-medium text-sm">{hub.title}</div>
                <div className="text-xs text-gray-600 mt-1">{hub.description}</div>
                <div className="text-xs text-gray-500 mt-1">Product: {hub.productId}</div>
              </div>
            ))}
          </div>
        );

      case 'uk-ireland-contact':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Contact Methods ({data.contactMethods?.length || 0})</h3>
            {data.contactMethods?.map((method: any) => (
              <div key={method.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="font-medium text-sm">{method.title}</div>
                <div className="text-xs text-gray-600 mt-1">{method.description}</div>
                <div className="text-xs text-gray-500 mt-1">Type: {method.type}</div>
              </div>
            ))}
          </div>
        );

      case 'regions':
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Countries/Regions ({data?.length || 0})</h3>
            {data?.map((region: any) => (
              <div key={region.code} className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="font-medium text-sm">{region.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Code: {region.code} • Region: {region.region} • Currency: {region.currency}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="p-8 text-center text-gray-500">
            <p>Preview not available for this file type.</p>
            <p className="text-sm mt-2">Use the JSON view to see the raw data structure.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
        {renderPreview()}
      </div>
    </div>
  );
}
