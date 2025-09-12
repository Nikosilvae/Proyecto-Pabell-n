// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__section">
        <div className="sidebar__title">Menú</div>
        <nav className="sidebar__nav">
          {/* Quitar Dashboard */}
          <NavLink to="/proyectos"     className={({isActive}) => "side__link" + (isActive ? " is-active" : "")}>Proyectos</NavLink>
          <NavLink to="/subsidios"     className={({isActive}) => "side__link" + (isActive ? " is-active" : "")}>Subsidios</NavLink>
          <NavLink to="/inmobiliarias" className={({isActive}) => "side__link" + (isActive ? " is-active" : "")}>Inmobiliarias</NavLink>
          <NavLink to="/noticias"      className={({isActive}) => "side__link" + (isActive ? " is-active" : "")}>Noticias</NavLink>
          <NavLink to="/favoritos"     className={({isActive}) => "side__link" + (isActive ? " is-active" : "")}>Favoritos</NavLink>
        </nav>
      </div>

      <div className="sidebar__section">
        <div className="sidebar__title">Atajos</div>
        <div className="sidebar__shortcuts">
          <a className="side__chip" href="#!">Simulador</a>
          <a className="side__chip" href="#!">Ayuda</a>
        </div>
      </div>

      <div className="sidebar__footer muted">© 2025 Pabellón.cl</div>
    </aside>
  );
}
