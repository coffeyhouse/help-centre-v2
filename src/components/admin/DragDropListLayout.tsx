/**
 * DragDropListLayout - Two-column layout for drag-and-drop lists
 *
 * Features:
 * - Left column: Scrollable list of items
 * - Right column: Sticky detail panel
 * - Responsive grid layout
 * - Empty state support
 */

import { ReactNode } from 'react';

interface DragDropListLayoutProps {
  listTitle: string;
  itemCount: number;
  listContent: ReactNode;
  detailContent: ReactNode;
  emptyState?: ReactNode;
}

export default function DragDropListLayout({
  listTitle,
  itemCount,
  listContent,
  detailContent,
  emptyState,
}: DragDropListLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Items List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {listTitle} ({itemCount})
        </h2>
        {itemCount > 0 ? (
          <div className="space-y-2">
            {listContent}
          </div>
        ) : emptyState ? (
          emptyState
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No items found.</p>
          </div>
        )}
      </div>

      {/* Right Column - Detail Panel */}
      <div>
        {detailContent}
      </div>
    </div>
  );
}
