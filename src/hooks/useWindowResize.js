import { useState, useEffect, useRef } from 'react';

export function useWindowResize(initialSize = { width: 500, height: 400 }, minSize = { width: 300, height: 200 }) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, left: 0, top: 0 });
  const [positionDelta, setPositionDelta] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const getEventCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleMouseDown = (e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      const coords = getEventCoordinates(e);
      // Use actual DOM dimensions to avoid state/DOM mismatch
      setResizeStart({
        x: coords.x,
        y: coords.y,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top
      });
    }
    setPositionDelta({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isResizing) return;
      
      // Prevent default to stop browser scroll/zoom during resize
      e.preventDefault();

      const coords = e.touches && e.touches.length > 0
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };

      const deltaX = coords.x - resizeStart.x;
      const deltaY = coords.y - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newPositionDelta = { x: 0, y: 0 };

      if (resizeDirection.includes('e')) {
        // Constrain width so right edge doesn't exceed viewport
        const maxWidth = window.innerWidth - resizeStart.left;
        newWidth = Math.max(minSize.width, Math.min(resizeStart.width + deltaX, maxWidth));
      }
      if (resizeDirection.includes('w')) {
        // Calculate new width: dragging right (positive deltaX) makes window narrower
        const requestedWidth = resizeStart.width - deltaX;
        
        // Constrain so left edge doesn't go past x=0
        // Max width when resizing west = right edge position = left + width
        const maxWidthWest = resizeStart.left + resizeStart.width;
        newWidth = Math.max(minSize.width, Math.min(requestedWidth, maxWidthWest));
        
        // Position should move by the actual width change
        // When dragging right: window narrower, position moves right
        // When dragging left: window wider, position moves left
        const actualWidthChange = resizeStart.width - newWidth;
        
        // Only move position if width actually changed
        // This prevents sliding when window is at minimum width
        newPositionDelta.x = actualWidthChange;
      }
      if (resizeDirection.includes('s')) {
        // Constrain height so bottom edge doesn't exceed viewport
        const maxHeight = window.innerHeight - resizeStart.top;
        newHeight = Math.max(minSize.height, Math.min(resizeStart.height + deltaY, maxHeight));
      }
      if (resizeDirection.includes('n')) {
        // Calculate new height: dragging up (negative deltaY) makes window taller
        const requestedHeight = resizeStart.height - deltaY;
        
        // Constrain so top edge doesn't go past y=0
        // Max height when resizing north = bottom edge position = top + height
        const maxHeightNorth = resizeStart.top + resizeStart.height;
        newHeight = Math.max(minSize.height, Math.min(requestedHeight, maxHeightNorth));
        
        // Position should move by the amount the height actually changed
        // This is the difference between original height and new height
        newPositionDelta.y = resizeStart.height - newHeight;
      }

      setSize({ width: newWidth, height: newHeight });
      setPositionDelta(newPositionDelta);
    };

    const handleEnd = (e) => {
      if (e.type === 'touchend') {
        e.preventDefault();
      }
      setIsResizing(false);
      setResizeDirection(null);
      setPositionDelta({ x: 0, y: 0 });
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleEnd, { passive: false });
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isResizing, resizeDirection, resizeStart, minSize]);

  // Handle browser window resize
  useEffect(() => {
    const handleWindowResize = () => {
      if (windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        const maxWidth = window.innerWidth - rect.left;
        const maxHeight = window.innerHeight - rect.top;
        
        setSize(prev => ({
          width: Math.min(prev.width, Math.max(maxWidth, minSize.width)),
          height: Math.min(prev.height, Math.max(maxHeight, minSize.height))
        }));
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [minSize]);

  return { size, setSize, isResizing, handleMouseDown, windowRef, positionDelta, resizeDirection };
}

