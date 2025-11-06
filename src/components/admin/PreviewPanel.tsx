interface PreviewPanelProps {
  fileId: string;
  data: any;
}

export default function PreviewPanel({ fileId, data }: PreviewPanelProps) {
  const renderPreview = () => {
    switch (fileId) {
      case 'uk-ireland-products':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Products ({data.products?.length || 0})</h3>
              <div className="grid gap-3">
                {data.products?.map((product: any) => (
                  <div key={product.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {product.type} • {product.personas?.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Hot Topics ({data.hotTopics?.length || 0})</h3>
              <div className="space-y-2">
                {data.hotTopics?.map((topic: any) => (
                  <div key={topic.id} className="p-2 bg-blue-50 rounded text-sm">
                    {topic.title}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Access Cards ({data.quickAccessCards?.length || 0})</h3>
              <div className="space-y-2">
                {data.quickAccessCards?.map((card: any) => (
                  <div key={card.id} className="p-3 bg-green-50 rounded border border-green-200">
                    <div className="font-medium text-sm">{card.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{card.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

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
