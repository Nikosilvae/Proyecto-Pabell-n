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
          <h4>Síguenos y Contacto</h4> {/* Actualicé el título para incluir Contacto */}
          <div className="social">
            <a href="https://www.facebook.com/tu-usuario" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
            <a href="https://www.instagram.com/tu-usuario" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://www.youtube.com/tu-canal" target="_blank" rel="noopener noreferrer">
              YouTube
            </a>
            {/* --- ENLACE DE WHATSAPP AÑADIDO --- */}
            <a href="https://wa.me/56900000000" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
      <p className="copy">© 2025 Pabellón.cl — Todos los derechos reservados</p>
    </footer>
  );
}