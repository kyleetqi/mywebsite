import { useState, useEffect, useRef } from 'react';

export function useWindowResize(initialSize = { width: 500, height: 400 }, minSize = { width: 300, height: 200 }) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, left: 0, top: 0 });
  const [positionDelta, setPositionDelta] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const handleMouseDown = (e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      // Use actual DOM dimensions to avoid state/DOM mismatch
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top
      });
    }
    setPositionDelta({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newPositionDelta = { x: 0, y: 0 };

      if (resizeDirection.includes('e')) {
        newWidth = Math.max(minSize.width, resizeStart.width + deltaX);
      }
      if (resizeDirection.includes('w')) {
        // Calculate new width: dragging right (positive deltaX) makes window narrower
        const requestedWidth = resizeStart.width - deltaX;
        newWidth = Math.max(minSize.width, requestedWidth);
        
        // Position should move by the actual width change
        // When dragging right: window narrower, position moves right
        // When dragging left: window wider, position moves left
        const actualWidthChange = resizeStart.width - newWidth;
        
        // Only move position if width actually changed
        // This prevents sliding when window is at minimum width
        newPositionDelta.x = actualWidthChange;
      }
      if (resizeDirection.includes('s')) {
        // Constrain height to viewport
        const maxHeight = window.innerHeight - (windowRef.current?.getBoundingClientRect().top || 0);
        newHeight = Math.max(minSize.height, Math.min(resizeStart.height + deltaY, maxHeight));
      }
      if (resizeDirection.includes('n')) {
        // Calculate new height: dragging up (positive deltaY) makes window shorter
        newHeight = Math.max(minSize.height, resizeStart.height - deltaY);
        // Position should move by the amount the height actually changed
        // This is the difference between original height and new height
        newPositionDelta.y = resizeStart.height - newHeight;
      }

      setSize({ width: newWidth, height: newHeight });
      setPositionDelta(newPositionDelta);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
      setPositionDelta({ x: 0, y: 0 });
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, resizeStart, minSize, size]);

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

  return { size, setSize, isResizing, handleMouseDown, windowRef, positionDelta };
}

