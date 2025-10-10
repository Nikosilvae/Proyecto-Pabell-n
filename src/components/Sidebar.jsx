// src/components/Sidebar.jsx
import React, { useEffect, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // Lee la preferencia guardada en localStorage al cargar
  useEffect(() => {
    const isCollapsed = localStorage.getItem("sidebarCollapsed") === "1";
    setCollapsed(isCollapsed);
    document.body.classList.toggle("sidebar-collapsed", isCollapsed);
  }, []);

  // Función para alternar el estado del menú
  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      document.body.classList.toggle("sidebar-collapsed", next);
      localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
      return next;
    });
  }, []);

  return (
    // CAMBIO: Se eliminó el botón flotante que estaba aquí
    <aside className="sidebar">
      <div className="sidebar__head">
        <div className="sidebar__title">Menú</div>
        <button
          className="sidebar__toggle"
          onClick={toggle}
          aria-label={collapsed ? "Abrir menú" : "Colapsar menú"}
          title={collapsed ? "Abrir menú" : "Colapsar menú"}
        >
          {collapsed ? "⟩" : "⟨"}
        </button>
      </div>

      <nav className="sidebar__nav">
        <NavLink to="/" end className={({isActive}) => "side__link" + (isActive ? " is-active" : "")}>
          Proyectos
        </NavLink>
        <NavLink to="/subsidios" className={({isActive}) => "side__link" + (isActive ? " is-active" : "")}>
          Subsidios
        </NavLink>
        <NavLink to="/inmobiliarias" className={({isActive}) => "side__link" + (isActive ? " is-active" : "")}>
          Inmobiliarias
        </NavLink>
        <NavLink to="/noticias" className={({isActive}) => "side__link" + (isActive ? " is-active" : "")}>
          Noticias
        </NavLink>
        <NavLink to="/favoritos" className={({isActive}) => "side__link" + (isActive ? " is-active" : "")}>
          Favoritos
        </NavLink>
        <NavLink to="/publicar-propiedad" className={({isActive}) => "side__link" + (isActive ? " is-active" : "")}>
          Publicar Propiedad
        </NavLink>
          
      </nav>

      <div className="sidebar__section">
        <div className="sidebar__title">Atajos</div>
        <div className="sidebar__shortcuts">
          <NavLink to="/simulador" className="side__chip">Simulador</NavLink>
          <NavLink to="/ayuda" className="side__chip">Ayuda</NavLink>
        </div>
      </div>

      <div className="sidebar__footer muted">© 2025 Pabellón.cl</div>
    </aside>
  );
}