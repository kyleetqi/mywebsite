import './App.css';
import DesktopIcon from './components/DesktopIcon';
import Window from './components/Window';
import { useState, useEffect, useRef } from 'react';
import AboutMeIcon from './assets/Icons/AboutMeIcon.png';
import PDFIcon from './assets/Icons/PDFIcon.png';
import NotepadIcon from './assets/Icons/Notepad_WinXP.png';

function App() {
  const [isAboutMeWindowOpen, setIsAboutMeWindowOpen] = useState(false);
  const [isExperienceWindowOpen, setIsExperienceWindowOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const maxZIndexRef = useRef(100);
  const [aboutMeZIndex, setAboutMeZIndex] = useState(100);
  const [experienceZIndex, setExperienceZIndex] = useState(100);

  const bringToFront = (windowType) => {
    maxZIndexRef.current += 1;
    if (windowType === 'aboutMe') {
      setAboutMeZIndex(maxZIndexRef.current);
    } else if (windowType === 'experience') {
      setExperienceZIndex(maxZIndexRef.current);
    }
  };

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
          onOpen={() => {
            setSelectedIcon(null); // Deselect when opening window
            setIsAboutMeWindowOpen(true);
            bringToFront('aboutMe'); // Bring to front when opening
          }}
          isSelected={selectedIcon === 'aboutMe'}
          onSelect={() => setSelectedIcon('aboutMe')}
        />
        <DesktopIcon 
          iconSrc={PDFIcon} 
          label="Experience" 
          onOpen={() => {
            setSelectedIcon(null); // Deselect when opening window
            setIsExperienceWindowOpen(true);
            bringToFront('experience'); // Bring to front when opening
          }}
          isSelected={selectedIcon === 'experience'}
          onSelect={() => setSelectedIcon('experience')}
        />
      </div>

      {/* Windows */}
      {isAboutMeWindowOpen && (
        <Window 
          onClose={() => setIsAboutMeWindowOpen(false)}
          initialPosition={{ x: 100, y: 100 }}
          title="About Me"
          titleIcon={NotepadIcon}
          zIndex={aboutMeZIndex}
          onFocus={() => bringToFront('aboutMe')}
        />
      )}
      {isExperienceWindowOpen && (
        <Window 
          onClose={() => setIsExperienceWindowOpen(false)}
          initialPosition={{ x: 250, y: 100 }}
          title="Experience"
          titleIcon={PDFIcon}
          zIndex={experienceZIndex}
          onFocus={() => bringToFront('experience')}
        />
      )}
    </div>
  );
}

export default App;
