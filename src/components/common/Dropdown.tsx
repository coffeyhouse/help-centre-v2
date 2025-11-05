/**
 * Dropdown - Reusable dropdown/select component
 *
 * Features:
 * - Accessible select element
 * - Label support
 * - Custom styling with Tailwind
 * - Responsive design
 * - Focus states
 */

import type { DropdownProps } from '../../types';

export default function Dropdown({
  label,
  value,
  options,
  onChange,
  className = '',
}: DropdownProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Select */}
      <select
        value={value}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
