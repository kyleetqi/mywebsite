function ExperienceItem({ company, position }) {
  return (
    <div className="experience-item">
      <span className="company-icon">🏢</span>
      <span className="company-name">{company}</span> - <span className="position">{position}</span>
    </div>
  );
}

export default ExperienceItem;
