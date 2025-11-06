import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeLink?: string;
}

export default function Breadcrumbs({ items, homeLink = '/admin/regions' }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
      {/* Home icon */}
      {homeLink && (
        <>
          <Link
            to={homeLink}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Home"
          >
            <HomeIcon className="w-4 h-4" />
          </Link>
          {items.length > 0 && (
            <ChevronRightIcon className="w-4 h-4 text-gray-400" aria-hidden="true" />
          )}
        </>
      )}

      {/* Breadcrumb items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center space-x-2">
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                className={`flex items-center gap-1 ${
                  isLast ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}

            {!isLast && <ChevronRightIcon className="w-4 h-4 text-gray-400" aria-hidden="true" />}
          </div>
        );
      })}
    </nav>
  );
}
