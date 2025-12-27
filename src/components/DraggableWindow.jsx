import { useState } from 'react';
import './DraggableWindow.css';

function DraggableWindow({ title, isOpen, onClose, children }) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  if (!isOpen) return null; // 🔑 window starts closed

  const onMouseDown = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const onMouseUp = () => setDragging(false);

  return (
    <div
      className="draggable-window"
      style={{ top: position.y, left: position.x }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div className="window-header" onMouseDown={onMouseDown}>
        {title}
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="window-content">{children}</div>
    </div>
  );
}

export default DraggableWindow;
