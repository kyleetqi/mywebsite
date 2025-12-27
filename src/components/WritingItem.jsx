import { useState } from 'react';

function WritingItem({ title, link }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="writing-item">
      <p style={{ cursor: 'pointer', color: 'blue' }} onClick={() => setExpanded(!expanded)}>
        {title}
      </p>
      {expanded && (
        <div className="writing-content">
          <p>Here goes a short preview or full content of the writing.</p>
        </div>
      )}
    </div>
  );
}

export default WritingItem;
