import { useState, useEffect, useRef } from 'react';
import './PaintMenu.css';

function PaintMenu() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const menuBarRef = useRef(null);

  const menuItems = ['File', 'Edit', 'View', 'Image', 'Colors', 'Help'];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuBarRef.current && !menuBarRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (item) => {
    setActiveMenu(activeMenu === item ? null : item);
  };

  const handleMenuHover = (item) => {
    // If a menu is already open, switch to the hovered menu (XP behavior)
    if (activeMenu !== null) {
      setActiveMenu(item);
    }
  };

  return (
    <div className="paint-menu-bar" ref={menuBarRef}>
      {menuItems.map((item) => (
        <div
          key={item}
          className={`menu-item ${activeMenu === item ? 'active' : ''}`}
          onClick={() => handleMenuClick(item)}
          onMouseEnter={() => handleMenuHover(item)}
        >
          {item}
          {activeMenu === item && (
            <div className="dropdown-menu">
              <div 
                className={`dropdown-item ${hoveredItem === 'item1' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem('item1')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                This Button
              </div>
              <div 
                className={`dropdown-item ${hoveredItem === 'item2' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem('item2')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                Is Just
              </div>
              <div 
                className={`dropdown-item ${hoveredItem === 'item3' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem('item3')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                Cosmetic!
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PaintMenu;

