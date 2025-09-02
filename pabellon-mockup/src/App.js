// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import MockupPabellon from "./Mockuppabellon";
import Subsidios from "./pages/Subsidios"; // ⬅️ nueva página

// Placeholders temporales (si aún no existen otras páginas)
const Inmobiliarias = () => (
  <div className="container section">
    <h2>Inmobiliarias</h2>
    <p>Próximamente…</p>
  </div>
);

const Noticias = () => (
  <div className="container section">
    <h2>Noticias</h2>
    <p>Próximamente…</p>
  </div>
);

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/proyectos" replace />} />
          <Route path="/proyectos" element={<MockupPabellon />} />
          <Route path="/subsidios" element={<Subsidios />} />
          <Route path="/inmobiliarias" element={<Inmobiliarias />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="*" element={<Navigate to="/proyectos" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

