// src/components/Footer.jsx
import "../styles/Footer.css";


export default function Footer() {
  return (
    <footer className="footer">
      <p>Helse og omsorg, Kommune X</p>
      <p>Telefon: <a href="tel:78001564">78 00 15 64</a></p>
      <p>E-post: <a href="mailto:post@kommune.no">post@kommune.no</a></p>
      <p>Åpningstider: Man–Fre 08:00–15:00</p>
      <p className="emergency">Ved nødsituasjon ring 113</p>
    </footer>
  );
}
