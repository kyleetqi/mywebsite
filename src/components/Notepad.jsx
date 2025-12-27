import { useState, useEffect } from 'react';
import './Notepad.css';
import { useWindowResize } from '../hooks/useWindowResize';

function Notepad({ title, content, onClose, initialPosition = { x: 150, y: 150 } }) {
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

  const onMouseDown = (e) => {
    // Don't start dragging if clicking on resize handles or close button
    if (e.target.closest('.resize-handle')) return;
    if (e.target.closest('.notepad-close-btn')) return;
    // Only start dragging if clicking on the header
    if (!e.target.closest('.notepad-header')) return;
    
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const onMouseMove = (e) => {
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

  const onMouseUp = () => setDragging(false);

  // Add global mouse move and up handlers for dragging
  useEffect(() => {
    if (dragging) {
      const handleMouseMove = (e) => {
        e.preventDefault();
        onMouseMove(e);
      };
      const handleMouseUp = (e) => {
        e.preventDefault();
        onMouseUp();
      };
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, offset, position, size]);

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
      className="notepad-window"
      style={{ top: position.y, left: position.x, width: size.width, height: size.height }}
    >
      <div className="notepad-header" onMouseDown={onMouseDown}>
        <span className="notepad-title">{title}</span>
        <button 
          className="notepad-close-btn" 
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
      <div className="notepad-menu">
        <span>File</span>
        <span>Edit</span>
        <span>Format</span>
        <span>View</span>
        <span>Help</span>
      </div>
      <div className="notepad-content">
        <textarea readOnly value={content} className="notepad-textarea" />
      </div>
      <div className="resize-handle resize-handle-n" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'n'); }}></div>
      <div className="resize-handle resize-handle-s" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 's'); }}></div>
      <div className="resize-handle resize-handle-e" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'e'); }}></div>
      <div className="resize-handle resize-handle-w" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'w'); }}></div>
      <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'ne'); }}></div>
      <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'nw'); }}></div>
      <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'se'); }}></div>
      <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'sw'); }}></div>
    </div>
  );
}

export default Notepad;

