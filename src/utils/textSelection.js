export const setupTextSelection = (element, onTextSelected) => {
  let isSelecting = false;
  let startX, startY;

  const handleMouseDown = (e) => {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
  };

  const handleMouseUp = (e) => {
    if (!isSelecting) return;
    
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text && text.length > 10) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      onTextSelected({
        text,
        position: {
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY - 50
        },
        boundingRect: rect
      });
    }
    
    isSelecting = false;
  };

  const handleTouchStart = (e) => {
    isSelecting = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (!isSelecting) return;
    
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text && text.length > 10) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      onTextSelected({
        text,
        position: {
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY - 50
        },
        boundingRect: rect
      });
    }
    
    isSelecting = false;
  };

  element.addEventListener('mousedown', handleMouseDown);
  element.addEventListener('mouseup', handleMouseUp);
  element.addEventListener('touchstart', handleTouchStart);
  element.addEventListener('touchend', handleTouchEnd);

  return () => {
    element.removeEventListener('mousedown', handleMouseDown);
    element.removeEventListener('mouseup', handleMouseUp);
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
  };
};