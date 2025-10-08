// src/components/FichaProyecto.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { toggleProjectFav, getProjectFavs } from '../utils/favs';

// Componente para una característica o "amenity"
function Feature({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f9f9f9', borderRadius: '6px' }}>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

export default function FichaProyecto({ data, onBack }) {
  // Maneja el clic en el fondo para cerrar el modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onBack();
    }
  };

  // Estado para saber si es favorito (se actualiza en tiempo real)
  const [isFav, setIsFav] = React.useState(() => getProjectFavs().has(data.id));

  const handleToggleFav = () => {
    toggleProjectFav(data.id);
    setIsFav(prev => !prev);
  };

  return (
    // El portal y el fondo oscuro del modal
    <div 
      className="modal__backdrop" 
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      {/* El contenido del modal con animación */}
      <motion.article 
        className="modal"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="modal__head">
          <button className="iconbtn" onClick={onBack} aria-label="Volver atrás">←</button>
          <div>
            <h3>{data.titulo}</h3>
            <p className="muted" style={{ margin: 0 }}>{data.inmobiliaria_nombre || 'Inmobiliaria destacada'}</p>
          </div>
        </div>

        <img src={data.img} alt={`Imagen de ${data.titulo}`} className="modal__img" />
        
        <div className="modal__body">
          <p className="muted" style={{ fontStyle: 'italic' }}>{data.descripcion || 'Sin descripción disponible.'}</p>
          
          <div className="grid grid--4" style={{ marginTop: '1rem', gap: '12px' }}>
            <Feature icon="📍" label={data.comuna} />
            <Feature icon="💰" label={`${data.uf.toLocaleString('es-CL')} UF`} />
            <Feature icon="🛏️" label={`${data.dormitorios} Dorms`} />
            <Feature icon="🛁" label={`${data.banos} Baños`} />
          </div>

          {data.amenities && data.amenities.length > 0 && (
            <>
              <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Amenities</h4>
              <div className="chips">
                {data.amenities.map(amenity => <span className="chip" key={amenity}>{amenity}</span>)}
              </div>
            </>
          )}
        </div>

        <div className="modal__cta">
          <button className="btn btn--ghost" onClick={handleToggleFav}>
            {isFav ? "★ Guardado" : "☆ Guardar"}
          </button>
          <a href="#!" className="btn btn--primary">Contactar a la inmobiliaria</a>
        </div>
      </motion.article>
    </div>
  );
}