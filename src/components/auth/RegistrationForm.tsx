/**
 * RegistrationForm - User registration form component
 *
 * Features:
 * - Collects user information (name, email, persona)
 * - Creates new user account via API
 * - Validates input fields
 * - Handles error states
 */

import { useState } from 'react';
import Icon from '../common/Icon';
import Button from '../common/Button';
import type { PersonaId } from '../../types';

interface RegistrationFormProps {
  onSuccess: (userId: string) => void;
  onCancel: () => void;
}

export default function RegistrationForm({
  onSuccess,
  onCancel,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    persona: 'customer' as PersonaId,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const personas: { id: PersonaId; label: string }[] = [
    { id: 'customer', label: 'Customer' },
    { id: 'accountant', label: 'Accountant' },
    { id: 'partner', label: 'Partner' },
    { id: 'developer', label: 'Developer' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ownedProducts: [], // Start with no products
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Success! Call onSuccess with the new user ID
      onSuccess(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter your full name"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter your email"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="persona"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          I am a...
        </label>
        <select
          id="persona"
          value={formData.persona}
          onChange={(e) =>
            setFormData({ ...formData, persona: e.target.value as PersonaId })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={loading}
        >
          {personas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-800">
          <Icon name="alert-circle" className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          variant="secondary"
          onClick={onCancel}
          className={`flex-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Cancel
        </Button>
        <button
          type="submit"
          className={`flex-1 btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </form>
  );
}
