import './App.css';
import DesktopIcon from './components/DesktopIcon';
import Window from './components/Window';
import { useState, useEffect } from 'react';
import AboutMeIcon from './assets/AboutMeIcon.png';

function App() {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);

  // Click-away logic for deselecting icons
  useEffect(() => {
    const handleMouseDown = (e) => {
      const isClickOnIcon = e.target.closest('.desktop-icon');
      const isClickOnWindow = e.target.closest('.window');
      const isClickOnDesktopIcons = e.target.closest('.desktop-icons');
      
      // Deselect icon if clicking anywhere except on the icon itself
      if (!isClickOnIcon) {
        setSelectedIcon(null);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  return (
    <div className="desktop">
      {/* Desktop Icons */}
      <div className="desktop-icons">
        <DesktopIcon 
          iconSrc={AboutMeIcon} 
          label="About Me" 
          onOpen={() => setIsWindowOpen(true)}
          isSelected={selectedIcon === 'aboutMe'}
          onSelect={() => setSelectedIcon('aboutMe')}
        />
      </div>

      {/* Window */}
      {isWindowOpen && (
        <Window 
          onClose={() => setIsWindowOpen(false)}
          initialPosition={{ x: 100, y: 100 }}
        />
      )}
    </div>
  );
}

export default App;
