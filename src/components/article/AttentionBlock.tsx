/**
 * AttentionBlock - Alert/notification component for articles
 *
 * Features:
 * - Different types: caution, tip, info, warning, note
 * - Color-coded styling
 * - Icon for each type
 * - Accepts HTML content
 */

import {
  ExclamationTriangleIcon,
  LightBulbIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export type AttentionType = 'caution' | 'tip' | 'info' | 'warning' | 'note';

interface AttentionBlockProps {
  type: AttentionType;
  title?: string;
  content: React.ReactNode;
}

const typeConfig = {
  caution: {
    icon: ExclamationTriangleIcon,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    textColor: 'text-red-800',
    defaultTitle: 'CAUTION',
  },
  tip: {
    icon: LightBulbIcon,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-800',
    defaultTitle: 'TIP',
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-800',
    defaultTitle: 'INFO',
  },
  warning: {
    icon: ExclamationCircleIcon,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-900',
    textColor: 'text-yellow-800',
    defaultTitle: 'WARNING',
  },
  note: {
    icon: DocumentTextIcon,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    textColor: 'text-green-800',
    defaultTitle: 'NOTE',
  },
};

export default function AttentionBlock({ type, title, content }: AttentionBlockProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border-l-4 p-4 my-4 rounded`}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`font-bold ${config.titleColor} mb-1`}>{displayTitle}</p>
          <div className={`text-sm ${config.textColor} prose prose-sm max-w-none [&_a]:!text-current [&_a]:font-bold [&_a]:underline [&_strong]:!text-current`}>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
