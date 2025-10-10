// src/App.js
import React, { useEffect } from 'react';
// 1. Cambia la importación a HashRouter
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// El resto de tus importaciones no cambian
import Sidebar from './components/Sidebar';
import Header from "./components/Header";
import Footer from "./components/Footer";
import MockupPabellon from './pages/Mockuppabellon';
import Subsidios from "./pages/Subsidios";
import Inmobiliarias from "./pages/Inmobiliarias";
import Noticias from "./pages/Noticias";
import NoticiaDetalle from "./pages/NoticiaDetalle";
import Favoritos from './pages/Favoritos';
import PublicarPropiedad from "./pages/PublicarPropiedad"; 
import ComparadorPage from "./pages/ComparadorPage";
import ComparadorSubsidiosPage from "./pages/ComparadorSubsidiosPage";
import SimuladorPage from './pages/SimuladorPage';
import AyudaPage from './pages/AyudaPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import ModeracionPage from './pages/ModeracionPage';
import RegistroPage from './pages/RegistroPage';
import './pages/AuthPage.css';

import { initSidebarPreference, closeSidebar } from "./utils/sidebar"; 

export default function App() {
  useEffect(() => {
    initSidebarPreference();
    const onEsc = (e) => e.key === "Escape" && closeSidebar();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  // 2. Aquí envolvemos todo en HashRouter
  return (
    <HashRouter>
      <Header />
      <div className="sidebar__overlay" onClick={closeSidebar} />
      <div className="shell">
        <Sidebar />
        <main className="shell__content">
          <Routes>
            <Route path="/" element={<MockupPabellon />} />
            <Route path="/proyectos/*" element={<MockupPabellon />} />
            <Route path="/subsidios" element={<Subsidios />} />
            <Route path="/inmobiliarias" element={<Inmobiliarias />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/noticias/:slug" element={<NoticiaDetalle />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/publicar-propiedad" element={<PublicarPropiedad />} />
            <Route path="/comparar" element={<ComparadorPage />} />
            <Route path="/comparar-subsidios" element={<ComparadorSubsidiosPage />} />
            <Route path="/simulador" element={<SimuladorPage />} />
            <Route path="/ayuda" element={<AyudaPage />} /> 
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/moderacion" element={<ModeracionPage />} />
             </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </HashRouter>
  );
}