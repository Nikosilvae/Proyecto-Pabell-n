// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
// Ya no necesitamos BrowserRouter aquí
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Renderizamos App directamente. 
      El <HashRouter> que está dentro de App.js se encargará de todo.
    */}
    <App />
  </React.StrictMode>
);