import { useState, useEffect } from 'react';
import './Window.css';
import { useWindowResize } from '../hooks/useWindowResize';

function Window({ onClose, initialPosition = { x: 100, y: 100 } }) {
  const [position, setPosition] = useState(initialPosition);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const { size, handleMouseDown: handleResizeMouseDown, windowRef, positionDelta } = useWindowResize({ width: 600, height: 500 }, { width: 400, height: 300 });

  // Adjust position when resizing from left or top
  useEffect(() => {
    if (positionDelta.x !== 0 || positionDelta.y !== 0) {
      setPosition(prev => ({
        x: prev.x + positionDelta.x,
        y: prev.y + positionDelta.y
      }));
    }
  }, [positionDelta]);

  const onTopTabMouseDown = (e) => {
    // Don't start dragging if clicking on close button or resize handles
    if (e.target.closest('.window-close-btn')) return;
    if (e.target.closest('.resize-handle')) return;
    
    // Only start dragging if clicking on the top frame
    const frameTop = e.target.closest('.frame-top');
    if (!frameTop) return;
    
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };


  // Add global mouse move and up handlers for dragging
  useEffect(() => {
    if (!dragging) return;
    
    const handleMouseMove = (e) => {
      if (!dragging) return;
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };
    
    const handleMouseUp = () => {
      setDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, offset, size]);

  // Constrain position on window resize
  useEffect(() => {
    const handleResize = () => {
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY))
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  return (
    <div 
      ref={windowRef}
      className="window"
      style={{ top: position.y, left: position.x, width: size.width, height: size.height }}
    >
      {/* Window Frame - 9-slice layout */}
      <div className="window-frame">
        {/* Top Row */}
        <div className="frame-top-left"></div>
        <div className="frame-top" onMouseDown={onTopTabMouseDown}>
          <span className="window-title">About Me</span>
          <button 
            className="window-close-btn" 
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e) => { 
              e.stopPropagation(); 
              e.preventDefault();
              onClose(); 
            }}
          >
            ✕
          </button>
        </div>
        <div className="frame-top-right"></div>
        
        {/* Middle Row */}
        <div className="frame-left"></div>
        <div className="frame-center">
          {/* Content goes here - blank for now */}
        </div>
        <div className="frame-right"></div>
        
        {/* Bottom Row - WindowFrameBottom spans all 3 columns */}
        <div className="frame-bottom-left"></div>
        <div className="frame-bottom"></div>
        <div className="frame-bottom-right"></div>
      </div>
      
      {/* Resize Handles */}
      <div className="resize-handle resize-handle-s" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 's'); }}></div>
      <div className="resize-handle resize-handle-e" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'e'); }}></div>
      <div className="resize-handle resize-handle-w" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'w'); }}></div>
      <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'se'); }}></div>
      <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'sw'); }}></div>
    </div>
  );
}

export default Window;

