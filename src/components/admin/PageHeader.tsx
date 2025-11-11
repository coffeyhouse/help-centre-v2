/**
 * PageHeader - Reusable page header component for admin pages
 *
 * Features:
 * - Icon/logo display with fallback
 * - Title and description
 * - Optional metadata items
 * - Badge support for displaying tags
 * - Action buttons (edit, etc.)
 */

import { ReactNode } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import Icon from '../common/Icon';

export interface PageHeaderBadge {
  label: string;
  color: 'blue' | 'purple' | 'green' | 'gray' | 'red' | 'yellow' | 'indigo';
}

export interface PageHeaderMetadata {
  label: string;
  value: string;
}

interface PageHeaderProps {
  icon?: string | ReactNode;
  iconFallback?: string;
  title: string;
  description?: string;
  metadata?: PageHeaderMetadata[];
  badges?: PageHeaderBadge[];
  onEdit?: () => void;
  editButtonText?: string;
  actions?: ReactNode;
}

const badgeColors = {
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  gray: 'bg-gray-100 text-gray-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  indigo: 'bg-indigo-100 text-indigo-700',
};

export default function PageHeader({
  icon,
  iconFallback,
  title,
  description,
  metadata = [],
  badges = [],
  onEdit,
  editButtonText = 'Edit Details',
  actions,
}: PageHeaderProps) {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <Icon name={icon} className="w-12 h-12 text-blue-600" />;
    }
    if (icon) {
      return icon;
    }
    // Fallback: first letter of title or provided fallback
    const fallbackLetter = iconFallback || title.charAt(0);
    return (
      <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl">
        {fallbackLetter}
      </div>
    );
  };

  return (
    <div className="mb-8 bg-white rounded-lg shadow p-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-4 rounded-lg flex-shrink-0">
          {renderIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              {description && (
                <p className="text-gray-600 mb-2">{description}</p>
              )}
              {metadata.length > 0 && (
                <div className="mb-2 space-y-1">
                  {metadata.map((item, index) => (
                    <p key={index} className="text-sm text-gray-500">
                      <span className="font-medium">{item.label}:</span> {item.value}
                    </p>
                  ))}
                </div>
              )}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  {badges.map((badge, index) => (
                    <span
                      key={index}
                      className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                        badgeColors[badge.color]
                      }`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  {editButtonText}
                </button>
              )}
              {actions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
