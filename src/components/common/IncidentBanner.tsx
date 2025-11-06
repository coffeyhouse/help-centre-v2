/**
 * IncidentBanner - Displays important incident or maintenance information
 *
 * Features:
 * - Multiple states: info, caution, resolved, error
 * - Optional link for more details
 * - Can be dismissed by user
 * - Color-coded based on state
 * - Accessible and responsive
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { IncidentBanner as IncidentBannerType } from '../../types';

interface IncidentBannerProps {
  banner: IncidentBannerType;
}

export default function IncidentBanner({ banner }: IncidentBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !banner.active) {
    return null;
  }

  // Define styles based on banner state
  const stateConfig = {
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
      linkColor: 'text-blue-700 hover:text-blue-900',
    },
    caution: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900',
      linkColor: 'text-yellow-700 hover:text-yellow-900',
    },
    resolved: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
      linkColor: 'text-green-700 hover:text-green-900',
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      linkColor: 'text-red-700 hover:text-red-900',
    },
  };

  const config = stateConfig[banner.state];
  const IconComponent = config.icon;

  return (
    <div
      className={`${config.bgColor} border-b ${config.borderColor} sticky top-[70px] z-30`}
      role="alert"
      aria-live="polite"
    >
      <div className="container-custom py-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <IconComponent className="w-5 h-5" aria-hidden="true" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${config.textColor}`}>
              {banner.title}
            </p>
            <p className={`text-sm ${config.textColor} mt-1`}>
              {banner.message}
              {banner.link && (
                <>
                  {' '}
                  {banner.link.url.startsWith('http') ? (
                    <a
                      href={banner.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`underline font-medium ${config.linkColor}`}
                    >
                      {banner.link.text}
                    </a>
                  ) : (
                    <Link
                      to={banner.link.url}
                      className={`underline font-medium ${config.linkColor}`}
                    >
                      {banner.link.text}
                    </Link>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className={`flex-shrink-0 ${config.iconColor} hover:opacity-75 transition-opacity`}
            aria-label="Dismiss banner"
          >
            <XMarkIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
