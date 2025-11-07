/**
 * VideosGrid - Grid of video cards for a topic
 *
 * Features:
 * - 2-column grid of video cards
 * - YouTube embed support
 * - Duration display
 * - Thumbnail display
 * - Opens videos in new tab
 */

import { PlayIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { Video } from '../../../types';

interface VideosGridProps {
  videos: Video[];
}

export default function VideosGrid({ videos }: VideosGridProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <PlayIcon className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No videos available yet
          </h3>
          <p className="text-gray-600">
            Video tutorials for this topic will be available soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden group"
          >
            {/* Thumbnail */}
            <div className="relative bg-gray-900 aspect-video">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlayIcon className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlayIcon className="w-8 h-8 text-purple-600 ml-1" />
                </div>
              </div>
              {/* Duration badge */}
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>{video.duration}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {video.description}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
