/**
 * Button - Reusable button component
 *
 * Features:
 * - Multiple variants (primary, secondary, text)
 * - Multiple sizes (sm, md, lg)
 * - Support for onClick and Link navigation
 * - Accessible and responsive
 * - Consistent styling across the app
 */

import { Link } from 'react-router-dom';
import type { ButtonProps } from '../../types';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  className = '',
}: ButtonProps) {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Variant classes
  const variantClasses = {
    primary: 'btn-primary focus:ring-gray-500',
    secondary: 'btn-secondary focus:ring-gray-500',
    text: 'btn-text focus:ring-gray-300',
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-sm rounded',
    md: 'px-6 py-2 text-base rounded-md',
    lg: 'px-8 py-3 text-lg rounded-lg',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  // If href is provided, render as Link
  if (href) {
    return (
      <Link to={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  // Otherwise, render as button
  return (
    <button
      onClick={onClick}
      className={combinedClasses}
      type="button"
    >
      {children}
    </button>
  );
}
