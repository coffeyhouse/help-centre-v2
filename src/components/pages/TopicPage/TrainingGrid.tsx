/**
 * TrainingGrid - Grid of training material cards for a topic
 *
 * Features:
 * - 2-column grid of training cards
 * - Type badges (course, guide, webinar, certification)
 * - Level badges (beginner, intermediate, advanced)
 * - Duration display
 * - Opens training in new tab
 */

import { AcademicCapIcon, ClockIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import type { Training } from '../../../types';

interface TrainingGridProps {
  training: Training[];
}

export default function TrainingGrid({ training }: TrainingGridProps) {
  if (training.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <AcademicCapIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No training materials available yet
          </h3>
          <p className="text-gray-600">
            Training content for this topic will be available soon.
          </p>
        </div>
      </div>
    );
  }

  const getTypeColor = (type: Training['type']) => {
    const colors = {
      course: 'bg-blue-100 text-blue-700',
      guide: 'bg-green-100 text-green-700',
      webinar: 'bg-purple-100 text-purple-700',
      certification: 'bg-yellow-100 text-yellow-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getLevelColor = (level?: Training['level']) => {
    if (!level) return '';
    const colors = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700',
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {training.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 group"
          >
            {/* Icon */}
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <AcademicCapIcon className="w-7 h-7 text-blue-600" />
            </div>

            {/* Title with external link icon */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                {item.title}
              </h3>
              <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </span>
              {item.level && (
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(item.level)}`}>
                  {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                </span>
              )}
              {item.duration && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  <ClockIcon className="w-3 h-3" />
                  {item.duration}
                </span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {item.description}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
