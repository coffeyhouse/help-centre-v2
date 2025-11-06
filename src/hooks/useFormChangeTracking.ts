/**
 * useFormChangeTracking - Hook for tracking form changes
 *
 * Tracks original data and compares with current data to detect changes.
 * Useful for enabling/disabling save buttons and showing unsaved changes warnings.
 */

import { useState, useEffect, useCallback } from 'react';

export function useFormChangeTracking<T>(initialData: T | null) {
  const [formData, setFormData] = useState<T | null>(initialData);
  const [originalData, setOriginalData] = useState<T | null>(initialData);

  // Update both when initial data changes
  useEffect(() => {
    setFormData(initialData);
    setOriginalData(initialData);
  }, [initialData]);

  // Check if there are changes
  const hasChanges = formData !== null &&
                     originalData !== null &&
                     JSON.stringify(formData) !== JSON.stringify(originalData);

  // Reset to original data (for cancel)
  const resetForm = useCallback(() => {
    setFormData(originalData);
  }, [originalData]);

  // Mark current state as saved (for after successful save)
  const markAsSaved = useCallback(() => {
    setOriginalData(formData);
  }, [formData]);

  return {
    formData,
    setFormData,
    originalData,
    hasChanges,
    resetForm,
    markAsSaved,
  };
}
