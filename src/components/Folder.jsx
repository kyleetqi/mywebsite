import { useState, useEffect } from 'react';
import './Folder.css';
import Notepad from './Notepad';
import { useWindowResize } from '../hooks/useWindowResize';
import FileIcon from '../assets/FileIcon.png';

const txtFiles = [
  {
    name: 'thoughts_on_ai.txt',
    content: `Artificial intelligence represents one of the most significant technological shifts of our time. As we stand at the precipice of this transformation, it's crucial to consider not just what AI can do, but what it means for human purpose and creativity.

The integration of AI into our daily lives raises fundamental questions about the nature of work, creativity, and human value. While some fear obsolescence, I believe we're entering an era where human-AI collaboration will unlock unprecedented possibilities.

The key is to view AI not as a replacement, but as a tool that amplifies our unique human capabilities - our creativity, empathy, and ability to navigate complex social and ethical landscapes.`
  },
  {
    name: 'robotics_notes.txt',
    content: `Robotics has always fascinated me because it represents the intersection of mechanical engineering, electronics, and software - three domains that must work in perfect harmony.

The challenge of creating machines that can interact with the physical world in meaningful ways requires a deep understanding of control systems, sensor fusion, and real-time decision making. Each project teaches me something new about the delicate balance between precision and adaptability.

From autonomous navigation to human-robot interaction, the field continues to evolve at a rapid pace. The future of robotics lies not just in making machines more capable, but in making them more intuitive and accessible to everyone.`
  },
  {
    name: 'learning_journey.txt',
    content: `My journey in mechatronics has been one of continuous learning and discovery. Starting with simple circuits and motors, I've progressed to complex systems involving multiple sensors, actuators, and control algorithms.

The most valuable lesson I've learned is that failure is not the opposite of success - it's an integral part of the learning process. Each broken component, each bug in the code, each miscalculation teaches you something that no textbook ever could.

The field demands both theoretical knowledge and practical skills. You need to understand the mathematics behind control theory, but you also need to know how to solder a connection or debug a communication protocol. This combination of theory and practice is what makes mechatronics so rewarding.`
  },
  {
    name: 'future_visions.txt',
    content: `Looking ahead, I see a world where automation and human creativity work together seamlessly. The factories of the future won't just be automated - they'll be intelligent, adaptive, and responsive to human needs.

I envision systems that can learn from their environment, adapt to changing conditions, and collaborate with human operators in ways that enhance rather than replace human capabilities. The goal isn't to eliminate human involvement, but to elevate it to more meaningful and creative tasks.

This vision requires not just technical innovation, but also thoughtful consideration of the social and ethical implications of these technologies. As engineers, we have a responsibility to build systems that benefit all of humanity.`
  },
  {
    name: 'reflections.txt',
    content: `As I reflect on my experiences in the field, I'm struck by how interconnected everything is. A problem in mechanical design might be solved through software, or a limitation in hardware might be overcome through clever control algorithms.

The interdisciplinary nature of mechatronics means you're always learning something new. Whether it's a new material with interesting properties, a novel sensor technology, or an emerging control strategy, there's always something on the horizon that could revolutionize how we approach a problem.

This constant evolution is what keeps me engaged and excited about the field. The challenges are real, but so are the opportunities to make a meaningful impact.`
  }
];

function Folder({ title, onClose }) {
  const [openFile, setOpenFile] = useState(null);
  const [position, setPosition] = useState({ x: 120, y: 120 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const { size, handleMouseDown: handleResizeMouseDown, windowRef, positionDelta } = useWindowResize({ width: 500, height: 400 }, { width: 350, height: 250 });

  // Adjust position when resizing from left or top
  useEffect(() => {
    if (positionDelta.x !== 0 || positionDelta.y !== 0) {
      setPosition(prev => ({
        x: prev.x + positionDelta.x,
        y: prev.y + positionDelta.y
      }));
    }
  }, [positionDelta]);

  const handleFileClick = (file) => {
    setOpenFile(file);
  };

  const handleCloseNotepad = () => {
    setOpenFile(null);
  };

  const onMouseDown = (e) => {
    // Don't start dragging if clicking on resize handles or close button
    if (e.target.closest('.resize-handle')) return;
    if (e.target.closest('.folder-close-btn')) return;
    // Only start dragging if clicking on the header
    if (!e.target.closest('.folder-header')) return;
    
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    
    // Constrain to viewport
    const maxX = window.innerWidth - size.width;
    const maxY = window.innerHeight - size.height;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const onMouseUp = () => setDragging(false);

  // Add global mouse move and up handlers for dragging
  useEffect(() => {
    if (dragging) {
      const handleMouseMove = (e) => {
        e.preventDefault();
        onMouseMove(e);
      };
      const handleMouseUp = (e) => {
        e.preventDefault();
        onMouseUp();
      };
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, offset, position, size]);

  // Constrain position on window resize
  useEffect(() => {
    const handleResize = () => {
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY))
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  return (
    <>
      <div 
        ref={windowRef}
        className="folder-window"
        style={{ top: position.y, left: position.x, width: size.width, height: size.height }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <div className="folder-header" onMouseDown={onMouseDown}>
          <span className="folder-title">{title}</span>
        <button 
          className="folder-close-btn" 
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => { 
            e.stopPropagation(); 
            e.preventDefault();
            onClose(); 
          }}
        >
          ✕
        </button>
        </div>
        <div className="folder-menu">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Favorites</span>
          <span>Tools</span>
          <span>Help</span>
        </div>
        <div className="folder-content">
          <div className="folder-toolbar">
            <button className="folder-toolbar-btn">← Back</button>
            <button className="folder-toolbar-btn">↑ Up</button>
            <div className="folder-toolbar-separator"></div>
            <button className="folder-toolbar-btn">📁</button>
            <button className="folder-toolbar-btn">🗑️</button>
          </div>
          <div className="folder-files">
            {txtFiles.map((file, index) => (
              <div 
                key={index} 
                className="folder-file-item"
                onDoubleClick={() => handleFileClick(file)}
              >
                <span className="file-icon">
                  <img src={FileIcon} alt="File" style={{ width: '16px', height: '16px' }} />
                </span>
                <span className="file-name">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="resize-handle resize-handle-n" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'n'); }}></div>
        <div className="resize-handle resize-handle-s" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 's'); }}></div>
        <div className="resize-handle resize-handle-e" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'e'); }}></div>
        <div className="resize-handle resize-handle-w" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'w'); }}></div>
        <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'ne'); }}></div>
        <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'nw'); }}></div>
        <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'se'); }}></div>
        <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, 'sw'); }}></div>
      </div>
      {openFile && (
        <Notepad 
          title={openFile.name}
          content={openFile.content}
          onClose={handleCloseNotepad}
          initialPosition={{ x: 200, y: 200 }}
        />
      )}
    </>
  );
}

export default Folder;

