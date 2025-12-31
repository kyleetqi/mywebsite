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
import PaintIcon from './assets/Icons/PaintIcon.png';
import { writingsFiles, aboutMeContent } from './data/filesData';

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

  // Find existing window by windowKey
  const findWindowByKey = useCallback((windowKey) => {
    return Object.values(windows).find(win => win.windowKey === windowKey);
  }, [windows]);

  // Open a new window or bring existing to front
  const openWindow = useCallback((windowConfig) => {
    // If windowKey is provided, check if window already exists
    if (windowConfig.windowKey) {
      const existingWindow = Object.values(windows).find(
        win => win.windowKey === windowConfig.windowKey
      );
      
      if (existingWindow) {
        // Bring existing window to front
        maxZIndexRef.current += 1;
        setWindows(prev => ({
          ...prev,
          [existingWindow.id]: {
            ...prev[existingWindow.id],
            zIndex: maxZIndexRef.current
          }
        }));
        return existingWindow.id;
      }
    }

    // Create new window
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
  }, [generateWindowId, windows]);

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
      windowKey: 'aboutMe',
      type: 'notepad',
      title: 'About Me - Notepad',
      titleIcon: NotepadIcon,
      initialPosition: { x: 100, y: 100 },
      content: aboutMeContent
    });
  }, [openWindow]);

  // Open Experience window
  const openExperience = useCallback(() => {
    setSelectedIcon(null);
    openWindow({
      windowKey: 'experience',
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
      windowKey: 'writings',
      type: 'folder',
      title: 'Writings',
      titleIcon: FolderIcon,
      initialPosition: { x: 150, y: 150 },
      files: writingsFiles
    });
  }, [openWindow]);

  // Open Paint
  const openPaint = useCallback(() => {
    setSelectedIcon(null);
    openWindow({
      windowKey: 'paint',
      type: 'paint',
      title: 'Send Me a Drawing - Paint',
      titleIcon: PaintIcon,
      initialPosition: { x: 120, y: 80 },
      content: ''
    });
  }, [openWindow]);

  // Open a file from the folder as a notepad window
  const openFileFromFolder = useCallback((file) => {
    setSelectedFolderFile(null);
    openWindow({
      windowKey: `file-${file.id}`,
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
          <DesktopIcon 
            iconSrc={PaintIcon} 
            label="Paint" 
            onOpen={openPaint}
            isSelected={selectedIcon === 'paint'}
            onSelect={() => setSelectedIcon('paint')}
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
