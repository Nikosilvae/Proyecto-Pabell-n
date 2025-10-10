// src/pages/Favoritos.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FichaProyecto from "../components/FichaProyecto";
import { track } from "../utils/tracking";
import { getProjectFavs, toggleProjectFav, getSubsidyFavs, toggleSubsidyFav } from "../utils/favs";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1505927107997-9efb95f9decd?q=80&w=1200&auto=format&fit=crop";

export default function Favoritos() {
  const [todosLosProyectos, setTodosLosProyectos] = useState([]);
  const [todosLosSubsidios, setTodosLosSubsidios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- 1. ESTADOS DE COMPARACIÓN SEPARADOS ---
  const [compareProjects, setCompareProjects] = useState([]);
  const [compareSubsidies, setCompareSubsidies] = useState([]);

  // --- CÓDIGO CORREGIDO PARA CARGAR DATOS ---
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('https://dev.pabellon.cl/api/api.php?recurso=proyectos').then(res => res.json()),
      fetch('https://dev.pabellon.cl/api/api.php?recurso=subsidios').then(res => res.json())
    ])
    .then(([dataProyectos, dataSubsidios]) => {
      if (dataProyectos.error) throw new Error(`Error en proyectos: ${dataProyectos.error}`);
      if (dataSubsidios.error) throw new Error(`Error en subsidios: ${dataSubsidios.error}`);
      
      setTodosLosProyectos(dataProyectos || []);
      setTodosLosSubsidios(dataSubsidios || []);
      setError(null);
    })
    .catch(err => {
      console.error("Error al cargar favoritos:", err);
      setError("No se pudieron cargar los datos. Intenta de nuevo más tarde.");
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  const [tab, setTab] = useState("proyectos");
  const [favProjectIds, setFavProjectIds] = useState(() => getProjectFavs());
  const [favSubsidyIds, setFavSubsidyIds] = useState(() => getSubsidyFavs());
  
  useEffect(() => {
    const refresh = () => {
      setFavProjectIds(getProjectFavs());
      setFavSubsidyIds(getSubsidyFavs());
    };
    window.addEventListener("favsChanged", refresh);
    return () => window.removeEventListener("favsChanged", refresh);
  }, []);

  const proyectosFavoritos = useMemo(() => todosLosProyectos.filter(p => favProjectIds.has(p.id)), [todosLosProyectos, favProjectIds]);
  const subsidiosFavoritos = useMemo(() => todosLosSubsidios.filter(s => favSubsidyIds.has(s.id)), [todosLosSubsidios, favSubsidyIds]);
  
  const [seleccion, setSeleccion] = useState(null);
  const [subSel, setSubSel] = useState(null);

  // --- 2. FUNCIÓN DE COMPARACIÓN GENÉRICA ---
  const toggleCompare = useCallback((id, type) => {
    const listSetter = type === 'project' ? setCompareProjects : setCompareSubsidies;
    listSetter(currentList => {
      if (currentList.includes(id)) return currentList.filter(item => item !== id);
      if (currentList.length < 4) return [...currentList, id];
      alert("Puedes comparar hasta 4 elementos a la vez.");
      return currentList;
    });
  }, []);

  if (loading) return <div className="container section"><p className="muted">Cargando...</p></div>;
  if (error) return <div className="container section"><p style={{color:'red'}}>{error}</p></div>;

  return (
    <>
      <section className="container section">
        <div className="tabs">
          <button className={`tab ${tab === "proyectos" ? "is-active" : ""}`} onClick={() => setTab("proyectos")}>
            Proyectos <span className="pill">{proyectosFavoritos.length}</span>
          </button>
          <button className={`tab ${tab === "subsidios" ? "is-active" : ""}`} onClick={() => setTab("subsidios")}>
            Subsidios <span className="pill">{subsidiosFavoritos.length}</span>
          </button>
        </div>

        {tab === "proyectos" && (
          // Contenido de la pestaña Proyectos
          <>
            {proyectosFavoritos.length === 0 ? (
              <div className="empty" style={{textAlign: 'center', padding: '40px 0'}}>
                <p>Aún no has guardado proyectos como favoritos.</p>
                <button className="btn btn--primary" onClick={() => navigate('/')}>Explorar Proyectos</button>
              </div>
            ) : (
              <div className="grid grid--4">
                {proyectosFavoritos.map(p => (
                  <motion.article key={p.id} className="card">
                     <div className="card__imgwrap" onClick={() => setSeleccion(p)}>
                       <img src={p.img || FALLBACK_IMG} alt={p.titulo} className="card__img" />
                       <div className="badge">Desde {p.uf} UF</div>
                     </div>
                     <div className="card__body">
                       <h4 className="card__title">{p.titulo}</h4>
                       <p className="muted">{p.comuna} · {p.dormitorios}D/{p.banos}B</p>
                       <div className="card__actions" style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
                          <button className="btn btn--ghost" onClick={() => toggleProjectFav(p.id)}>★ Quitar</button>
                       </div>
                       <div className="card__compare" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                         <input type="checkbox" id={`compare-proj-${p.id}`} checked={compareProjects.includes(p.id)} onChange={() => toggleCompare(p.id, 'project')} />
                         <label htmlFor={`compare-proj-${p.id}`}>Comparar</label>
                       </div>
                     </div>
                  </motion.article>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "subsidios" && (
          // Contenido de la pestaña Subsidios
          <>
            {subsidiosFavoritos.length === 0 ? (
              <div className="empty" style={{textAlign: 'center', padding: '40px 0'}}>
                <p>Aún no has guardado subsidios como favoritos.</p>
                <button className="btn btn--primary" onClick={() => navigate('/subsidios')}>Explorar Subsidios</button>
              </div>
            ) : (
              <div className="grid grid--4">
                {subsidiosFavoritos.map(s => (
                  <motion.article key={s.id} className="card">
                    <div className="card__imgwrap" onClick={() => setSubSel(s)}>
                      <img src={s.imagen || FALLBACK_IMG} alt={s.nombre} className="card__img" />
                      <div className="badge">{s.estado}</div>
                    </div>
                    <div className="card__body">
                      <h4 className="card__title">{s.nombre}</h4>
                      <p className="muted">{s.bajada}</p>
                      <div className="card__actions" style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
                        <button className="btn btn--ghost" onClick={() => toggleSubsidyFav(s.id)}>★ Quitar</button>
                      </div>
                      <div className="card__compare" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                        <input type="checkbox" id={`compare-sub-${s.id}`} checked={compareSubsidies.includes(s.id)} onChange={() => toggleCompare(s.id, 'subsidy')} />
                        <label htmlFor={`compare-sub-${s.id}`}>Comparar</label>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Modales (FichaProyecto y detalle de subsidio) */}
      {seleccion && <FichaProyecto data={seleccion} onBack={() => setSeleccion(null)} />}
      
      {/* Aquí podrías añadir un modal para el detalle del subsidio si lo tienes como componente */}
      {subSel && (
        <div className="modal__backdrop" onMouseDown={(e) => e.target === e.currentTarget && setSubSel(null)}>
            {/* ... Contenido del modal de subsidio ... */}
        </div>
      )}

      {/* Barra de Comparación de Proyectos */}
      {tab === 'proyectos' && compareProjects.length > 0 && (
        <motion.div className="compare-bar" initial={{ y: 100 }} animate={{ y: 0 }}>
          <div className="compare-bar__info">Seleccionados: <strong>{compareProjects.length} / 4</strong></div>
          <div className="compare-bar__actions">
            <button className="btn btn--ghost" onClick={() => setCompareProjects([])}>Limpiar</button>
            <button className="btn btn--primary" onClick={() => navigate(`/comparar?ids=${compareProjects.join(',')}`)} disabled={compareProjects.length < 2}>
              Comparar
            </button>
          </div>
        </motion.div>
      )}

      {/* Barra de Comparación de Subsidios */}
      {tab === 'subsidios' && compareSubsidies.length > 0 && (
        <motion.div className="compare-bar" initial={{ y: 100 }} animate={{ y: 0 }}>
          <div className="compare-bar__info">Seleccionados: <strong>{compareSubsidies.length} / 4</strong></div>
          <div className="compare-bar__actions">
            <button className="btn btn--ghost" onClick={() => setCompareSubsidies([])}>Limpiar</button>
            <button className="btn btn--primary" onClick={() => navigate(`/comparar-subsidios?ids=${compareSubsidies.join(',')}`)} disabled={compareSubsidies.length < 2}>
              Comparar
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}