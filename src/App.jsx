import './App.css';
import DesktopIcon from './components/DesktopIcon';
import Window from './components/Window';
import { useState, useEffect, useRef } from 'react';
import AboutMeIcon from './assets/Icons/AboutMeIcon.png';
import PDFIcon from './assets/Icons/PDFIcon.png';
import NotepadIcon from './assets/Icons/Notepad_WinXP.png';
import FolderIcon from './assets/Icons/FolderIcon.png';
import FileIcon from './assets/Icons/FileIcon.png';
import MailIcon from './assets/Icons/MailIcon.png';
import MessengerIcon from './assets/Icons/MessengerIcon.png';
import TerminalIcon from './assets/Icons/TerminalIcon.png';

function App() {
  const [isAboutMeWindowOpen, setIsAboutMeWindowOpen] = useState(false);
  const [isExperienceWindowOpen, setIsExperienceWindowOpen] = useState(false);
  const [isWritingsWindowOpen, setIsWritingsWindowOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const maxZIndexRef = useRef(100);
  const [aboutMeZIndex, setAboutMeZIndex] = useState(100);
  const [experienceZIndex, setExperienceZIndex] = useState(100);
  const [writingsZIndex, setWritingsZIndex] = useState(100);

  const bringToFront = (windowType) => {
    maxZIndexRef.current += 1;
    if (windowType === 'aboutMe') {
      setAboutMeZIndex(maxZIndexRef.current);
    } else if (windowType === 'experience') {
      setExperienceZIndex(maxZIndexRef.current);
    } else if (windowType === 'writings') {
      setWritingsZIndex(maxZIndexRef.current);
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
        {/* First Column */}
        <div className="desktop-icons-column">
        <DesktopIcon 
          iconSrc={AboutMeIcon} 
          label="About Me" 
            onOpen={() => {
              setSelectedIcon(null);
              setIsAboutMeWindowOpen(true);
              bringToFront('aboutMe');
            }}
          isSelected={selectedIcon === 'aboutMe'}
          onSelect={() => setSelectedIcon('aboutMe')}
        />
          <DesktopIcon 
            iconSrc={PDFIcon} 
            label="Experience" 
            onOpen={() => {
              setSelectedIcon(null);
              setIsExperienceWindowOpen(true);
              bringToFront('experience');
            }}
            isSelected={selectedIcon === 'experience'}
            onSelect={() => setSelectedIcon('experience')}
          />
          <DesktopIcon 
            iconSrc={FolderIcon} 
            label="Writings" 
            onOpen={() => {
              setSelectedIcon(null);
              setIsWritingsWindowOpen(true);
              bringToFront('writings');
            }}
            isSelected={selectedIcon === 'writings'}
            onSelect={() => setSelectedIcon('writings')}
          />
        </div>
        
        {/* Second Column - External Links */}
        <div className="desktop-icons-column">
          <DesktopIcon 
            iconSrc={MessengerIcon} 
            label="LinkedIn" 
            href="https://www.linkedin.com/in/kyleqi-"
            isSelected={selectedIcon === 'linkedin'}
            onSelect={() => setSelectedIcon('linkedin')}
          />
          <DesktopIcon 
            iconSrc={TerminalIcon} 
            label="GitHub" 
            href="https://www.github.com/kyle-qi"
            isSelected={selectedIcon === 'github'}
            onSelect={() => setSelectedIcon('github')}
          />
          <DesktopIcon 
            iconSrc={MailIcon} 
            label="Email" 
            href="mailto:contact@kyleqi.com"
            isSelected={selectedIcon === 'email'}
            onSelect={() => setSelectedIcon('email')}
          />
        </div>
      </div>

      {/* Windows */}
      {isAboutMeWindowOpen && (
        <Window 
          onClose={() => setIsAboutMeWindowOpen(false)}
          initialPosition={{ x: 100, y: 100 }}
          title="About Me - Notepad"
          titleIcon={NotepadIcon}
          zIndex={aboutMeZIndex}
          onFocus={() => bringToFront('aboutMe')}
          notepadContent={`Welcome to my personal website! This is a Windows XP-themed portfolio where you can explore my work and experience.

I'm a mechatronics engineer passionate about robotics, automation, and creating innovative solutions that bridge the gap between hardware and software.

Feel free to explore the different sections using the desktop icons. Each window contains information about different aspects of my background and interests.`}
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
      {isWritingsWindowOpen && (
        <Window 
          onClose={() => setIsWritingsWindowOpen(false)}
          initialPosition={{ x: 150, y: 150 }}
          title="Writings"
          titleIcon={FolderIcon}
          zIndex={writingsZIndex}
          onFocus={() => bringToFront('writings')}
        />
      )}
    </div>
  );
}

export default App;
