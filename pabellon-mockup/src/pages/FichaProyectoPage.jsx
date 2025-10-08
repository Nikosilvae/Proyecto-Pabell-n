// src/pages/FichaProyectoPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FichaProyecto from "../components/FichaProyecto";

export default function FichaProyectoPage() {
  const { slug } = useParams(); // Obtiene el "slug" de la URL
  const navigate = useNavigate();

  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("No se especificó un proyecto.");
      return;
    }
    
    setLoading(true);
    // Llamamos a la API pidiendo UN SOLO proyecto
    fetch(`https://dev.pabellon.cl/api/api.php?recurso=proyecto_detalle&slug=${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Proyecto no encontrado");
        return res.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProyecto(data);
      })
      .catch(err => {
        console.error("Error al cargar el proyecto:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="container section"><p className="muted">Cargando proyecto...</p></div>;
  }
  
  if (error || !proyecto) {
    return (
      <div className="container section" style={{textAlign: 'center'}}>
        <h2>Proyecto no encontrado</h2>
        <p className="muted">{error || "El proyecto que buscas no existe."}</p>
        <button className="btn btn--primary" style={{marginTop: '1rem'}} onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </div>
    );
  }

  // Una vez cargado, renderiza el componente visual con los datos
  return (
    <div className="container section">
      <FichaProyecto data={proyecto} />
    </div>
  );
}