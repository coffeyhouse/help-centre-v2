/**
 * DragDropCard - Reusable card component for drag-and-drop lists
 *
 * Features:
 * - Rich card design with icon, title, description
 * - Badge support for displaying metadata
 * - Visual feedback during drag (opacity, border highlight)
 * - Selected state styling
 * - Chevron indicator
 */

import { ReactNode } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Icon from '../common/Icon';

export interface Badge {
  label: string;
  color: 'blue' | 'purple' | 'green' | 'gray' | 'red' | 'yellow';
}

interface DragDropCardProps {
  icon?: string | ReactNode;
  iconFallback?: ReactNode;
  title: string;
  description?: string;
  badges?: Badge[];
  isSelected?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

const badgeColors = {
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  gray: 'bg-gray-100 text-gray-600',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
};

export default function DragDropCard({
  icon,
  iconFallback,
  title,
  description,
  badges = [],
  isSelected = false,
  isDragging = false,
  isDragOver = false,
  onClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: DragDropCardProps) {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <Icon name={icon} className={`w-6 h-6 ${
        isSelected ? 'text-blue-600' : 'text-gray-600'
      }`} />;
    }
    if (icon) {
      return icon;
    }
    return iconFallback;
  };

  return (
    <button
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all cursor-move ${
        isDragging
          ? 'opacity-50'
          : isDragOver
          ? 'border-blue-500 bg-blue-50'
          : isSelected
          ? 'bg-blue-50 border-blue-300 shadow-md'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg flex-shrink-0 ${
          isSelected ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className={`font-semibold text-sm ${
              isSelected ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {title}
            </h3>
            <ChevronRightIcon className={`w-5 h-5 flex-shrink-0 ml-2 ${
              isSelected ? 'text-blue-600' : 'text-gray-400'
            }`} />
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
          )}
          {badges.length > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-0.5 rounded-full ${badgeColors[badge.color]}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
