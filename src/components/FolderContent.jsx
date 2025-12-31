import { useState } from 'react';
import './FolderContent.css';
import FolderIcon from './FolderIcon';
import FileIcon from '../assets/Icons/TextIcon.png';

function FolderContent({ files, onFileOpen, selectedFile, onFileSelect }) {
  return (
    <div 
      className="folder-content"
      onClick={() => onFileSelect(null)} // Deselect when clicking empty space
    >
      <div className="folder-content-grid">
        {files.map((file) => (
          <FolderIcon
            key={file.id}
            iconSrc={FileIcon}
            label={file.name}
            isSelected={selectedFile === file.id}
            onSelect={() => onFileSelect(file.id)}
            onOpen={() => onFileOpen(file)}
          />
        ))}
      </div>
    </div>
  );
}

export default FolderContent;

