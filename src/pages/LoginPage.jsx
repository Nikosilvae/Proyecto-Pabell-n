// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthSlider from '../components/AuthSlider';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 1. Estado para la visibilidad
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://dev.pabellon.cl/api/api.php?recurso=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ usuario, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al iniciar sesión.');
      }
      
      navigate('/moderacion'); 

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
        <p>Encuentra tu próximo hogar con confianza y facilidad.</p>
      </AuthSlider>
      
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <h2>Bienvenido de Vuelta</h2>
          <p className="subtitle">Ingresa tus credenciales para acceder.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="usuario">Usuario</label>
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
            
            <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="auth-switch-link">
            ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}