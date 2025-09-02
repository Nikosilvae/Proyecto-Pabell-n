import React from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  const link = ({ isActive }) => (isActive ? "is-active" : "");
  return (
    <header className="header">
      <div className="container header__inner">
        <h1 className="logo">
          <NavLink to="/" className="logo__link">Pabellón.cl</NavLink>
        </h1>
        <nav className="nav">
          <NavLink to="/proyectos" className={link}>Proyectos</NavLink>
          <NavLink to="/subsidios" className={link}>Subsidios</NavLink>
          <NavLink to="/inmobiliarias" className={link}>Inmobiliarias</NavLink>
          <NavLink to="/noticias" className={link}>Noticias</NavLink>
        </nav>
        <a
          className="btn btn--primary"
          href="https://www.emol.com"
          target="_blank"
          rel="noreferrer"
        >
          Ingresar
        </a>
      </div>
    </header>
  );
}
