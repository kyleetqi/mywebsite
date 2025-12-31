import './App.css';
import DesktopIcon from './components/DesktopIcon';
import Window from './components/Window';
import { useState, useEffect, useRef, useCallback } from 'react';
import AboutMeIcon from './assets/Icons/AboutMeIcon.png';
import PDFIcon from './assets/Icons/PDFIcon.png';
import NotepadIcon from './assets/Icons/Notepad_WinXP.png';
import FolderIcon from './assets/Icons/FolderIcon.png';
import MailIcon from './assets/Icons/MailIcon.png';
import MessengerIcon from './assets/Icons/MessengerIcon.png';
import TerminalIcon from './assets/Icons/TerminalIcon.png';
import { writingsFiles } from './data/filesData';

function App() {
  // Window management - using a map of window IDs to window data
  const [windows, setWindows] = useState({});
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedFolderFile, setSelectedFolderFile] = useState(null);
  const maxZIndexRef = useRef(100);

  // Generate unique window ID
  const generateWindowId = useCallback(() => {
    return `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Open a new window
  const openWindow = useCallback((windowConfig) => {
    const id = generateWindowId();
    maxZIndexRef.current += 1;
    
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...windowConfig,
        id,
        zIndex: maxZIndexRef.current
      }
    }));
    
    return id;
  }, [generateWindowId]);

  // Close a window
  const closeWindow = useCallback((windowId) => {
    setWindows(prev => {
      const newWindows = { ...prev };
      delete newWindows[windowId];
      return newWindows;
    });
  }, []);

  // Bring window to front
  const bringToFront = useCallback((windowId) => {
    maxZIndexRef.current += 1;
    setWindows(prev => ({
      ...prev,
      [windowId]: {
        ...prev[windowId],
        zIndex: maxZIndexRef.current
      }
    }));
  }, []);

  // Open About Me notepad
  const openAboutMe = useCallback(() => {
    setSelectedIcon(null);
    openWindow({
      type: 'notepad',
      title: 'About Me - Notepad',
      titleIcon: NotepadIcon,
      initialPosition: { x: 100, y: 100 },
      content: `Welcome to my personal website! This is a Windows XP-themed portfolio where you can explore my work and experience.

I'm a mechatronics engineer passionate about robotics, automation, and creating innovative solutions that bridge the gap between hardware and software.

Feel free to explore the different sections using the desktop icons. Each window contains information about different aspects of my background and interests.`
    });
  }, [openWindow]);

  // Open Experience window
  const openExperience = useCallback(() => {
    setSelectedIcon(null);
    openWindow({
      type: 'other',
      title: 'Experience',
      titleIcon: PDFIcon,
      initialPosition: { x: 250, y: 100 },
      content: ''
    });
  }, [openWindow]);

  // Open Writings folder
  const openWritings = useCallback(() => {
    setSelectedIcon(null);
    openWindow({
      type: 'folder',
      title: 'Writings',
      titleIcon: FolderIcon,
      initialPosition: { x: 150, y: 150 },
      files: writingsFiles
    });
  }, [openWindow]);

  // Open a file from the folder as a notepad window
  const openFileFromFolder = useCallback((file) => {
    setSelectedFolderFile(null);
    openWindow({
      type: 'notepad',
      title: `${file.name} - Notepad`,
      titleIcon: NotepadIcon,
      initialPosition: { 
        x: 180 + Math.random() * 50, 
        y: 120 + Math.random() * 50 
      },
      content: file.content
    });
  }, [openWindow]);

  // Click-away logic for deselecting icons
  useEffect(() => {
    const handlePointerDown = (e) => {
      const isClickOnIcon = e.target.closest('.desktop-icon');
      const isClickOnFolderIcon = e.target.closest('.folder-icon');
      
      // Deselect desktop icon if clicking anywhere except on the icon itself
      if (!isClickOnIcon) {
        setSelectedIcon(null);
      }
      
      // Deselect folder file if clicking outside folder icons
      if (!isClickOnFolderIcon) {
        setSelectedFolderFile(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
    };
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
            onOpen={openAboutMe}
            isSelected={selectedIcon === 'aboutMe'}
            onSelect={() => setSelectedIcon('aboutMe')}
          />
          <DesktopIcon 
            iconSrc={PDFIcon} 
            label="Experience" 
            onOpen={openExperience}
            isSelected={selectedIcon === 'experience'}
            onSelect={() => setSelectedIcon('experience')}
          />
          <DesktopIcon 
            iconSrc={FolderIcon} 
            label="Writings" 
            onOpen={openWritings}
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

      {/* Windows - rendered from the windows state */}
      {Object.values(windows).map((win) => (
        <Window
          key={win.id}
          onClose={() => closeWindow(win.id)}
          initialPosition={win.initialPosition}
          title={win.title}
          titleIcon={win.titleIcon}
          zIndex={win.zIndex}
          onFocus={() => {
            setSelectedIcon(null);
            bringToFront(win.id);
          }}
          windowType={win.type}
          notepadContent={win.content}
          folderFiles={win.files || []}
          onFileOpen={openFileFromFolder}
          selectedFile={selectedFolderFile}
          onFileSelect={setSelectedFolderFile}
        />
      ))}
    </div>
  );
}

export default App;
