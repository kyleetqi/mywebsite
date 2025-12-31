import { useState, useEffect, useCallback, useRef } from 'react';
import './Window.css';
import CloseButton from '../assets/Buttons/CloseButton.png';
import CloseButtonHover from '../assets/Buttons/CloseButtonHover.png';
import CloseButtonPress from '../assets/Buttons/CloseButtonPress.png';
import NotepadIcon from '../assets/Icons/Notepad_WinXP.png';
import CustomScrollbar from './CustomScrollbar';
import FolderToolbar from './FolderToolbar';
import NotepadMenu from './NotepadMenu';
import FolderContent from './FolderContent';
import PaintMenu from './PaintMenu';

const MIN_WIDTH = 290;
const MIN_HEIGHT = 200;

function Window({ 
  onClose, 
  initialPosition = { x: 100, y: 100 }, 
  title = "About Me", 
  titleIcon = NotepadIcon, 
  zIndex = 100, 
  onFocus, 
  notepadContent,
  windowType = 'notepad',
  folderFiles = [],
  onFileOpen,
  selectedFile,
  onFileSelect
}) {
  
  // Calculate initial position and size based on viewport
  const getInitialState = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isSmall = vw <= 480 || vh <= 480;
    
    let width = 600;
    let height = 500;
    
    if (isSmall) {
      width = vw - 16;
      height = vh - 16;
      return { x: 8, y: 8, width, height };
    }
    
    // Clamp size to viewport
    width = Math.min(width, vw - 30);
    height = Math.min(height, vh - 30);
    
    // Clamp position
    const x = Math.max(0, Math.min(initialPosition.x, vw - width));
    const y = Math.max(0, Math.min(initialPosition.y, vh - height));
    
    return { x, y, width, height };
  }, [initialPosition.x, initialPosition.y]);

  const initial = getInitialState();
  const [bounds, setBounds] = useState(initial);
  const [closeButtonState, setCloseButtonState] = useState('default');
  const [isDragging, setIsDragging] = useState(false);
  
  const windowRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const closeButtonPressedRef = useRef(false);
  const contentRef = useRef(null);

  // Clamp bounds to viewport
  const clampBounds = useCallback((b) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.max(MIN_WIDTH, Math.min(b.width, vw));
    const h = Math.max(MIN_HEIGHT, Math.min(b.height, vh));
    const x = Math.max(0, Math.min(b.x, vw - w));
    const y = Math.max(0, Math.min(b.y, vh - h));
    return { x, y, width: w, height: h };
  }, []);

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      setBounds(prev => clampBounds(prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampBounds]);

  // ===== DRAGGING =====
  const onDragStart = (e) => {
    if (e.button !== 0) return; // Only primary button
    if (e.target.closest('.window-close-btn')) return;
    
    e.preventDefault();
    if (onFocus) onFocus();
    
    const el = windowRef.current;
    if (!el) return;
    
    // Capture pointer to receive events even outside element
    el.setPointerCapture(e.pointerId);
    setIsDragging(true);
    
    dragRef.current = {
      pointerId: e.pointerId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: bounds.x,
      startY: bounds.y,
    };
  };

  const onDragMove = (e) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    
    const dx = e.clientX - drag.startMouseX;
    const dy = e.clientY - drag.startMouseY;
    
    let newX = drag.startX + dx;
    let newY = drag.startY + dy;
    
    // Clamp to viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    newX = Math.max(0, Math.min(newX, vw - bounds.width));
    newY = Math.max(0, Math.min(newY, vh - bounds.height));
    
    // Update state directly - React will batch these efficiently
    setBounds(prev => ({ ...prev, x: newX, y: newY }));
  };

  const onDragEnd = (e) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    
    const el = windowRef.current;
    if (el) {
      el.releasePointerCapture(e.pointerId);
    }
    
    setIsDragging(false);
    dragRef.current = null;
  };

  // ===== RESIZING =====
  const onResizeStart = (e, direction) => {
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    if (onFocus) onFocus();
    
    // Capture pointer on the handle element
    e.target.setPointerCapture(e.pointerId);
    
    resizeRef.current = {
      pointerId: e.pointerId,
      direction,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startBounds: { ...bounds },
    };
  };

  const onResizeMove = (e) => {
    const resize = resizeRef.current;
    if (!resize || e.pointerId !== resize.pointerId) return;
    
    const dx = e.clientX - resize.startMouseX;
    const dy = e.clientY - resize.startMouseY;
    const dir = resize.direction;
    const start = resize.startBounds;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    let { x, y, width, height } = start;
    
    // Handle horizontal resizing
    if (dir.includes('e')) {
      width = Math.max(MIN_WIDTH, Math.min(start.width + dx, vw - x));
    }
    if (dir.includes('w')) {
      // Calculate new x position, clamped to left edge (0)
      let newX = Math.max(0, start.x + dx);
      // Calculate new width based on how far x moved from the right edge
      let newWidth = (start.x + start.width) - newX;
      // Enforce minimum width by pushing x back if needed
      if (newWidth < MIN_WIDTH) {
        newWidth = MIN_WIDTH;
        newX = (start.x + start.width) - MIN_WIDTH;
      }
      x = newX;
      width = newWidth;
    }
    
    // Handle vertical resizing
    if (dir.includes('s')) {
      height = Math.max(MIN_HEIGHT, Math.min(start.height + dy, vh - y));
    }
    if (dir.includes('n')) {
      // Calculate new y position, clamped to top edge (0)
      let newY = Math.max(0, start.y + dy);
      // Calculate new height based on how far y moved from the bottom edge
      let newHeight = (start.y + start.height) - newY;
      // Enforce minimum height by pushing y back if needed
      if (newHeight < MIN_HEIGHT) {
        newHeight = MIN_HEIGHT;
        newY = (start.y + start.height) - MIN_HEIGHT;
      }
      y = newY;
      height = newHeight;
    }
    
    setBounds({ x, y, width, height });
  };

  const onResizeEnd = (e) => {
    const resize = resizeRef.current;
    if (!resize || e.pointerId !== resize.pointerId) return;
    
    e.target.releasePointerCapture(e.pointerId);
    resizeRef.current = null;
  };

  // Handle focus when clicking window body
  const onWindowPointerDown = () => {
    if (onFocus) onFocus();
  };

  // Close button handlers
  const onCloseMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    closeButtonPressedRef.current = true;
    setCloseButtonState('press');
  };

  const onCloseMouseUp = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (closeButtonPressedRef.current && closeButtonState === 'press') {
      onClose();
    }
    closeButtonPressedRef.current = false;
    setCloseButtonState('default');
  };

  const onCloseMouseEnter = () => {
    if (closeButtonPressedRef.current) {
      setCloseButtonState('press');
    } else {
      setCloseButtonState('hover');
    }
  };

  const onCloseMouseLeave = () => {
    setCloseButtonState('default');
  };

  // Reset close button state if mouse is released outside the button
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      closeButtonPressedRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div 
      ref={windowRef}
      className={`window${isDragging ? ' dragging' : ''}`}
      style={{ 
        left: bounds.x, 
        top: bounds.y, 
        width: bounds.width, 
        height: bounds.height, 
        zIndex 
      }}
      onPointerDown={onWindowPointerDown}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
    >
      <div className="window-frame">
        {/* Top Row */}
        <div className="frame-top-left"></div>
        <div className="frame-top" onPointerDown={onDragStart}>
          <div className="window-title-container">
            <img src={titleIcon} alt="Icon" className="window-title-icon" />
            <span className="window-title">{title}</span>
          </div>
          <button 
            className="window-close-btn"
            onMouseEnter={onCloseMouseEnter}
            onMouseLeave={onCloseMouseLeave}
            onMouseDown={onCloseMouseDown}
            onMouseUp={onCloseMouseUp}
            onTouchStart={onCloseMouseDown}
            onTouchEnd={onCloseMouseUp}
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
          {/* Toolbar Row - for menu bars and toolbars */}
          {windowType === 'notepad' && (
            <div className="frame-center-toolbar">
              <NotepadMenu />
            </div>
          )}
          {windowType === 'folder' && (
            <div className="frame-center-toolbar">
              <FolderToolbar windowWidth={bounds.width} />
            </div>
          )}
          {windowType === 'paint' && (
            <div className="frame-center-toolbar">
              <PaintMenu />
            </div>
          )}
          {/* Content Row - scrollable content + scrollbar */}
          <div className="frame-center-body">
            <div className="frame-center-content" ref={contentRef}>
              {windowType === 'notepad' && (
                <div className="notepad-text">{notepadContent}</div>
              )}
              {windowType === 'folder' && (
                <FolderContent 
                  files={folderFiles}
                  onFileOpen={onFileOpen}
                  selectedFile={selectedFile}
                  onFileSelect={onFileSelect}
                />
              )}
            </div>
            <CustomScrollbar contentRef={contentRef} onInteraction={onFocus} />
          </div>
        </div>
        <div className="frame-right"></div>
        
        {/* Bottom Row */}
        <div className="frame-bottom-left"></div>
        <div className="frame-bottom"></div>
        <div className="frame-bottom-right"></div>
      </div>
      
      {/* Resize Handles */}
      <div
        className="resize-handle resize-handle-e"
        onPointerDown={(e) => onResizeStart(e, 'e')}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeEnd}
        onPointerCancel={onResizeEnd}
      />
      <div
        className="resize-handle resize-handle-w"
        onPointerDown={(e) => onResizeStart(e, 'w')}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeEnd}
        onPointerCancel={onResizeEnd}
      />
      <div
        className="resize-handle resize-handle-s"
        onPointerDown={(e) => onResizeStart(e, 's')}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeEnd}
        onPointerCancel={onResizeEnd}
      />
      <div
        className="resize-handle resize-handle-se"
        onPointerDown={(e) => onResizeStart(e, 'se')}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeEnd}
        onPointerCancel={onResizeEnd}
      />
      <div
        className="resize-handle resize-handle-sw"
        onPointerDown={(e) => onResizeStart(e, 'sw')}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeEnd}
        onPointerCancel={onResizeEnd}
      />
      <div
        className="resize-handle resize-handle-n"
        onPointerDown={(e) => onResizeStart(e, 'n')}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeEnd}
        onPointerCancel={onResizeEnd}
      />
      <div
        className="resize-handle resize-handle-ne"
        onPointerDown={(e) => onResizeStart(e, 'ne')}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeEnd}
        onPointerCancel={onResizeEnd}
      />
      <div
        className="resize-handle resize-handle-nw"
        onPointerDown={(e) => onResizeStart(e, 'nw')}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeEnd}
        onPointerCancel={onResizeEnd}
      />
    </div>
  );
}

export default Window;
