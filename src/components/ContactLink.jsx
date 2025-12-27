function ContactLink({ icon, text, url }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="contact-link">
      <span className="icon">{icon}</span> {text}
    </a>
  );
}

export default ContactLink;
