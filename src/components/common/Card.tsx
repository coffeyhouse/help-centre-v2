/**
 * Card - Reusable card component
 *
 * Features:
 * - White background with border
 * - Hover effects (shadow, scale)
 * - Optional icon
 * - Title and description
 * - Clickable with onClick or Link navigation
 * - Accessible and responsive
 */

import { Link } from 'react-router-dom';
import { CubeIcon, DocumentTextIcon, FolderIcon } from '@heroicons/react/24/outline';
import type { CardProps } from '../../types';
import Icon from './Icon';

export default function Card({ title, description, type, icon, onClick, href }: CardProps) {
  const baseClasses = 'card card-hover cursor-pointer flex items-center min-h-[120px]';

  const content = (
    <div className="flex items-center gap-4 w-full">
      {/* Left side: Content */}
      <div className="flex-1">
        {/* Icon */}
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mb-4">
          {icon ? (
            <Icon name={icon} className="w-7 h-7 text-gray-700" />
          ) : (
            <CubeIcon className="w-7 h-7 text-gray-400" />
          )}
        </div>

        <div className="flex items-center gap-2 mb-2">
          {/* Type Icon */}
          {type === 'Topic' ? (
            <FolderIcon className="w-5 h-5 text-blue-600" />
          ) : type === 'Article' ? (
            <DocumentTextIcon className="w-5 h-5 text-gray-600" />
          ) : null}

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Right side: Arrow indicator */}
      <div className="flex-shrink-0 text-gray-400">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );

  // If href is provided, render as Link
  if (href) {
    return (
      <Link to={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  // If onClick is provided, render as button
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} text-left w-full`}
        type="button"
      >
        {content}
      </button>
    );
  }

  // Otherwise, render as div (non-interactive)
  return <div className={baseClasses.replace('cursor-pointer', '')}>{content}</div>;
}
