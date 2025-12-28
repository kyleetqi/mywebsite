import './NotepadMenu.css';

function NotepadMenu({ content = '' }) {
  return (
    <>
      <div className="notepad-menu-bar">
        <span className="menu-item">File</span>
        <span className="menu-item">Edit</span>
        <span className="menu-item">Format</span>
        <span className="menu-item">View</span>
        <span className="menu-item">Help</span>
      </div>
      <div className="notepad-content">
        <div className="notepad-text">
          {content}
        </div>
      </div>
    </>
  );
}

export default NotepadMenu;

