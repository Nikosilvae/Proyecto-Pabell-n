// src/pages/PublicarPropiedad.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Lista de amenities comunes
const allAmenities = [
  "Piscina", "Gimnasio", "Quincho", "Sala de eventos", "Juegos infantiles", 
  "Estacionamiento", "Bodega", "Terraza", "Balcón", "Conserjería 24/7", "Lavandería"
];

export default function PublicarPropiedad() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [comunas, setComunas] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '', descripcion: '', comuna: '', direccion: '',
    uf: '', dormitorios: '1', banos: '1', amenities: []
  });
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    fetch('https://dev.pabellon.cl/api/api.php?recurso=comunas')
      .then(res => res.json())
      .then(data => setComunas(data || []))
      .catch(err => console.error("Error al cargar comunas:", err));
  }, []);

  useEffect(() => {
    // Limpia las URLs de previsualización para evitar fugas de memoria
    return () => imagePreviews.forEach(url => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const newAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: newAmenities };
    });
  };

  const handleFileChange = (files) => {
    const fileList = Array.from(files);
    if (fileList.length + selectedFiles.length > 10) {
      alert("Puedes subir un máximo de 10 imágenes.");
      return;
    }
    setSelectedFiles(prev => [...prev, ...fileList]);
    const previews = fileList.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };
  
  const removeImage = (indexToRemove) => {
      setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
      setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ message: 'Enviando...', type: 'loading' });

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      const value = key === 'amenities' ? JSON.stringify(formData[key]) : formData[key];
      dataToSend.append(key, value);
    });
    selectedFiles.forEach(file => dataToSend.append('imagenes[]', file));

    try {
      const response = await fetch('https://dev.pabellon.cl/api/guardar_propiedad.php', {
        method: 'POST',
        body: dataToSend,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error en el servidor.');
      
      setSubmitStatus({ message: result.message + '. Redirigiendo al login...', type: 'success' });
      
      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      setSubmitStatus({ message: error.message, type: 'error' });
    }
  };

  return (
    <motion.div className="container section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="section__head" style={{justifyContent: 'center', flexDirection: 'column', textAlign: 'center'}}>
        <h2>Publicar una Propiedad</h2>
        <p className="muted">Sigue los 3 pasos para completar tu publicación.</p>
        
        {/* --- MENSAJE CON ESTILO ACTUALIZADO --- */}
        <p style={{
          fontSize: '0.9rem',
          backgroundColor: '#e7f3ff', // Fondo azul claro para "información"
          borderLeft: '4px solid #007bff', // Borde izquierdo de color primario
          padding: '12px 16px',
          borderRadius: '8px',
          marginTop: '15px',
          color: '#004085', // Texto azul oscuro para mejor contraste
          textAlign: 'left' // Alineación a la izquierda para mejor lectura
        }}>
          <strong>Importante:</strong> Para asegurar que tu publicación quede guardada, al finalizar el último paso te pediremos que inicies sesión o crees una cuenta gratuita.
        </p>

      </div>

      {/* Indicador de Pasos */}
      <div className="steps-indicator">
        <div className={`step ${step >= 1 ? 'is-active' : ''}`}>1. Básicos</div>
        <div className={`step ${step >= 2 ? 'is-active' : ''}`}>2. Detalles</div>
        <div className={`step ${step >= 3 ? 'is-active' : ''}`}>3. Imágenes</div>
      </div>

      <form className="form-publicar" onSubmit={handleSubmit} noValidate>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h4>Paso 1: Información Básica</h4>
              <div className="form-group">
                <label>Título de la Publicación</label>
                <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="input" placeholder="Ej: Departamento moderno en Ñuñoa"/>
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="5" className="input" placeholder="Describe las características..."></textarea>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h4>Paso 2: Detalles y Características</h4>
              <div className="form-grid">
                <div className="form-group"><label>Comuna</label><select name="comuna" value={formData.comuna} onChange={handleChange} className="dropdown"><option value="" disabled>Selecciona</option>{comunas.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="form-group"><label>Dirección</label><input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="input" placeholder="Ej: Av. Irarrázaval 1234"/></div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label>Precio (UF)</label><input type="number" name="uf" value={formData.uf} onChange={handleChange} className="input" placeholder="Ej: 3500"/></div>
                <div className="form-group"><label>Dormitorios</label><input type="number" name="dormitorios" value={formData.dormitorios} onChange={handleChange} className="input" placeholder="Ej: 2"/></div>
                <div className="form-group"><label>Baños</label><input type="number" name="banos" value={formData.banos} onChange={handleChange} className="input" placeholder="Ej: 1"/></div>
              </div>
              <div className="form-group">
                <label>Amenities</label>
                <div className="amenities-grid">
                  {allAmenities.map(a => (
                    <button key={a} type="button" className={`chip ${formData.amenities.includes(a) ? 'is-active' : ''}`} onClick={() => handleAmenityToggle(a)}>
                      {formData.amenities.includes(a) ? '✓ ' : ''}{a}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h4>Paso 3: Imágenes (máx. 10)</h4>
              <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault(); handleFileChange(e.dataTransfer.files);}}>
                <p>Arrastra y suelta tus imágenes aquí, o haz clic para seleccionarlas.</p>
                <input type="file" multiple accept="image/*" onChange={e => handleFileChange(e.target.files)} style={{ display: 'none' }} id="file-input"/>
                <label htmlFor="file-input" className="btn btn--ghost">Seleccionar Archivos</label>
              </div>
              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="preview-item">
                      <img src={src} alt={`Vista previa ${index + 1}`} />
                      <button type="button" className="remove-btn" onClick={() => removeImage(index)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navegación y Envío */}
        <div className="form-navigation">
          {step > 1 && <button type="button" className="btn btn--ghost" onClick={prevStep}>Anterior</button>}
          {step < 3 && <button type="button" className="btn btn--primary" onClick={nextStep}>Siguiente</button>}
          {step === 3 && <button type="submit" className="btn btn--primary" disabled={submitStatus.type === 'loading'}>{submitStatus.type === 'loading' ? 'Enviando...' : 'Enviar para Revisión'}</button>}
        </div>
        
        {submitStatus.message && <div className={`submit-message ${submitStatus.type}`}>{submitStatus.message}</div>}
      </form>
    </motion.div>
  );
}