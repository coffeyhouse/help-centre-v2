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
import type { CardProps } from '../../types';

export default function Card({ title, description, icon, onClick, href }: CardProps) {
  const baseClasses = 'card card-hover cursor-pointer';

  const content = (
    <>
      {/* Icon */}
      {icon && (
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mb-4">
          <span className="text-2xl">{getIconDisplay(icon)}</span>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 text-gray-900">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      )}

      {/* Arrow indicator */}
      <div className="mt-4 text-gray-400">
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
    </>
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

/**
 * Convert icon string to display element
 * For MVP, we use simple emoji/text placeholders
 */
function getIconDisplay(icon: string): string {
  const iconMap: Record<string, string> = {
    download: '⬇️',
    lock: '🔒',
    star: '⭐',
    document: '📄',
    bank: '🏦',
    remote: '🖥️',
    calendar: '📅',
    play: '▶️',
    checklist: '✅',
    community: '💬',
    graduation: '🎓',
    phone: '📞',
    question: '❓',
    'icon-a': '📊',
    'icon-b': '☁️',
    'icon-c': '💰',
    'icon-d': '📈',
    'icon-e': '📋',
    'icon-f': '💳',
  };

  return iconMap[icon] || '📌';
}
