import { useState, useEffect, useRef, useCallback } from 'react';
import './Window.css';
import CloseButton from '../assets/CloseButton.png';
import CloseButtonHover from '../assets/CloseButtonHover.png';
import CloseButtonPress from '../assets/CloseButtonPress.png';
import NotepadIcon from '../assets/Icons/Notepad_WinXP.png';
import NotepadMenu from './NotepadMenu';

function Window({ onClose, initialPosition = { x: 100, y: 100 }, title = "About Me", titleIcon = NotepadIcon, zIndex = 100, onFocus, notepadContent }) {
  const MIN_SIZE = { width: 290, height: 200 };

  // Calculate initial position and size based on viewport size to prevent offscreen windows
  const getInitialState = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const defaultWidth = 600;
    const defaultHeight = 500;
    const padding = 15;
    const minWidth = MIN_SIZE.width;
    const minHeight = MIN_SIZE.height;
    
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
    
    let position;
    if (isSmall) {
      // Small device: full screen minus 30px
      windowWidth = viewportWidth - 30;
      windowHeight = viewportHeight - 30;
      position = { x: 15, y: 15 };
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
  const [size, setSize] = useState(initialState.size);
  const [isResizing, setIsResizing] = useState(false);
  const windowRef = useRef(null);

  // Track previous device state to detect transitions
  const prevDeviceStateRef = useRef({ isSmall: false });
  
  const clampToViewport = useCallback((nextPosition, nextSize) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const clampedWidth = Math.min(nextSize.width, viewportWidth);
    const clampedHeight = Math.min(nextSize.height, viewportHeight);

    const maxX = Math.max(0, viewportWidth - clampedWidth);
    const maxY = Math.max(0, viewportHeight - clampedHeight);

    return {
      position: {
        x: Math.max(0, Math.min(nextPosition.x, maxX)),
        y: Math.max(0, Math.min(nextPosition.y, maxY)),
      },
      size: { width: clampedWidth, height: clampedHeight },
    };
  }, []);

  // Detect device size (small or large)
  useEffect(() => {
    const checkDeviceSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Small device: <= 480px
      const isSmall = viewportWidth <= 480 || viewportHeight <= 480;
      const wasSmall = prevDeviceStateRef.current.isSmall;
      
      setIsSmallDevice(isSmall);
      
      // Only adjust size/position when transitioning to small device or on initial load
      // Don't auto-resize if user is currently resizing manually
      if (isSmall && !wasSmall && !isResizing) {
        // Transitioning to small device - set window to full screen minus 30px
        const newWidth = viewportWidth - 30;
        const newHeight = viewportHeight - 30;
        const { position: clampedPos, size: clampedSize } = clampToViewport(
          { x: 15, y: 15 },
          { width: newWidth, height: newHeight }
        );
        setSize(clampedSize);
        setPosition(clampedPos);
      } else if (!isSmall && !isResizing) {
        const { position: clampedPos, size: clampedSize } = clampToViewport(position, size);
        setSize(clampedSize);
        setPosition(clampedPos);
      }
      
      prevDeviceStateRef.current = { isSmall };
    };
    
    checkDeviceSize();
    window.addEventListener('resize', checkDeviceSize);
    return () => window.removeEventListener('resize', checkDeviceSize);
  }, [clampToViewport, isResizing, position, size]);

  // --- Resizing (from scratch) ---
  const resizeRef = useRef({
    active: false,
    pointerId: null,
    direction: null, // 'w' | 'e' | 's' | 'sw' | 'se'
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
    startRight: 0,
    startBottom: 0,
  });

  const onResizePointerDown = (e, direction) => {
    // Only respond to primary button for mouse; touch/pen have button=0 as well
    if (typeof e.button === 'number' && e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    if (onFocus) onFocus();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minWidth = Math.min(MIN_SIZE.width, viewportWidth);
    const minHeight = Math.min(MIN_SIZE.height, viewportHeight);

    // Use DOM rect as source of truth for edges
    const rect = windowRef.current?.getBoundingClientRect();
    const startLeft = rect ? rect.left : position.x;
    const startTop = rect ? rect.top : position.y;
    const startRight = rect ? rect.left + rect.width : position.x + size.width;
    const startBottom = rect ? rect.top + rect.height : position.y + size.height;

    // If we're already smaller than minimum due to tiny viewport, normalize edges
    const normalizedRight = Math.max(startRight, startLeft + minWidth);
    const normalizedBottom = Math.max(startBottom, startTop + minHeight);

    resizeRef.current = {
      active: true,
      pointerId: e.pointerId,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startLeft,
      startTop,
      startRight: normalizedRight,
      startBottom: normalizedBottom,
    };

    setIsResizing(true);

    // Keeps pointer events even if cursor leaves the handle
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (e) => {
      const r = resizeRef.current;
      if (!r.active) return;
      if (r.pointerId != null && e.pointerId !== r.pointerId) return;

      e.preventDefault();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const minWidth = Math.min(MIN_SIZE.width, viewportWidth);
      const minHeight = Math.min(MIN_SIZE.height, viewportHeight);

      const dx = e.clientX - r.startX;
      const dy = e.clientY - r.startY;

      let left = r.startLeft;
      let top = r.startTop;
      let right = r.startRight;
      let bottom = r.startBottom;

      // Horizontal edges
      if (r.direction.includes('e')) {
        right = Math.max(left + minWidth, Math.min(r.startRight + dx, viewportWidth));
      }
      if (r.direction.includes('w')) {
        left = Math.min(
          Math.max(r.startLeft + dx, 0),
          r.startRight - minWidth
        );
      }

      // Vertical edges (only bottom resizing requested)
      if (r.direction.includes('s')) {
        bottom = Math.max(top + minHeight, Math.min(r.startBottom + dy, viewportHeight));
      }

      const nextPosition = { x: left, y: top };
      const nextSize = { width: right - left, height: bottom - top };
      const clamped = clampToViewport(nextPosition, nextSize);

      setPosition(clamped.position);
      setSize(clamped.size);
    };

    const handleEnd = (e) => {
      const r = resizeRef.current;
      if (!r.active) return;
      if (r.pointerId != null && e.pointerId !== r.pointerId) return;

      resizeRef.current.active = false;
      resizeRef.current.pointerId = null;
      resizeRef.current.direction = null;
      setIsResizing(false);
    };

    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', handleEnd, { passive: true });
    window.addEventListener('pointercancel', handleEnd, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };
  }, [MIN_SIZE.height, MIN_SIZE.width, clampToViewport, isResizing]);

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
      const clamped = clampToViewport(position, size);
      setPosition(clamped.position);
      setSize(clamped.size);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampToViewport, position, size]);

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
      
      {/* Resize Handles */}
      <div
        className="resize-handle resize-handle-w"
        onPointerDown={(e) => onResizePointerDown(e, 'w')}
      ></div>
      <div
        className="resize-handle resize-handle-e"
        onPointerDown={(e) => onResizePointerDown(e, 'e')}
      ></div>
      <div
        className="resize-handle resize-handle-s"
        onPointerDown={(e) => onResizePointerDown(e, 's')}
      ></div>
      <div
        className="resize-handle resize-handle-sw"
        onPointerDown={(e) => onResizePointerDown(e, 'sw')}
      ></div>
      <div
        className="resize-handle resize-handle-se"
        onPointerDown={(e) => onResizePointerDown(e, 'se')}
      ></div>
    </div>
  );
}

export default Window;

