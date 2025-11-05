/**
 * ContactMethods - Alternative contact methods section
 *
 * Features:
 * - Cards for different contact methods
 * - Community Hub card (full width promo)
 * - Phone contact card with hours
 * - Button actions for each method
 * - Modal support for displaying detailed information
 * - Responsive layout
 */

import { useState } from 'react';
import Button from '../../common/Button';
import Icon from '../../common/Icon';
import Modal from '../../common/Modal';
import type { ContactMethod } from '../../../types';

interface ContactMethodsProps {
  methods: ContactMethod[];
}

export default function ContactMethods({ methods }: ContactMethodsProps) {
  const [openModalId, setOpenModalId] = useState<string | null>(null);

  if (!methods || methods.length === 0) {
    return null;
  }

  const handleButtonClick = (method: ContactMethod) => {
    if (method.openModal && method.modalContent) {
      setOpenModalId(method.id);
    } else if (method.url) {
      window.location.href = method.url;
    }
  };

  const renderModalContent = (method: ContactMethod) => {
    if (!method.modalContent) return null;

    return (
      <div className="space-y-6">
        {method.modalContent.sections.map((section, index) => {
          const sectionType = section.type || 'text';

          // Warning section - yellow background
          if (sectionType === 'warning') {
            return (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                {section.heading && (
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    {section.heading}
                  </h3>
                )}
                <p className="text-yellow-800 whitespace-pre-line">{section.content}</p>
              </div>
            );
          }

          // Info section - blue background
          if (sectionType === 'info') {
            return (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                {section.heading && (
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    {section.heading}
                  </h3>
                )}
                <p className="text-blue-800 whitespace-pre-line">{section.content}</p>
              </div>
            );
          }

          // List section - bullet points
          if (sectionType === 'list') {
            const items = section.content.split('\n').filter(item => item.trim());
            return (
              <div key={index}>
                {section.heading && (
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {section.heading}
                  </h3>
                )}
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          }

          // Text section - default
          return (
            <div key={index}>
              {section.heading && (
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {section.heading}
                </h3>
              )}
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {methods.map((method) => {
          // Community card - full width promotional style
          if (method.type === 'card') {
            return (
              <div
                key={method.id}
                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <Icon name={method.icon} className="w-10 h-10 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                    {method.description && (
                      <p className="text-gray-600 mb-4">{method.description}</p>
                    )}
                    <Button variant="primary" onClick={() => handleButtonClick(method)}>
                      {method.buttonLabel}
                    </Button>
                  </div>
                </div>
              </div>
            );
          }

          // Phone/Action card - standard style
          if (method.type === 'action') {
            return (
              <div
                key={method.id}
                className="bg-white rounded-lg p-8 border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Icon name={method.icon} className="w-10 h-10 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                    {method.description && (
                      <p className="text-gray-600 mb-4">{method.description}</p>
                    )}

                    {/* Phone number and hours */}
                    {method.phoneNumber && (
                      <div className="mb-4">
                        <p className="text-2xl font-semibold text-gray-900 mb-1">
                          {method.phoneNumber}
                        </p>
                        {method.hours && (
                          <p className="text-sm text-gray-500">{method.hours}</p>
                        )}
                      </div>
                    )}

                    <Button
                      variant={method.buttonStyle === 'outline' ? 'secondary' : 'primary'}
                      onClick={() => handleButtonClick(method)}
                    >
                      {method.buttonLabel}
                    </Button>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Render modals */}
      {methods.map((method) => {
        if (!method.openModal || !method.modalContent) return null;

        return (
          <Modal
            key={`modal-${method.id}`}
            isOpen={openModalId === method.id}
            onClose={() => setOpenModalId(null)}
            title={method.modalContent.title}
          >
            {renderModalContent(method)}
          </Modal>
        );
      })}
    </>
  );
}
