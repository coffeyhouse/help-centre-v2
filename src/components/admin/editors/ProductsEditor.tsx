import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, XMarkIcon, ChevronRightIcon, Bars3Icon } from '@heroicons/react/24/outline';
import ConfirmModal from '../ConfirmModal';

interface Product {
  id: string;
  name: string;
  description: string;
  type: string;
  personas: string[];
  countries?: string[];
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
    quickAccessCards: QuickAccessCard[];
  };
  onChange: (data: any) => void;
}

type SectionType = 'products' | 'quickAccessCards';

export default function ProductsEditor({ data, onChange }: ProductsEditorProps) {
  const [activeSection, setActiveSection] = useState<SectionType>('products');
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ name: string; index: number } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleSelectProduct = (index: number) => {
    setSelectedProductIndex(index);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setSelectedProductIndex(null);
  };

  const handleSaveNew = (product: Product) => {
    onChange({
      ...data,
      products: [...data.products, product],
    });
    setIsAddingNew(false);
  };

  const handleUpdateProduct = (index: number, updatedProduct: Product) => {
    onChange({
      ...data,
      products: data.products.map((p, i) => (i === index ? updatedProduct : p)),
    });
  };

  const handleDeleteProduct = (index: number) => {
    const product = data.products[index];
    setItemToDelete({ index, name: product.name });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onChange({
        ...data,
        products: data.products.filter((_, i) => i !== itemToDelete.index),
      });
      setSelectedProductIndex(null);
      setItemToDelete(null);
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setSelectedProductIndex(null);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedProducts = [...data.products];
    const [movedProduct] = reorderedProducts.splice(draggedIndex, 1);
    reorderedProducts.splice(dropIndex, 0, movedProduct);

    onChange({
      ...data,
      products: reorderedProducts,
    });

    // Update selected index if needed
    if (selectedProductIndex === draggedIndex) {
      setSelectedProductIndex(dropIndex);
    } else if (selectedProductIndex !== null) {
      if (draggedIndex < selectedProductIndex && dropIndex >= selectedProductIndex) {
        setSelectedProductIndex(selectedProductIndex - 1);
      } else if (draggedIndex > selectedProductIndex && dropIndex <= selectedProductIndex) {
        setSelectedProductIndex(selectedProductIndex + 1);
      }
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('products')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'products'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Products ({data.products.length})
        </button>
        <button
          onClick={() => setActiveSection('quickAccessCards')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'quickAccessCards'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Quick Access Cards ({data.quickAccessCards.length})
        </button>
      </div>

      {/* Products Section */}
      {activeSection === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Products List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Products</h3>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Add Product
              </button>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto">
              {data.products.map((product, index) => (
                <div
                  key={product.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`rounded-lg border transition-all ${
                    draggedIndex === index
                      ? 'opacity-50'
                      : dragOverIndex === index
                      ? 'border-blue-500 border-2 bg-blue-50'
                      : selectedProductIndex === index
                      ? 'border-blue-300'
                      : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => handleSelectProduct(index)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      selectedProductIndex === index
                        ? 'bg-blue-50'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab active:cursor-grabbing">
                        <Bars3Icon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{product.id}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            product.type === 'cloud' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.type}
                          </span>
                          {product.personas.map((persona) => (
                            <span
                              key={persona}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {persona}
                            </span>
                          ))}
                          {product.countries && product.countries.map((country) => (
                            <span
                              key={country}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                            >
                              {country.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Product Form */}
          <div>
            {selectedProductIndex !== null || isAddingNew ? (
              <ProductForm
                product={selectedProductIndex !== null ? data.products[selectedProductIndex] : null}
                isNew={isAddingNew}
                onSave={
                  isAddingNew
                    ? handleSaveNew
                    : (product) => handleUpdateProduct(selectedProductIndex!, product)
                }
                onDelete={
                  selectedProductIndex !== null ? () => handleDeleteProduct(selectedProductIndex) : undefined
                }
                onCancel={handleCancel}
              />
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center h-full flex items-center justify-center">
                <p className="text-gray-600">Select a product to edit or click "Add Product" to create one.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Access Cards Section */}
      {activeSection === 'quickAccessCards' && (
        <QuickAccessCardsSection
          cards={data.quickAccessCards}
          onChange={(quickAccessCards) => onChange({ ...data, quickAccessCards })}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />
    </div>
  );
}

interface ProductFormProps {
  product: Product | null;
  isNew: boolean;
  onSave: (product: Product) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

function ProductForm({ product, isNew, onSave, onDelete, onCancel }: ProductFormProps) {
  const availablePersonas = ['customer', 'accountant', 'partner', 'developer'];
  const [availableCountries, setAvailableCountries] = useState<Array<{ code: string; name: string }>>([]);

  const [formData, setFormData] = useState<Product>(
    product || {
      id: '',
      name: '',
      description: '',
      type: 'cloud',
      personas: [],
      countries: [],
      icon: '',
    }
  );
  const [originalData, setOriginalData] = useState<Product>(formData);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Load available countries from regions.json
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/data/regions.json');
        const regions = await response.json();
        setAvailableCountries(regions);
      } catch (error) {
        console.error('Failed to load countries:', error);
        // Fallback to common countries
        setAvailableCountries([
          { code: 'gb', name: 'United Kingdom' },
          { code: 'ie', name: 'Ireland' },
        ]);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setOriginalData(product);
    } else {
      const defaultData = {
        id: '',
        name: '',
        description: '',
        type: 'cloud',
        personas: [],
        countries: [],
        icon: '',
      };
      setFormData(defaultData);
      setOriginalData(defaultData);
    }
  }, [product]);

  // Check if form has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePersonaToggle = (persona: string) => {
    setFormData((prev) => {
      const isSelected = prev.personas.includes(persona);
      const newPersonas = isSelected
        ? prev.personas.filter((p) => p !== persona)
        : [...prev.personas, persona];
      return { ...prev, personas: newPersonas };
    });
  };

  const handleCountryToggle = (country: string) => {
    setFormData((prev) => {
      const countries = prev.countries || [];
      const isSelected = countries.includes(country);
      const newCountries = isSelected
        ? countries.filter((c) => c !== country)
        : [...countries, country];
      return { ...prev, countries: newCountries };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onCancel(); // Close form after saving
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    onCancel();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isNew ? 'New Product' : 'Edit Product'}
          </h3>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.id}
          onChange={(e) => handleChange('id', e.target.value)}
          disabled={!isNew}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            !isNew ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          placeholder="e.g., product-a"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {isNew ? 'Unique identifier (use lowercase with hyphens)' : 'ID cannot be changed after creation'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Product A"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Brief description..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="cloud">Cloud</option>
          <option value="desktop">Desktop</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icon <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e) => handleChange('icon', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., icon-a"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Icon identifier for UI display</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Personas <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {availablePersonas.map((persona) => (
            <label key={persona} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.personas.includes(persona)}
                onChange={() => handlePersonaToggle(persona)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{persona}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Select all applicable personas</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Countries
        </label>
        <div className="space-y-2">
          {availableCountries.map((country) => (
            <label key={country.code} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.countries || []).includes(country.code)}
                onChange={() => handleCountryToggle(country.code)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                {country.name} ({country.code.toUpperCase()})
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select countries where this product is available. Leave empty for all countries.
        </p>
      </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!hasChanges && !isNew}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isNew ? 'Add Product' : 'Apply Changes'}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancel}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel? All changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Keep Editing"
        confirmStyle="danger"
      />
    </>
  );
}

// Quick Access Cards Section Component
function QuickAccessCardsSection({
  cards,
  onChange,
}: {
  cards: QuickAccessCard[];
  onChange: (cards: QuickAccessCard[]) => void;
}) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<{ index: number; title: string } | null>(null);

  const addCard = () => {
    onChange([...cards, { id: `card-${Date.now()}`, title: '', description: '', icon: '' }]);
  };

  const updateCard = (index: number, field: keyof QuickAccessCard, value: string) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeCard = (index: number) => {
    setCardToDelete({ index, title: cards[index].title });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (cardToDelete) {
      onChange(cards.filter((_, i) => i !== cardToDelete.index));
      setCardToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quick Access Cards</h3>
        <button
          onClick={addCard}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Add Card
        </button>
      </div>

      <div className="space-y-4">
        {cards.map((card, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Card {index + 1}</h4>
              <button onClick={() => removeCard(index)} className="text-red-600 hover:text-red-700">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">ID</label>
                <input
                  type="text"
                  value={card.id}
                  onChange={(e) => updateCard(index, 'id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={card.icon}
                  onChange={(e) => updateCard(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => updateCard(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={card.description}
                  onChange={(e) => updateCard(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Quick Access Card"
        message={`Are you sure you want to delete "${cardToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />
    </div>
  );
}
