import { useState, useEffect, useRef } from 'react';
import './Window.css';
import { useWindowResize } from '../hooks/useWindowResize';
import CloseButton from '../assets/CloseButton.png';
import CloseButtonHover from '../assets/CloseButtonHover.png';
import CloseButtonPress from '../assets/CloseButtonPress.png';
import NotepadIcon from '../assets/Icons/Notepad_WinXP.png';

function Window({ onClose, initialPosition = { x: 100, y: 100 }, title = "About Me", titleIcon = NotepadIcon, zIndex = 100, onFocus }) {
  const [position, setPosition] = useState(initialPosition);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [closeButtonState, setCloseButtonState] = useState('default'); // 'default', 'hover', 'press'
  const [isCloseButtonPressed, setIsCloseButtonPressed] = useState(false);
  const resizeStartPosition = useRef(initialPosition);
  const { size, handleMouseDown: handleResizeMouseDownBase, windowRef, positionDelta, isResizing } = useWindowResize({ width: 600, height: 500 }, { width: 400, height: 300 });

  // Wrap resize handler to capture position when resize starts
  const handleResizeMouseDown = (e, direction) => {
    // Capture position synchronously before resize starts
    resizeStartPosition.current = { x: position.x, y: position.y };
    handleResizeMouseDownBase(e, direction);
  };

  // Adjust position when resizing from left or top
  // positionDelta represents total change from resize start, not incremental
  useEffect(() => {
    if (isResizing && (positionDelta.x !== 0 || positionDelta.y !== 0)) {
      const newX = resizeStartPosition.current.x + positionDelta.x;
      const newY = resizeStartPosition.current.y + positionDelta.y;
      
      setPosition({
        x: newX,
        y: newY
      });
    }
  }, [positionDelta, isResizing]);

  const onTopTabMouseDown = (e) => {
    // Don't start dragging if clicking on close button or resize handles
    if (e.target.closest('.window-close-btn')) return;
    if (e.target.closest('.resize-handle')) return;
    
    // Only start dragging if clicking on the top frame
    const frameTop = e.target.closest('.frame-top');
    if (!frameTop) return;
    
    // Bring window to front when clicking on title bar
    if (onFocus) {
      onFocus();
    }
    
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

  // Handle close button mouse up globally (in case mouse is released outside button)
  useEffect(() => {
    if (!isCloseButtonPressed) return;
    
    const handleGlobalMouseUp = () => {
      setIsCloseButtonPressed(false);
      setCloseButtonState('default');
      onClose();
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isCloseButtonPressed, onClose]);

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

  const handleWindowMouseDown = (e) => {
    // Bring window to front when clicked (except on resize handles and close button)
    // Skip if clicking on title bar (handled by onTopTabMouseDown)
    if (e.target.closest('.frame-top')) return;
    
    if (!e.target.closest('.resize-handle') && !e.target.closest('.window-close-btn')) {
      if (onFocus) {
        onFocus();
      }
    }
  };

  return (
    <div 
      ref={windowRef}
      className="window"
      style={{ top: position.y, left: position.x, width: size.width, height: size.height, zIndex: zIndex }}
      onMouseDown={handleWindowMouseDown}
    >
      {/* Window Frame - 9-slice layout */}
      <div className="window-frame">
        {/* Top Row */}
        <div className="frame-top-left"></div>
        <div className="frame-top" onMouseDown={onTopTabMouseDown}>
          <div className="window-title-container">
            <img src={titleIcon} alt="Icon" className="window-title-icon" />
            <span className="window-title">{title}</span>
          </div>
          <button 
            className="window-close-btn" 
            onMouseEnter={() => {
              if (closeButtonState !== 'press') {
                setCloseButtonState('hover');
              }
            }}
            onMouseLeave={() => {
              if (closeButtonState !== 'press') {
                setCloseButtonState('default');
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setCloseButtonState('press');
              setIsCloseButtonPressed(true);
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (isCloseButtonPressed) {
                setIsCloseButtonPressed(false);
                setCloseButtonState('default');
                onClose();
              }
            }}
          >
            <img 
              src={
                closeButtonState === 'press' ? CloseButtonPress :
                closeButtonState === 'hover' ? CloseButtonHover :
                CloseButton
              }
              alt="Close"
            />
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

