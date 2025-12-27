import { useState, useEffect, useRef } from 'react';
import './DesktopIcon.css';

function DesktopIcon({ iconSrc, label, onOpen, isSelected, onSelect }) {
  const iconRef = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();
    if (e.detail === 1) {
      // Single click - select
      if (onSelect) {
        onSelect();
      }
    } else if (e.detail === 2) {
      // Double click - open
      onOpen();
    }
  };

  return (
    <div 
      ref={iconRef}
      className={`desktop-icon ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="icon">
        <img src={iconSrc} alt={label} />
      </div>
      <div className="label">{label}</div>
    </div>
  );
}

export default DesktopIcon;
