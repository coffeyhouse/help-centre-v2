/**
 * useDragAndDrop - Hook for managing drag-and-drop state and handlers
 *
 * Provides all the state and handlers needed for drag-and-drop reordering.
 * Works with array data and calls onChange when items are reordered.
 */

import { useState } from 'react';

export function useDragAndDrop<T>(
  items: T[],
  onChange: (items: T[]) => void,
  onReorder?: (oldIndex: number, newIndex: number) => void
) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedItems = [...items];
    const [movedItem] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(dropIndex, 0, movedItem);

    onChange(reorderedItems);

    // Callback for additional logic (like updating selected index)
    if (onReorder) {
      onReorder(draggedIndex, dropIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}
