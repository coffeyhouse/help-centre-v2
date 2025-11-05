/**
 * TabNavigation - Tab component for topic pages
 *
 * Features:
 * - Three tabs: Support guides, Free training, Get in touch
 * - Green underline for active tab
 * - Tab state management
 * - Accessible tab navigation
 * - Filters content based on selection
 */

import { useState } from 'react';

interface TabNavigationProps {
  onTabChange?: (tabId: string) => void;
}

export default function TabNavigation({ onTabChange }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState('support-guides');

  const tabs = [
    { id: 'support-guides', label: 'Support guides' },
    { id: 'free-training', label: 'Free training' },
    { id: 'get-in-touch', label: 'Get in touch' },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="border-b border-gray-200 mb-8">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}

            {/* Green underline for active tab */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
