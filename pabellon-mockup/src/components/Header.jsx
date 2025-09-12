import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getFavCounts } from "../utils/favs";
import { toggleSidebar } from "../utils/sidebar"; 

export default function Header() {
  const [favTotal, setFavTotal] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof document !== "undefined" && document.body.classList.contains("sidebar-collapsed")
  );

  // contador de favoritos
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

  // toggle sidebar
  const toggleSidebar = () => {
    document.body.classList.toggle("sidebar-collapsed");
    setSidebarCollapsed(document.body.classList.contains("sidebar-collapsed"));
  };

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <h1 className="logo">
            <NavLink to="/" className="logo__link">Pabellón.cl</NavLink>
          </h1>

          <nav className="nav">
            <NavLink to="/proyectos" className={({isActive})=> isActive ? "is-active" : ""}>Proyectos</NavLink>
            <NavLink to="/subsidios" className={({isActive})=> isActive ? "is-active" : ""}>Subsidios</NavLink>
            <NavLink to="/inmobiliarias" className={({isActive})=> isActive ? "is-active" : ""}>Inmobiliarias</NavLink>
            <NavLink to="/noticias" className={({isActive})=> isActive ? "is-active" : ""}>Noticias</NavLink>

            {/* Favoritos con contador */}
            <NavLink
              to="/favoritos"
              className={({isActive}) => `fav-link ${isActive ? "is-active" : ""}`}
              title="Ver favoritos"
            >
              Favoritos <span className="fav-count">{favTotal}</span>
            </NavLink>
          </nav>

          <a
            className="btn btn--primary"
            href="https://pram.elmercurio.com/Login.aspx?SSOTargetUrl=https://www.pabellon.cl/noticias&ApplicationName=PABELLON"
            target="_blank"
            rel="noreferrer"
          >
            Ingresar
          </a>
        </div>
      </header>

      {/* Botón flotante para abrir/cerrar el menú lateral */}
      <button
        className="sidebar__fab"
        type="button"
        aria-label="Abrir o cerrar menú lateral"
        aria-pressed={sidebarCollapsed ? "true" : "false"}
        onClick={toggleSidebar}
        title={sidebarCollapsed ? "Mostrar menú" : "Ocultar menú"}
      >
        ☰
      </button>
    </>
  );
}
