/**
 * IconSelector - Visual icon picker component
 *
 * Displays all available icons in a grid for easy selection
 */

import { useState } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Icon from '../common/Icon';

interface IconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
  required?: boolean;
}

// All available icons from Icon.tsx
const AVAILABLE_ICONS = [
  // Product icons
  { name: 'icon-a', label: 'Icon A (Chart Bar)' },
  { name: 'icon-b', label: 'Icon B (Cloud)' },
  { name: 'icon-c', label: 'Icon C (Banknotes)' },
  { name: 'icon-d', label: 'Icon D (Chart Pie)' },
  { name: 'icon-e', label: 'Icon E (Clipboard)' },
  { name: 'icon-f', label: 'Icon F (Credit Card)' },

  // Common icons
  { name: 'download', label: 'Download' },
  { name: 'lock', label: 'Lock' },
  { name: 'star', label: 'Star' },
  { name: 'document', label: 'Document' },
  { name: 'bank', label: 'Bank' },
  { name: 'remote', label: 'Remote/Desktop' },
  { name: 'calendar', label: 'Calendar' },
  { name: 'play', label: 'Play' },
  { name: 'checklist', label: 'Checklist' },
  { name: 'community', label: 'Community/Chat' },
  { name: 'graduation', label: 'Graduation' },
  { name: 'phone', label: 'Phone' },
  { name: 'question', label: 'Question' },
  { name: 'email', label: 'Email' },
  { name: 'chat', label: 'Chat' },

  // Navigation icons
  { name: 'home', label: 'Home' },
  { name: 'products', label: 'Products/Cube' },
  { name: 'contact', label: 'Contact' },
  { name: 'book', label: 'Book' },

  // Social media icons
  { name: 'instagram', label: 'Instagram' },
  { name: 'facebook', label: 'Facebook' },
  { name: 'linkedin', label: 'LinkedIn' },
  { name: 'twitter', label: 'Twitter' },
  { name: 'youtube', label: 'YouTube' },
];

export default function IconSelector({ value, onChange, required = false }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = AVAILABLE_ICONS.filter(icon =>
    icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    icon.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      {/* Selected Icon Display / Trigger */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-white"
        >
          {value ? (
            <>
              <div className="bg-blue-100 p-2 rounded">
                <Icon name={value} className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700 flex-1 text-left">{value}</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">Click to select an icon{required && ' *'}</span>
          )}
        </button>
        {value && !required && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Clear selection"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Icon Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select an Icon</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Icon Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredIcons.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {filteredIcons.map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => handleSelect(icon.name)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        value === icon.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                      title={icon.label}
                    >
                      <div className={`p-3 rounded-lg ${
                        value === icon.name ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Icon
                          name={icon.name}
                          className={`w-8 h-8 ${
                            value === icon.name ? 'text-blue-600' : 'text-gray-600'
                          }`}
                        />
                      </div>
                      <span className="text-xs text-gray-600 text-center line-clamp-2">
                        {icon.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No icons found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} available
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
