/**
 * DraggableListItem - Reusable component for drag-and-drop list items
 *
 * Features:
 * - Drag handle with visual affordance
 * - Visual feedback during drag (opacity, border highlight)
 * - Click handler for selection
 * - Customizable content via render prop
 */

import { Bars3Icon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

interface DraggableListItemProps {
  index: number;
  isSelected?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onClick: (index: number) => void;
  children: ReactNode;
}

export default function DraggableListItem({
  index,
  isSelected = false,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onClick,
  children,
}: DraggableListItemProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`rounded-lg border transition-all ${
        isDragging
          ? 'opacity-50'
          : isDragOver
          ? 'border-blue-500 border-2 bg-blue-50'
          : isSelected
          ? 'border-blue-300'
          : 'border-gray-200'
      }`}
    >
      <div
        onClick={() => onClick(index)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(index);
          }
        }}
        className={`w-full text-left p-4 rounded-lg transition-colors cursor-pointer ${
          isSelected
            ? 'bg-blue-50'
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="cursor-grab active:cursor-grabbing">
            <Bars3Icon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
