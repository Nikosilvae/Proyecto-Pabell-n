// src/pages/ModeracionPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Importamos Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import 'swiper/swiper-bundle.min.css';

// Importamos los nuevos estilos
import './ModeracionPage.css';

export default function ModeracionPage() {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPendientes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://dev.pabellon.cl/api/api.php?recurso=propiedades_pendientes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('No se pudo cargar la lista. Es posible que tu sesión haya expirado.');
      const data = await response.json();
      setPendientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendientes();
  }, [fetchPendientes]);

  const handleLogout = async () => {
    try {
      await fetch('https://dev.pabellon.cl/api/api.php?recurso=logout', {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/login');
    } catch (err) {
      alert('No se pudo cerrar la sesión.');
    }
  };

  const handleModeracion = async (id, nuevo_estado) => {
    // Animación de salida
    setPendientes(prev => prev.filter(p => p.id !== id));
    
    try {
      const response = await fetch(`https://dev.pabellon.cl/api/api.php?recurso=moderar_propiedad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, nuevo_estado }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error al moderar');
      }
    } catch (err) {
      alert("Error al moderar: " + err.message);
      fetchPendientes(); // Recargar si hay error
    }
  };

  if (loading) return <div className="container section"><p className="muted">Cargando propiedades pendientes...</p></div>;
  if (error) return <div className="container section"><p style={{ color: 'red' }}>{error}</p></div>;

  return (
    <div className="container section">
      <div className="moderation-header">
        <div>
          <h2>Panel de Moderación</h2>
          <p className="subtitle"><strong>{pendientes.length}</strong> propiedades están esperando revisión.</p>
        </div>
        <button className="btn btn--ghost" style={{color: 'var(--red)'}} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      {pendientes.length === 0 ? (
        <div className="empty" style={{textAlign: 'center', padding: '4rem 0'}}>
          <h3>¡Todo al día!</h3>
          <p>No hay propiedades pendientes de revisión.</p>
        </div>
      ) : (
        <div className="moderation-grid">
          <AnimatePresence>
            {pendientes.map(prop => {
              const imagenes = Array.isArray(prop.imagenes) ? prop.imagenes : [];
              return (
                <motion.div 
                  key={prop.id} 
                  className="moderation-card"
                  layout // Anima la desaparición del elemento
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="moderation-gallery">
                    <Swiper
                        modules={[Navigation, Pagination]}
                        navigation
                        pagination={{ clickable: true }}
                        loop={true}
                        className="moderation-swiper"
                    >
                      {imagenes.length > 0 ? imagenes.map((img, i) => (
                        <SwiperSlide key={i}>
                          <img src={img} alt={`Imagen ${i + 1} de ${prop.titulo}`} />
                        </SwiperSlide>
                      )) : (
                        <SwiperSlide>
                            {/* Placeholder si no hay imágenes */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f0f0f0', color: '#aaa' }}>
                                Sin imágenes
                            </div>
                        </SwiperSlide>
                      )}
                    </Swiper>
                  </div>
                  <div className="moderation-info">
                    <h3>{prop.titulo}</h3>
                    <p className="address">{prop.direccion}, {prop.comuna}</p>
                    <p className="description">{prop.descripcion}</p>
                    
                    <div className="moderation-features">
                      <div className="feature-item">
                        <span>💰</span> {prop.uf} UF
                      </div>
                      <div className="feature-item">
                        <span>🛏️</span> {prop.dormitorios} Dorms
                      </div>
                      <div className="feature-item">
                        <span>🛁</span> {prop.banos} Baños
                      </div>
                    </div>

                    <div className="moderation-actions">
                      <button className="btn btn--reject" onClick={() => handleModeracion(prop.id, 'rechazada')}>
                        Rechazar
                      </button>
                      <button className="btn btn--approve" onClick={() => handleModeracion(prop.id, 'aprobada')}>
                        Aprobar
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}