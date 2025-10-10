// src/components/Header.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { getFavCounts } from "../utils/favs";
import { toggleSidebar } from "../utils/sidebar"; 

export default function Header() {
  const [favTotal, setFavTotal] = useState(0);

  // Efecto para actualizar el contador de favoritos
  useEffect(() => {
    const refresh = () => setFavTotal(getFavCounts().total);
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("favs:changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("favs:changed", refresh);
    };
  }, []);

  return (
    <header className="header">
      <div className="container header__inner">
        <div className="header__left">
          {/* Botón de menú (hamburguesa) para abrir/cerrar el sidebar */}
          <button
            className="header__menuBtn"
            aria-label="Abrir o cerrar menú"
            title="Menú"
            onClick={toggleSidebar}
          >
            ☰
          </button>
          <h1 className="logo">
            <Link to="/" className="logo__link">Pabellón.cl</Link>
          </h1>
        </div>

        {/* --- El elemento <nav> ha sido eliminado --- */}

        <div className="header__actions">
          {/* Muevo el enlace de Favoritos aquí para que siga visible */}
          <NavLink to="/favoritos" className="btn btn--ghost">
            Favoritos ({favTotal})
          </NavLink>
          
          <NavLink to="/publicar-propiedad" className="btn btn--ghost">
            Publicar Propiedad
          </NavLink>

          <a
            className="btn btn--primary"
            href="https://pram.elmercurio.com/Login.aspx?SSOTargetUrl=https://www.pabellon.cl/noticias&ApplicationName=PABELLON"
            target="_blank"
            rel="noreferrer"
          >
            Ingresar
          </a>
        </div>
      </div>
    </header>
  );
}