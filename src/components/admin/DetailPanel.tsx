/**
 * DetailPanel - Reusable detail panel for drag-and-drop lists
 *
 * Features:
 * - Sticky positioning
 * - Icon and title display
 * - Edit button
 * - Action buttons/content sections
 * - Empty state when nothing is selected
 */

import { ReactNode } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import Icon from '../common/Icon';

interface DetailPanelProps {
  icon?: string | ReactNode;
  iconFallback?: ReactNode;
  title?: string;
  description?: string;
  onEdit?: () => void;
  editButtonText?: string;
  actionsContent?: ReactNode;
  emptyStateIcon?: ReactNode;
  emptyStateText?: string;
}

export default function DetailPanel({
  icon,
  iconFallback,
  title,
  description,
  onEdit,
  editButtonText = 'Edit Details',
  actionsContent,
  emptyStateIcon,
  emptyStateText = 'Select an item to view details',
}: DetailPanelProps) {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <Icon name={icon} className="w-8 h-8 text-blue-600" />;
    }
    if (icon) {
      return icon;
    }
    return iconFallback;
  };

  if (!title) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center h-full flex items-center justify-center sticky top-6">
        <div>
          {emptyStateIcon}
          <p className="text-gray-600">{emptyStateText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            {renderIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            {editButtonText}
          </button>
        )}
      </div>

      {actionsContent && (
        <div className="border-t border-gray-200 pt-6">
          {actionsContent}
        </div>
      )}
    </div>
  );
}
