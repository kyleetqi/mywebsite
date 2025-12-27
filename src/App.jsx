import './App.css';
import ExperienceItem from './components/ExperienceItem';
import WritingItem from './components/WritingItem';
import ContactLink from './components/ContactLink';
import DraggableWindow from './components/DraggableWindow';
import DesktopIcon from './components/DesktopIcon';
import { useState } from 'react';

function App() {
  const [windows, setWindows] = useState({
    skills: false,
    interests: false,
    experience: false,
    writings: false,
  });

  const open = (name) => setWindows(w => ({ ...w, [name]: true }));
  const close = (name) => setWindows(w => ({ ...w, [name]: false }));

  return (
    <div className="desktop">

      {/* Desktop Icons */}
      <div className="desktop-icons">
        <DesktopIcon icon="🛠️" label="Skills" onOpen={() => open('skills')} />
        <DesktopIcon icon="🧠" label="Interests" onOpen={() => open('interests')} />
        <DesktopIcon icon="🏢" label="Experience" onOpen={() => open('experience')} />
        <DesktopIcon icon="📄" label="Writings" onOpen={() => open('writings')} />
      </div>

      {/* Windows */}
      <DraggableWindow title="Skills" isOpen={windows.skills} onClose={() => close('skills')}>
        <p>Mechatronics, Robotics, Automation</p>
      </DraggableWindow>

      <DraggableWindow title="Interests" isOpen={windows.interests} onClose={() => close('interests')}>
        <p>Body Building, Evolutionary Biology, Anthropology</p>
      </DraggableWindow>

      <DraggableWindow title="Experience" isOpen={windows.experience} onClose={() => close('experience')}>
        <ExperienceItem company="Tesla" position="Battery Intern" />
        <ExperienceItem company="Curtiss-Wright" position="Materials R&D" />
      </DraggableWindow>

      <DraggableWindow title="Writings" isOpen={windows.writings} onClose={() => close('writings')}>
        <WritingItem title="Purpose In the Age of AI" link="#" />
      </DraggableWindow>

    </div>
  );
}

export default App;
