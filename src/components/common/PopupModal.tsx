/**
 * PopupModal - Displays promotional or informational popup modals
 *
 * Features:
 * - Rich content support (text, images, videos)
 * - Multiple call-to-action buttons
 * - Permanent dismissal via localStorage
 * - Accessible and responsive modal dialog
 * - Smooth animations
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { PopupModal as PopupModalType } from '../../types';

interface PopupModalProps {
  popup: PopupModalType;
  onDismiss: () => void;
}

export default function PopupModal({ popup, onDismiss }: PopupModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onDismiss]);

  const handleButtonClick = (button: PopupModalType['buttons'][0]) => {
    if (button.action === 'dismiss') {
      onDismiss();
    } else if (button.action === 'link' && button.url) {
      // If it's an external link, open in new tab
      if (button.url.startsWith('http')) {
        window.open(button.url, '_blank', 'noopener,noreferrer');
        onDismiss();
      }
      // For internal links, React Router will handle navigation
      // We still dismiss the modal
      onDismiss();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close popup"
        >
          <XMarkIcon className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* Image */}
        {popup.image && (
          <div className="w-full">
            <img
              src={popup.image}
              alt=""
              className="w-full h-64 object-cover rounded-t-lg"
            />
          </div>
        )}

        {/* Video */}
        {popup.video && (
          <div className="w-full aspect-video">
            <iframe
              src={popup.video}
              title="Popup video"
              className="w-full h-full rounded-t-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h2
            id="popup-title"
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            {popup.title}
          </h2>
          <p className="text-base text-gray-700 mb-6 whitespace-pre-line">
            {popup.message}
          </p>

          {/* Buttons */}
          {popup.buttons && popup.buttons.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              {popup.buttons.map((button, index) => {
                const buttonContent = button.text;
                const buttonClass = button.primary
                  ? 'bg-brand-teal hover:bg-brand-teal-hover text-white font-semibold'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium';

                // If it's a link button with internal URL, use Link component
                if (
                  button.action === 'link' &&
                  button.url &&
                  !button.url.startsWith('http')
                ) {
                  return (
                    <Link
                      key={index}
                      to={button.url}
                      onClick={() => onDismiss()}
                      className={`${buttonClass} px-6 py-3 rounded-lg transition-colors text-center flex-1`}
                    >
                      {buttonContent}
                    </Link>
                  );
                }

                // For all other buttons (dismiss or external links)
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleButtonClick(button)}
                    className={`${buttonClass} px-6 py-3 rounded-lg transition-colors flex-1`}
                  >
                    {buttonContent}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
