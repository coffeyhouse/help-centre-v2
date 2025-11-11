/**
 * Accordion - Collapsible content component for articles
 *
 * Features:
 * - Click to expand/collapse content
 * - Animated transition
 * - Arrow icon that rotates
 * - Accepts HTML content
 */

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface AccordionProps {
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({ title, content, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-300 rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900">{title}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-4 prose prose-sm max-w-none">
          {content}
        </div>
      </div>
    </div>
  );
}
