// src/pages/Inmobiliarias.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import FichaProyecto from "../components/FichaProyecto";
import SearchBar from '../components/SearchBar';
import FilterBar from "../components/FilterBar";
// CAMBIO: Ya no importamos INMOBILIARIAS estáticas, pero mantenemos COMUNAS para los filtros.
import { track } from "../utils/tracking";

export default function Inmobiliarias() {
  // --- 1. ESTADOS PARA MANEJAR LA CARGA DE DATOS DESDE LA API ---
  const [inmobiliarias, setInmobiliarias] = useState([]);
  const [proyectos, setProyectos] = useState([]); // Necesitamos la lista completa de proyectos para el modal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. USEEFFECT PARA CARGAR AMBOS RECURSOS (INMOBILIARIAS Y PROYECTOS) ---
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('https://dev.pabellon.cl/api/api.php?recurso=inmobiliarias').then(res => res.json()),
      fetch('https://dev.pabellon.cl/api/api.php?recurso=proyectos').then(res => res.json())
    ])
    .then(([dataInmobiliarias, dataProyectos]) => {
      if (dataInmobiliarias.error) throw new Error(dataInmobiliarias.error);
      if (dataProyectos.error) throw new Error(dataProyectos.error);
      
      setInmobiliarias(dataInmobiliarias || []);
      setProyectos(dataProyectos || []);
      setError(null);
    })
    .catch(err => {
      console.error("Error al cargar datos para Inmobiliarias:", err);
      setError("No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.");
    })
    .finally(() => setLoading(false));
  }, []);

  // El resto de tu lógica ahora usa los estados que vienen de la API
  const [q, setQ] = useState("");
  const [comuna, setComuna] = useState("");
  const [empresaSel, setEmpresaSel] = useState(null);
  const [proyectoSel, setProyectoSel] = useState(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setQ(sp.get("q") || "");
    setComuna(sp.get("c") || "");
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (comuna) sp.set("c", comuna);
    const qs = sp.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [q, comuna]);

  useEffect(() => {
    const open = !!empresaSel || !!proyectoSel;
    document.body.classList.toggle("no-scroll", open);
    return () => document.body.classList.remove("no-scroll");
  }, [empresaSel, proyectoSel]);

  const results = useMemo(() => {
    const ql = (q || "").toLowerCase();
    return inmobiliarias.filter((d) => {
      const nom = String(d?.nombre || "").toLowerCase();
      const desc = String(d?.descripcion || "").toLowerCase();
      const byText = nom.includes(ql) || desc.includes(ql);
      // Aseguramos que d.comunas sea un array antes de usar .includes()
      const byComuna = comuna ? (Array.isArray(d?.comunas) && d.comunas.includes(comuna)) : true;
      return byText && byComuna;
    });
  }, [inmobiliarias, q, comuna]);

  // Esta función ahora usa el estado 'proyectos' que viene de la API
  const getProyectos = useCallback((empresa) => {
    // La base de datos no nos da el array `proyectos`, así que lo simulamos buscando al revés
    if (!empresa || !empresa.id) return [];
    return proyectos.filter((p) => p.inmobiliaria_id === empresa.id);
  }, [proyectos]);
  
  const onBackdropMouseDown = (e, closeFn) => {
    if (e.target === e.currentTarget) closeFn(null);
  };

  // Comunas desde la API (derivadas de inmobiliarias, fallback a proyectos)
  const comunasOptions = useMemo(() => {
    const set = new Set();
    inmobiliarias.forEach((d) => {
      if (Array.isArray(d?.comunas)) d.comunas.forEach((c) => c && set.add(String(c)));
    });
    if (set.size === 0) {
      proyectos.forEach((p) => p?.comuna && set.add(String(p.comuna)));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [inmobiliarias, proyectos]);

  if (loading) {
    return <div className="container section"><p className="muted">Cargando inmobiliarias...</p></div>;
  }

  if (error) {
    return <div className="container section"><p style={{ color: 'red' }}><strong>Error:</strong> {error}</p></div>;
  }

  return (
    <>
      <section className="hero" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2000&auto-format&fit=crop)" }}>
        <div className="hero__overlay">
          <h2>Inmobiliarias</h2>
          <div className="searchbar" style={{ justifyContent: "center" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca por nombre o descripción…"
              aria-label="Buscar inmobiliaria"
              style={{ minWidth: 380 }}
            />
            <select
              className="dropdown"
              value={comuna}
              onChange={(e) => setComuna(e.target.value)}
              aria-label="Filtrar por comuna"
            >
              <option value="">Todas las comunas</option>
              {comunasOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            {results.length} de {inmobiliarias.length} inmobiliarias
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="grid grid--4">
          {results.map((emp, i) => {
            const proys = getProyectos(emp);
            return (
              <motion.article
                key={emp.id}
                className="card card--hover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="card__body">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={emp.logo} alt={emp.nombre} style={{ width: 140, height: 48, objectFit: "contain", background: "#fff", borderRadius: 8 }} />
                    <div>
                      <h4 className="card__title" style={{ marginBottom: 4 }}>{emp.nombre}</h4>
                      <div className="company__meta muted">{(Array.isArray(emp.comunas) ? emp.comunas.join(" · ") : '')}</div>
                    </div>
                  </div>
                  {emp.descripcion && (<p className="muted" style={{ marginTop: 10 }}>{emp.descripcion}</p>)}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                    <span className="badge">{proys.length} proyecto{proys.length === 1 ? "" : "s"}</span>
                    <button className="btn btn--primary" onClick={() => { track("view_developer", { developer_id: emp.id, name: emp.nombre }); setEmpresaSel(emp); }}>
                      Ver perfil
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
          {results.length === 0 && (
            <div className="empty">
              <p>No encontramos inmobiliarias con esos filtros.</p>
            </div>
          )}
        </div>
      </section>

      {empresaSel && (
        <div className="modal__backdrop" onMouseDown={(e) => onBackdropMouseDown(e, setEmpresaSel)}>
          <motion.article className="modal" onMouseDown={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.18 }} role="dialog" aria-modal="true" aria-label={`Perfil de ${empresaSel.nombre}`}>
            <div className="modal__head">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className="iconbtn" onClick={() => setEmpresaSel(null)} aria-label="Cerrar">←</button>
                <img src={empresaSel.logo} alt={empresaSel.nombre} style={{ width: 120, height: 40, objectFit: "contain", background: "#fff", borderRadius: 6 }}/>
                <div>
                  <h3 style={{ margin: 0 }}>{empresaSel.nombre}</h3>
                  <div className="muted" style={{ fontSize: 13 }}>{(Array.isArray(empresaSel.comunas) ? empresaSel.comunas.join(" · ") : '')}</div>
                </div>
              </div>
              <div className="muted">{String(empresaSel.sitio || "").replace(/^https?:\/\//, "").replace(/\/$/, "")}</div>
            </div>
            <div className="modal__body">
              {empresaSel.descripcion && <p className="muted" style={{ marginBottom: 12 }}>{empresaSel.descripcion}</p>}
              <div className="chips" style={{ marginBottom: 12 }}>
                {empresaSel.email && <a className="chip" href={`mailto:${empresaSel.email}`}>{empresaSel.email}</a>}
                {empresaSel.telefono && <a className="chip" href={`tel:${empresaSel.telefono}`}>{empresaSel.telefono}</a>}
                {empresaSel.sitio && <a href={empresaSel.sitio} className="chip" target="_blank" rel="noreferrer">Sitio web</a>}
              </div>
              <h4 style={{ margin: "0 0 10px" }}>Proyectos de esta inmobiliaria</h4>
              <div className="grid grid--4">
                {getProyectos(empresaSel).map((p, i) => (
                  <motion.article key={p.id} className="card card--hover" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <div className="card__imgwrap" onClick={() => { track("select_item", { item_id: p.id, item_name: p.titulo, list_id: "developer_projects", position: i + 1 }); setProyectoSel(p); }}>
                      <img src={p.img} alt={p.titulo} className="card__img" />
                      <div className="badge">{typeof p.uf === "number" ? `Desde ${p.uf.toLocaleString("es-CL")} UF` : "Consultar precio"}</div>
                    </div>
                    <div className="card__body">
                      <h4 className="card__title">{p.titulo}</h4>
                      <p className="muted">{p.comuna} · {p.dormitorios}D/{p.banos}B</p>
                      <button className="btn btn--primary" onClick={() => setProyectoSel(p)}>Ver ficha</button>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
            <div className="modal__cta">
              <button className="btn btn--ghost" onClick={() => setEmpresaSel(null)}>Cerrar</button>
            </div>
          </motion.article>
        </div>
      )}

      {proyectoSel && (<FichaProyecto data={proyectoSel} onBack={() => setProyectoSel(null)} />)}
    </>
  );
}