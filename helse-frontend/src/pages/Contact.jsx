import "../styles/Contact.css";

export default function Contact() {
  return (
    <div className="contact-page">
      <h2>Kontakt oss</h2>
      <p>
        Har du spørsmål om helse- og omsorgstjenester? Fyll ut skjemaet nedenfor, eller kontakt oss direkte.
      </p>

      <div className="contact-info">
        <p><strong>Telefon:</strong> 78 00 00 00</p>
        <p><strong>E-post:</strong> helse@kommune.no</p>
        <p><strong>Adresse:</strong> Rådhusgata, 9600 Hammerfest</p>
      </div>

      <form className="contact-form">
        <label>Navn</label>
        <input type="text" placeholder="Skriv ditt navn" required />

        <label>E-post</label>
        <input type="email" placeholder="Skriv din e-post" required />

        <label>Melding</label>
        <textarea rows="5" placeholder="Skriv meldingen din her..." required></textarea>

        <button type="submit">Send melding</button>
      </form>
    </div>
  );
}
