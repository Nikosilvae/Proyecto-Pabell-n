// src/pages/ComparadorPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { track } from '../utils/tracking';

export default function ComparadorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ids = useMemo(() => searchParams.get('ids'), [searchParams]);

  useEffect(() => {
    if (!ids) {
      setError("No se seleccionaron propiedades para comparar.");
      setLoading(false);
      return;
    }

    setLoading(true);
    track('view_comparison', { item_ids: ids.split(',') });

    fetch(`https://dev.pabellon.cl/api/api.php?recurso=proyectos_por_ids&ids=${ids}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        
        const proyectosConNumeros = (data || []).map(p => ({
            ...p,
            uf: p.uf ? parseFloat(p.uf) : null,
            dormitorios: p.dormitorios ? parseInt(p.dormitorios, 10) : 0,
            banos: p.banos ? parseInt(p.banos, 10) : 0,
        }));
        setProyectos(proyectosConNumeros);
      })
      .catch(err => {
        console.error("Error al cargar proyectos para comparar:", err);
        setError("No se pudieron cargar los datos de comparación.");
      })
      .finally(() => setLoading(false));
  }, [ids]);

  // Obtenemos una lista única de todos los amenities de los proyectos a comparar
  const todosLosAmenities = useMemo(() => {
    const set = new Set();
    proyectos.forEach(p => {
      (p.amenities || []).forEach(a => set.add(a));
    });
    return Array.from(set).sort();
  }, [proyectos]);

  if (loading) return <div className="container section"><p className="muted">Cargando comparación...</p></div>;
  if (error) return <div className="container section"><p style={{color:'red'}}><strong>Error:</strong> {error}</p></div>;
  if (proyectos.length < 2) {
    return (
        <div className="container section empty">
            <p>Necesitas al menos dos propiedades para comparar.</p>
            <button className="btn btn--primary" onClick={() => navigate('/proyectos')}>Volver a Proyectos</button>
        </div>
    );
  }

  return (
    <motion.div 
        className="container section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
      <div className="section__head">
        <h2>Comparar Propiedades</h2>
        <button className="btn btn--ghost" onClick={() => navigate('/proyectos')}>Volver al listado</button>
      </div>

      <div className="compare-table-container">
        <table className="compare-table">
            <thead>
                <tr>
                    <th>Característica</th>
                    {proyectos.map(p => (
                        <th key={p.id}>
                            <img src={p.img} alt={p.titulo} className="compare-table__img" />
                            {p.titulo}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Comuna</strong></td>
                    {proyectos.map(p => <td key={p.id}>{p.comuna}</td>)}
                </tr>
                <tr>
                    <td><strong>Precio (UF)</strong></td>
                    {proyectos.map(p => <td key={p.id}>{p.uf ? p.uf.toLocaleString('es-CL') : 'N/A'}</td>)}
                </tr>
                <tr>
                    <td><strong>Dormitorios</strong></td>
                    {proyectos.map(p => <td key={p.id}>{p.dormitorios}</td>)}
                </tr>
                 <tr>
                    <td><strong>Baños</strong></td>
                    {proyectos.map(p => <td key={p.id}>{p.banos}</td>)}
                </tr>
                <tr className="separator"><td colSpan={proyectos.length + 1}>Amenities</td></tr>
                {todosLosAmenities.map(amenity => (
                    <tr key={amenity}>
                        <td>{amenity}</td>
                        {proyectos.map(p => (
                            <td key={p.id} className="amenity-cell">
                                {(p.amenities || []).includes(amenity) ? '✅' : '❌'}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </motion.div>
  );
}