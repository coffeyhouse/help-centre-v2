/**
 * ContactMethods - Alternative contact methods section
 *
 * Features:
 * - Cards for different contact methods
 * - Community Hub card (full width promo)
 * - Phone contact card with hours
 * - Button actions for each method
 * - Responsive layout
 */

import Button from '../../common/Button';
import Icon from '../../common/Icon';
import type { ContactMethod } from '../../../types';

interface ContactMethodsProps {
  methods: ContactMethod[];
}

export default function ContactMethods({ methods }: ContactMethodsProps) {
  if (!methods || methods.length === 0) {
    return null;
  }

  return (
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
                  <Button variant="primary">
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
  );
}
