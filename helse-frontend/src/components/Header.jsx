// src/components/Header.jsx
import { NavLink } from "react-router-dom";
import "../styles/Header.css";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo">
          <NavLink to="/"> Helse og Omsorg</NavLink>
        </div>

        <nav className="main-nav">
          <NavLink to="/" end> Hjem</NavLink>
          <NavLink to="/services">Tjenester</NavLink>
          <NavLink to="/about">Om oss</NavLink>
          <NavLink to="/contact">Kontakt</NavLink>
        </nav>

      
      </div>
    </header>
  );
}
