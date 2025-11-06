import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  description: string;
  type: string;
  personas: string[];
  icon: string;
}

interface HotTopic {
  id: string;
  title: string;
  icon: string;
}

interface QuickAccessCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface ProductsEditorProps {
  data: {
    products: Product[];
    hotTopics: HotTopic[];
    quickAccessCards: QuickAccessCard[];
  };
  onChange: (data: any) => void;
}

export default function ProductsEditor({ data, onChange }: ProductsEditorProps) {
  const updateProduct = (index: number, field: string, value: any) => {
    const updated = { ...data };
    updated.products[index] = { ...updated.products[index], [field]: value };
    onChange(updated);
  };

  const addProduct = () => {
    const updated = { ...data };
    updated.products.push({
      id: `product-${Date.now()}`,
      name: 'New Product',
      description: '',
      type: 'cloud',
      personas: ['customer'],
      icon: 'icon-default',
    });
    onChange(updated);
  };

  const removeProduct = (index: number) => {
    const updated = { ...data };
    updated.products.splice(index, 1);
    onChange(updated);
  };

  const updateHotTopic = (index: number, field: string, value: any) => {
    const updated = { ...data };
    updated.hotTopics[index] = { ...updated.hotTopics[index], [field]: value };
    onChange(updated);
  };

  const addHotTopic = () => {
    const updated = { ...data };
    updated.hotTopics.push({
      id: `topic-${Date.now()}`,
      title: 'New Hot Topic',
      icon: 'star',
    });
    onChange(updated);
  };

  const removeHotTopic = (index: number) => {
    const updated = { ...data };
    updated.hotTopics.splice(index, 1);
    onChange(updated);
  };

  const updateQuickAccessCard = (index: number, field: string, value: any) => {
    const updated = { ...data };
    updated.quickAccessCards[index] = { ...updated.quickAccessCards[index], [field]: value };
    onChange(updated);
  };

  const addQuickAccessCard = () => {
    const updated = { ...data };
    updated.quickAccessCards.push({
      id: `card-${Date.now()}`,
      title: 'New Card',
      description: '',
      icon: 'checklist',
    });
    onChange(updated);
  };

  const removeQuickAccessCard = (index: number) => {
    const updated = { ...data };
    updated.quickAccessCards.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-8">
      {/* Products Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Products</h3>
          <button
            onClick={addProduct}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add Product
          </button>
        </div>

        <div className="space-y-4">
          {data.products.map((product, index) => (
            <div key={product.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Product {index + 1}</h4>
                <button
                  onClick={() => removeProduct(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <input
                    type="text"
                    value={product.id}
                    onChange={(e) => updateProduct(index, 'id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={product.description}
                    onChange={(e) => updateProduct(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={product.type}
                    onChange={(e) => updateProduct(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cloud">Cloud</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <input
                    type="text"
                    value={product.icon}
                    onChange={(e) => updateProduct(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personas (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={product.personas.join(', ')}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        'personas',
                        e.target.value.split(',').map((p) => p.trim())
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hot Topics Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Hot Topics</h3>
          <button
            onClick={addHotTopic}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add Hot Topic
          </button>
        </div>

        <div className="space-y-3">
          {data.hotTopics.map((topic, index) => (
            <div key={topic.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="ID"
                    value={topic.id}
                    onChange={(e) => updateHotTopic(index, 'id', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Title"
                    value={topic.title}
                    onChange={(e) => updateHotTopic(index, 'title', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Icon"
                    value={topic.icon}
                    onChange={(e) => updateHotTopic(index, 'icon', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => removeHotTopic(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Access Cards Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Access Cards</h3>
          <button
            onClick={addQuickAccessCard}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add Card
          </button>
        </div>

        <div className="space-y-4">
          {data.quickAccessCards.map((card, index) => (
            <div key={card.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Card {index + 1}</h4>
                <button
                  onClick={() => removeQuickAccessCard(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <input
                    type="text"
                    value={card.id}
                    onChange={(e) => updateQuickAccessCard(index, 'id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <input
                    type="text"
                    value={card.icon}
                    onChange={(e) => updateQuickAccessCard(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateQuickAccessCard(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={card.description}
                    onChange={(e) => updateQuickAccessCard(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
