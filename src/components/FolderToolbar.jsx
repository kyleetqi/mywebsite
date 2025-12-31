import { useState, useEffect, useRef } from 'react';
import './FolderToolbar.css';
import BackIcon from '../assets/Icons/BackIcon.png';
import ForwardIcon from '../assets/Icons/ForwardIcon.png';
import UpIcon from '../assets/Icons/UpIcon.png';
import SearchIcon from '../assets/Icons/SearchIcon.png';
import ViewIcon from '../assets/Icons/ViewIcon.png';
import ViewsIcon from '../assets/Icons/ViewsIcon.png';
import FolderIcon from '../assets/Icons/FolderIcon.png';
import GoButton from '../assets/Buttons/GoButton.png';
import DropdownButton from '../assets/Buttons/DropdownButton.PNG';
import WindowsXPLogo from '../assets/WindowsXP.png';

function FolderToolbar({ windowWidth = 600 }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const menuBarRef = useRef(null);

  const menuItems = ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'];

  // Responsive breakpoints
  const isCompact = windowWidth < 360;
  const isVeryCompact = windowWidth < 310;
  const isUltraCompact = windowWidth < 290;

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

  // Determine address label text
  const getAddressLabel = () => {
    if (isUltraCompact) return null; // Hide completely
    if (isVeryCompact) return 'Addr';
    return 'Address';
  };

  const addressLabel = getAddressLabel();

  return (
    <>
      {/* Row 1: Menu bar */}
      <div className="folder-menu-bar" ref={menuBarRef}>
        <div className="menu-items-left">
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
        <div className="menu-logo-container">
          <img src={WindowsXPLogo} alt="Windows XP" className="menu-logo" draggable={false} />
        </div>
      </div>
      {/* Row 2: Toolbar with icon buttons */}
      <div className={`folder-toolbar ${isCompact ? 'compact' : ''}`}>
        <div className="toolbar-button disabled">
          <img src={BackIcon} alt="Back" className="toolbar-icon" draggable={false} />
          <span className="toolbar-label">Back</span>
        </div>
        <div className="toolbar-button disabled">
          <img src={ForwardIcon} alt="Forward" className="toolbar-icon" draggable={false} />
          <span className="toolbar-label">Forward</span>
        </div>
        <div className="toolbar-button disabled">
          <img src={UpIcon} alt="Up" className="toolbar-icon" draggable={false} />
          <span className="toolbar-label">Up</span>
        </div>
        <div className="toolbar-separator"></div>
        <div className="toolbar-button toolbar-button-collapsible disabled">
          <img src={SearchIcon} alt="Search" className="toolbar-icon" draggable={false} />
          {!isCompact && <span className="toolbar-label">Search</span>}
        </div>
        <div className="toolbar-button toolbar-button-collapsible disabled">
          <img src={ViewIcon} alt="Folders" className="toolbar-icon" draggable={false} />
          {!isCompact && <span className="toolbar-label">Folders</span>}
        </div>
        <div className="toolbar-separator"></div>
        <div className="toolbar-button toolbar-button-collapsible disabled">
          <img src={ViewsIcon} alt="Views" className="toolbar-icon" draggable={false} />
          {!isCompact && <span className="toolbar-label">Views</span>}
        </div>
      </div>
      {/* Row 3: Address bar */}
      <div className="folder-address-bar">
        {addressLabel && <span className="address-label">{addressLabel}</span>}
        <div className="address-input-container">
          <img src={FolderIcon} alt="Folder" className="address-folder-icon" draggable={false} />
          <span className="address-path">C:\Documents and Settings\Kyle Qi\Desktop\Writings</span>
          <button className="address-dropdown-btn">
            <img src={DropdownButton} alt="Dropdown" draggable={false} />
          </button>
        </div>
        <div className="address-go-container">
          <img src={GoButton} alt="Go" className="address-go-icon" draggable={false} />
          {!isCompact && <span className="address-go-label">Go</span>}
        </div>
      </div>
    </>
  );
}

export default FolderToolbar;
