// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <h4>Pabellón.cl</h4>
          <p className="muted">
            Portal inmobiliario para encontrar tu próxima vivienda con confianza y facilidad.
          </p>
        </div>
        <div>
          <h4>Enlaces rápidos</h4>
          <ul className="links">
            <li><a href="/proyectos">Proyectos</a></li>
            <li><a href="/subsidios">Subsidios</a></li>
            <li><a href="/noticias">Noticias</a></li>
          </ul>
        </div>
        <div>
          <h4>Síguenos</h4>
          <div className="social">
            <a href="#!">Facebook</a>
            <a href="#!">Instagram</a>
            <a href="#!">YouTube</a>
          </div>
        </div>
      </div>
      <p className="copy">© 2025 Pabellón.cl — Todos los derechos reservados</p>
    </footer>
  );
}
