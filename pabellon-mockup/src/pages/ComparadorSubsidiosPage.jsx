// src/pages/ComparadorSubsidiosPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ComparadorSubsidiosPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [subsidios, setSubsidios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ids = useMemo(() => searchParams.get('ids'), [searchParams]);

  useEffect(() => {
    if (!ids) {
      setError("No se seleccionaron subsidios para comparar.");
      setLoading(false);
      return;
    }
    fetch(`https://dev.pabellon.cl/api/api.php?recurso=subsidios_por_ids&ids=${ids}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setSubsidios(data || []);
      })
      .catch(err => setError("No se pudieron cargar los datos de comparación."))
      .finally(() => setLoading(false));
  }, [ids]);
  
  const todosLosRequisitos = useMemo(() => {
    const set = new Set();
    subsidios.forEach(s => { (Array.isArray(s.requisitos) ? s.requisitos : []).forEach(r => set.add(r)); });
    return Array.from(set).sort();
  }, [subsidios]);

  if (loading) return <div className="container section"><p className="muted">Cargando...</p></div>;
  if (error) return <div className="container section"><p style={{color:'red'}}>{error}</p></div>;

  return (
    <motion.div className="container section" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="section__head">
        <h2>Comparar Subsidios</h2>
        <button className="btn btn--ghost" onClick={() => navigate('/favoritos?tab=subsidios')}>Volver a Favoritos</button>
      </div>
      <div className="compare-table-container">
        <table className="compare-table">
            <thead>
                <tr>
                    <th>Característica</th>
                    {subsidios.map(s => (
                        <th key={s.id}>
                            <img src={s.imagen} alt={s.nombre} className="compare-table__img" />
                            {s.nombre}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                <tr className="highlight"><td><strong>Estado</strong></td>{subsidios.map(s => <td key={s.id}><strong>{s.estado}</strong></td>)}</tr>
                <tr><td>Tipo</td>{subsidios.map(s => <td key={s.id}>{s.tipo}</td>)}</tr>
                <tr><td>Región</td>{subsidios.map(s => <td key={s.id}>{s.region}</td>)}</tr>
                <tr className="separator"><td colSpan={subsidios.length + 1}>Requisitos</td></tr>
                {todosLosRequisitos.map(req => (
                    <tr key={req}>
                        <td>{req}</td>
                        {subsidios.map(s => (
                            <td key={s.id} className="amenity-cell">
                                {(Array.isArray(s.requisitos) && s.requisitos.includes(req)) ? '✅' : '❌'}
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