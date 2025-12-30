import { useState, useEffect, useRef } from 'react';
import './DesktopIcon.css';

function DesktopIcon({ iconSrc, label, onOpen, isSelected, onSelect, href }) {
  const iconRef = useRef(null);
  const lastTapRef = useRef(0);
  const tapTimeoutRef = useRef(null);
  const touchHandledRef = useRef(false);

  const handleOpen = () => {
    if (href) {
      // Open URL in new tab
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (onOpen) {
      onOpen();
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    
    // Ignore click events that were already handled by touch
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      return;
    }
    
    if (e.detail === 1) {
      // Single click - select
      if (onSelect) {
        onSelect();
      }
    } else if (e.detail === 2) {
      // Double click - open
      handleOpen();
    }
  };

  const handleTouchStart = (e) => {
    e.stopPropagation();
    touchHandledRef.current = true;
    
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      clearTimeout(tapTimeoutRef.current);
      lastTapRef.current = 0;
      handleOpen();
    } else {
      // Single tap - select
      if (onSelect) {
        onSelect();
      }
      // Set timeout to track double tap
      tapTimeoutRef.current = setTimeout(() => {
        lastTapRef.current = 0;
      }, 300);
      lastTapRef.current = currentTime;
    }
  };

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={iconRef}
      className={`desktop-icon ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
    >
      <div className="icon">
        <img src={iconSrc} alt={label} />
      </div>
      <div className="label">{label}</div>
    </div>
  );
}

export default DesktopIcon;
