// src/pages/RegistroPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthSlider from '../components/AuthSlider';

export default function RegistroPage() {
  // 1. Unificamos el estado en un solo objeto 'formData'
  const [formData, setFormData] = useState({
    usuario: '',
    correo_electronico: '',
    telefono: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // 2. Un único manejador para todos los cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 3. Apuntamos a tu archivo registro.php
      const response = await fetch('https://dev.pabellon.cl/api/registro.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 4. Enviamos el objeto formData completo
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar el usuario.');
      }
      
      setSuccess('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <AuthSlider>
        <h1>Pabellon.cl</h1>
        <p>Regístrate para comenzar a publicar propiedades.</p>
      </AuthSlider>

      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <h2>Crea tu Cuenta</h2>
          <p className="subtitle">Únete a nuestra comunidad para publicar propiedades.</p>

          {/* 5. Formulario actualizado con los nuevos campos */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="usuario">Nombre de Usuario</label>
              <input 
                id="usuario"
                name="usuario"
                type="text" 
                value={formData.usuario} 
                onChange={handleChange} 
                className="input" 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="correo_electronico">Correo Electrónico</label>
              <input 
                id="correo_electronico"
                name="correo_electronico"
                type="email" 
                value={formData.correo_electronico} 
                onChange={handleChange} 
                className="input" 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono (Opcional)</label>
              <input 
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrapper">
                <input 
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password} 
                  onChange={handleChange} 
                  className="input" 
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {error && <p className="auth-message error">{error}</p>}
            {success && <p className="auth-message success">{success}</p>}

            <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading || success}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="auth-switch-link">
            ¿Ya tienes una cuenta? <Link to="/login">Ingresa aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}