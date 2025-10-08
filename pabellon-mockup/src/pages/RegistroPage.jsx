// src/pages/RegistroPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthSlider from '../components/AuthSlider';

export default function RegistroPage() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 1. Estado para la visibilidad
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('https://dev.pabellon.cl/api/api.php?recurso=registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="usuario">Nuevo Usuario</label>
              <input 
                id="usuario" 
                type="text" 
                value={usuario} 
                onChange={(e) => setUsuario(e.target.value)} 
                className="input" 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              {/* 2. Envolvemos el input y el botón */}
              <div className="password-wrapper">
                <input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} // 3. Tipo de input dinámico
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="input" 
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)} // 4. Cambia el estado
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