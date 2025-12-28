import { useState, useEffect, useRef } from 'react';
import './Window.css';
import { useWindowResize } from '../hooks/useWindowResize';
import CloseButton from '../assets/CloseButton.png';
import CloseButtonHover from '../assets/CloseButtonHover.png';
import CloseButtonPress from '../assets/CloseButtonPress.png';
import NotepadIcon from '../assets/Icons/Notepad_WinXP.png';
import NotepadMenu from './NotepadMenu';

function Window({ onClose, initialPosition = { x: 100, y: 100 }, title = "About Me", titleIcon = NotepadIcon, zIndex = 100, onFocus, notepadContent }) {
  const [position, setPosition] = useState(initialPosition);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [closeButtonState, setCloseButtonState] = useState('default'); // 'default', 'hover', 'press'
  const [isCloseButtonPressed, setIsCloseButtonPressed] = useState(false);
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const resizeStartPosition = useRef(initialPosition);
  const { size, setSize, handleMouseDown: handleResizeMouseDownBase, windowRef, positionDelta, isResizing } = useWindowResize({ width: 600, height: 500 }, { width: 290, height: 200 });

  // Detect small mobile devices (like iPhone)
  useEffect(() => {
    const checkDeviceSize = () => {
      const isSmall = window.innerWidth <= 480 || window.innerHeight <= 480;
      setIsSmallDevice(isSmall);
      
      if (isSmall) {
        // Set window to full screen minus 30px total (15px padding on each side)
        const newWidth = window.innerWidth - 30;
        const newHeight = window.innerHeight - 30;
        setSize({ width: newWidth, height: newHeight });
        // Center the window with 15px padding
        setPosition({ x: 15, y: 15 });
      }
    };
    
    checkDeviceSize();
    window.addEventListener('resize', checkDeviceSize);
    return () => window.removeEventListener('resize', checkDeviceSize);
  }, [setSize]);

  // Wrap resize handler to capture position when resize starts
  const handleResizeMouseDown = (e, direction) => {
    // Don't allow resizing on small devices
    if (isSmallDevice) return;
    
    // Capture position synchronously before resize starts
    resizeStartPosition.current = { x: position.x, y: position.y };
    handleResizeMouseDownBase(e, direction);
  };

  const handleResizeTouchStart = (e, direction) => {
    handleResizeMouseDown(e, direction);
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

  // Helper to get coordinates from mouse or touch event
  const getEventCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

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
    const coords = getEventCoordinates(e);
    setDragging(true);
    setOffset({
      x: coords.x - position.x,
      y: coords.y - position.y,
    });
  };

  const onTopTabTouchStart = (e) => {
    onTopTabMouseDown(e);
  };


  // Add global mouse move and up handlers for dragging
  useEffect(() => {
    if (!dragging) return;
    
    const handleMove = (e) => {
      if (!dragging) return;
      const coords = e.touches && e.touches.length > 0 
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };
      
      const newX = coords.x - offset.x;
      const newY = coords.y - offset.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      if (isSmallDevice) {
        // On small devices, window is viewport - 40px, so it can be dragged to edges
        // This naturally creates 20px padding when at edges since window is smaller
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      } else {
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };
    
    const handleEnd = (e) => {
      if (e.type === 'touchend') {
        e.preventDefault();
      }
      setDragging(false);
    };
    
    document.addEventListener('mousemove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd, { passive: false });
    
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [dragging, offset, size, isSmallDevice]);

  // Handle close button mouse up globally (in case mouse is released outside button)
  useEffect(() => {
    if (!isCloseButtonPressed) return;
    
    const handleGlobalUp = () => {
      setIsCloseButtonPressed(false);
      setCloseButtonState('default');
      onClose();
    };
    
    document.addEventListener('mouseup', handleGlobalUp);
    document.addEventListener('touchend', handleGlobalUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalUp);
      document.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isCloseButtonPressed, onClose]);

  // Constrain position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isSmallDevice) {
        // On small devices, keep window at full size minus 30px (15px padding each side)
        const newWidth = window.innerWidth - 30;
        const newHeight = window.innerHeight - 30;
        setSize({ width: newWidth, height: newHeight });
        // Constrain position to viewport (can be dragged to edges)
        const maxX = window.innerWidth - newWidth; // Should be 30
        const maxY = window.innerHeight - newHeight; // Should be 30
        setPosition(prev => ({
          x: Math.max(0, Math.min(prev.x, maxX)),
          y: Math.max(0, Math.min(prev.y, maxY))
        }));
      } else {
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        setPosition(prev => ({
          x: Math.max(0, Math.min(prev.x, maxX)),
          y: Math.max(0, Math.min(prev.y, maxY))
        }));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size, isSmallDevice, setSize]);

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

  const handleWindowTouchStart = (e) => {
    handleWindowMouseDown(e);
  };

  return (
    <div 
      ref={windowRef}
      className="window"
      style={{ top: position.y, left: position.x, width: size.width, height: size.height, zIndex: zIndex }}
      onMouseDown={handleWindowMouseDown}
      onTouchStart={handleWindowTouchStart}
    >
      {/* Window Frame - 9-slice layout */}
      <div className="window-frame">
        {/* Top Row */}
        <div className="frame-top-left"></div>
        <div className="frame-top" onMouseDown={onTopTabMouseDown} onTouchStart={onTopTabTouchStart}>
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
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setCloseButtonState('press');
              setIsCloseButtonPressed(true);
            }}
            onTouchEnd={(e) => {
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
          {title === "About Me - Notepad" && <NotepadMenu content={notepadContent} />}
        </div>
        <div className="frame-right"></div>
        
        {/* Bottom Row - WindowFrameBottom spans all 3 columns */}
        <div className="frame-bottom-left"></div>
        <div className="frame-bottom"></div>
        <div className="frame-bottom-right"></div>
      </div>
      
      {/* Resize Handles - Hidden on small devices */}
      {!isSmallDevice && (
        <>
          <div className="resize-handle resize-handle-s" 
            onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 's'); }}
            onTouchStart={(e) => { e.stopPropagation(); handleResizeTouchStart(e, 's'); }}
          ></div>
          <div className="resize-handle resize-handle-e" 
            onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'e'); }}
            onTouchStart={(e) => { e.stopPropagation(); handleResizeTouchStart(e, 'e'); }}
          ></div>
          <div className="resize-handle resize-handle-w" 
            onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'w'); }}
            onTouchStart={(e) => { e.stopPropagation(); handleResizeTouchStart(e, 'w'); }}
          ></div>
          <div className="resize-handle resize-handle-se" 
            onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'se'); }}
            onTouchStart={(e) => { e.stopPropagation(); handleResizeTouchStart(e, 'se'); }}
          ></div>
          <div className="resize-handle resize-handle-sw" 
            onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'sw'); }}
            onTouchStart={(e) => { e.stopPropagation(); handleResizeTouchStart(e, 'sw'); }}
          ></div>
        </>
      )}
    </div>
  );
}

export default Window;

