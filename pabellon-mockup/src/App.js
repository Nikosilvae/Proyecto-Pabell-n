// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";

import MockupPabellon from "./Mockuppabellon";
import Subsidios from "./pages/Subsidios";
import Inmobiliarias from "./pages/Inmobiliarias";
import Noticias from "./pages/Noticias";
import Favoritos from "./pages/Favoritos";
import { initSidebarPreference, closeSidebar } from "./utils/sidebar"; 

export default function App() {
  return (
    <>
      <Header />

      <div className="shell">
        <Sidebar />
        <main className="shell__content">
          <Routes>
            <Route path="/" element={<Navigate to="/proyectos" replace />} />
            {/* (Dashboard removido) */}
            <Route path="/proyectos" element={<MockupPabellon />} />
            <Route path="/subsidios" element={<Subsidios />} />
            <Route path="/inmobiliarias" element={<Inmobiliarias />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/favoritos" element={<Favoritos />} />
            {/* Redirección opcional si alguien entra a /dashboard */}
            <Route path="/dashboard" element={<Navigate to="/proyectos" replace />} />
            {/* catch-all */}
            <Route path="*" element={<Navigate to="/proyectos" replace />} />
          </Routes>
        </main>
      </div>

      <Footer />
    </>
  );
}
