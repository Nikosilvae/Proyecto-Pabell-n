// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Añadimos la opción 'credentials: include' a la petición
    fetch('https://dev.pabellon.cl/api/api.php?recurso=check_session', {
      credentials: 'include' // <-- LÍNEA CRÍTICA
    })
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.isAuthenticated);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    return <div className="container section"><p className="muted">Verificando acceso...</p></div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;