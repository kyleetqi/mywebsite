import './DesktopIcon.css';

function DesktopIcon({ icon, label, onOpen }) {
  return (
    <div className="desktop-icon" onDoubleClick={onOpen}>
      <div className="icon">{icon}</div>
      <div className="label">{label}</div>
    </div>
  );
}

export default DesktopIcon;
