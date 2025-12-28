import { useState, useEffect, useRef } from 'react';
import './Window.css';
import { useWindowResize } from '../hooks/useWindowResize';
import CloseButton from '../assets/CloseButton.png';
import CloseButtonHover from '../assets/CloseButtonHover.png';
import CloseButtonPress from '../assets/CloseButtonPress.png';
import NotepadIcon from '../assets/Icons/Notepad_WinXP.png';
import NotepadMenu from './NotepadMenu';

function Window({ onClose, initialPosition = { x: 100, y: 100 }, title = "About Me", titleIcon = NotepadIcon, zIndex = 100, onFocus, notepadContent }) {
  // Calculate initial position and size based on viewport size to prevent offscreen windows
  const getInitialState = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const defaultWidth = 600;
    const defaultHeight = 500;
    const padding = 15;
    const minWidth = 290;
    const minHeight = 200;
    
    // Check if small device
    const isSmall = viewportWidth <= 480 || viewportHeight <= 480;
    
    // Calculate actual window size (may need to shrink if viewport is too small)
    let windowWidth = defaultWidth;
    let windowHeight = defaultHeight;
    
    // If window is larger than viewport (minus padding), shrink it
    if (windowWidth > viewportWidth - (padding * 2)) {
      windowWidth = Math.max(minWidth, viewportWidth - (padding * 2));
    }
    if (windowHeight > viewportHeight - (padding * 2)) {
      windowHeight = Math.max(minHeight, viewportHeight - (padding * 2));
    }
    
    // Check if medium device (larger than small threshold but smaller than default + padding)
    const isMedium = !isSmall && (viewportWidth < defaultWidth + (padding * 2) || viewportHeight < defaultHeight + (padding * 2));
    
    let position;
    if (isSmall) {
      // Small device: full screen minus 30px
      windowWidth = viewportWidth - 30;
      windowHeight = viewportHeight - 30;
      position = { x: 15, y: 15 };
    } else if (isMedium) {
      // Center with 15px padding on medium devices
      const centeredX = Math.max(padding, (viewportWidth - windowWidth) / 2);
      const centeredY = Math.max(padding, (viewportHeight - windowHeight) / 2);
      position = { x: centeredX, y: centeredY };
    } else {
      // For large devices, use provided initialPosition but ensure it's on screen
      const maxX = Math.max(0, viewportWidth - windowWidth);
      const maxY = Math.max(0, viewportHeight - windowHeight);
      position = {
        x: Math.max(0, Math.min(initialPosition.x, maxX)),
        y: Math.max(0, Math.min(initialPosition.y, maxY))
      };
    }
    
    return { position, size: { width: windowWidth, height: windowHeight } };
  };
  
  const initialState = getInitialState();
  const [position, setPosition] = useState(initialState.position);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [closeButtonState, setCloseButtonState] = useState('default'); // 'default', 'hover', 'press'
  const [isCloseButtonPressed, setIsCloseButtonPressed] = useState(false);
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const [isMediumDevice, setIsMediumDevice] = useState(false);
  const resizeStartPosition = useRef(initialState.position);
  const resizeStartSize = useRef(initialState.size);
  const { size, setSize, handleMouseDown: handleResizeMouseDownBase, windowRef, positionDelta, isResizing, resizeDirection } = useWindowResize(initialState.size, { width: 290, height: 200 });

  // Track previous device state to detect transitions
  const prevDeviceStateRef = useRef({ isSmall: false, isMedium: false });
  
  // Detect device size (small, medium, or large)
  useEffect(() => {
    const checkDeviceSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const defaultWidth = 600;
      const defaultHeight = 500;
      const padding = 15;
      
      // Small device: <= 480px
      const isSmall = viewportWidth <= 480 || viewportHeight <= 480;
      const wasSmall = prevDeviceStateRef.current.isSmall;
      
      // Medium device: larger than small but smaller than default window size + padding
      // Upper bound: default window size (600x500) + 30px padding = 630x530
      const isMedium = !isSmall && (viewportWidth < defaultWidth + (padding * 2) || viewportHeight < defaultHeight + (padding * 2));
      const wasMedium = prevDeviceStateRef.current.isMedium;
      
      setIsSmallDevice(isSmall);
      setIsMediumDevice(isMedium);
      
      // Only adjust size/position when transitioning to small device or on initial load
      if (isSmall && !wasSmall) {
        // Transitioning to small device - set window to full screen minus 30px
        const newWidth = viewportWidth - 30;
        const newHeight = viewportHeight - 30;
        setSize({ width: newWidth, height: newHeight });
        // Center the window with 15px padding
        setPosition({ x: 15, y: 15 });
      } else if (isSmall && wasSmall) {
        // Already small device, just update size on resize
        const newWidth = viewportWidth - 30;
        const newHeight = viewportHeight - 30;
        setSize({ width: newWidth, height: newHeight });
        // Don't reset position - allow dragging
      } else if (isMedium && !wasMedium && !wasSmall) {
        // Transitioning to medium device from large - ensure window fits and center it
        const minWidth = 290;
        const minHeight = 200;
        let newWidth = size.width;
        let newHeight = size.height;
        
        // Shrink window if it's too large for viewport
        if (newWidth > viewportWidth - (padding * 2)) {
          newWidth = Math.max(minWidth, viewportWidth - (padding * 2));
        }
        if (newHeight > viewportHeight - (padding * 2)) {
          newHeight = Math.max(minHeight, viewportHeight - (padding * 2));
        }
        
        if (newWidth !== size.width || newHeight !== size.height) {
          setSize({ width: newWidth, height: newHeight });
        }
        
        const centeredX = Math.max(padding, (viewportWidth - newWidth) / 2);
        const centeredY = Math.max(padding, (viewportHeight - newHeight) / 2);
        setPosition({ x: centeredX, y: centeredY });
      } else if (!isSmall && !isResizing) {
        // Only shrink window if it actually extends beyond viewport (based on position + size)
        // Don't apply arbitrary padding - let user resize to edges if they want
        const minWidth = 290;
        const minHeight = 200;
        
        // Get current position for accurate bounds checking
        const currentX = position.x;
        const currentY = position.y;
        
        // Check if right/bottom edges extend beyond viewport
        const rightEdge = currentX + size.width;
        const bottomEdge = currentY + size.height;
        
        let newWidth = size.width;
        let newHeight = size.height;
        let needsUpdate = false;
        
        if (rightEdge > viewportWidth) {
          newWidth = Math.max(minWidth, viewportWidth - currentX);
          needsUpdate = true;
        }
        if (bottomEdge > viewportHeight) {
          newHeight = Math.max(minHeight, viewportHeight - currentY);
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          setSize({ width: newWidth, height: newHeight });
        }
      }
      // Don't auto-center during resize if already medium - let user drag/resize normally
      
      prevDeviceStateRef.current = { isSmall, isMedium };
    };
    
    checkDeviceSize();
    window.addEventListener('resize', checkDeviceSize);
    return () => window.removeEventListener('resize', checkDeviceSize);
  }, [setSize, size, isResizing, position]);

  // Wrap resize handler to capture position and size when resize starts
  const handleResizeMouseDown = (e, direction) => {
    // Don't allow resizing on small devices
    if (isSmallDevice) return;
    
    // Capture position and size synchronously before resize starts
    resizeStartPosition.current = { x: position.x, y: position.y };
    resizeStartSize.current = { width: size.width, height: size.height };
    handleResizeMouseDownBase(e, direction);
  };

  const handleResizeTouchStart = (e, direction) => {
    handleResizeMouseDown(e, direction);
  };

  // Track if we were resizing in the previous render to detect when resize ends
  const wasResizingRef = useRef(false);
  // Store the last resize direction so we can use it when resize ends
  const lastResizeDirectionRef = useRef(null);
  
  // Update last resize direction during resize
  if (isResizing && resizeDirection) {
    lastResizeDirectionRef.current = resizeDirection;
  }
  
  // Calculate effective position during resize directly from size change
  // This ensures position and size are always perfectly in sync (derived from same source)
  // For left/top resize, position = startPosition + (startSize - currentSize)
  const calculateEffectivePosition = (direction) => {
    let x = resizeStartPosition.current.x;
    let y = resizeStartPosition.current.y;
    
    if (direction && direction.includes('w')) {
      // Left resize: right edge stays fixed, so position moves by width change
      x = resizeStartPosition.current.x + (resizeStartSize.current.width - size.width);
    }
    if (direction && direction.includes('n')) {
      // Top resize: bottom edge stays fixed, so position moves by height change
      y = resizeStartPosition.current.y + (resizeStartSize.current.height - size.height);
    }
    
    return { x, y };
  };
  
  const effectivePosition = isResizing
    ? calculateEffectivePosition(resizeDirection)
    : (wasResizingRef.current && !isResizing)
      ? calculateEffectivePosition(lastResizeDirectionRef.current)
      : position;
  
  // Sync final position to state when resize ends
  useEffect(() => {
    if (wasResizingRef.current && !isResizing) {
      // Resize just ended - commit the final position
      const finalPosition = calculateEffectivePosition(lastResizeDirectionRef.current);
      setPosition(finalPosition);
      // Reset the ref for next resize
      lastResizeDirectionRef.current = null;
    }
    wasResizingRef.current = isResizing;
  }, [isResizing, size]);

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
        // For medium and large devices, just constrain to viewport (don't auto-center during resize)
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
      style={{ top: effectivePosition.y, left: effectivePosition.x, width: size.width, height: size.height, zIndex: zIndex }}
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

