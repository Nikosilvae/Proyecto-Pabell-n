// src/pages/Subsidios.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import SearchBar from '../components/SearchBar';
import FilterBar from "../components/FilterBar";
import { track } from "../utils/tracking";
import { notifyFavsChanged } from "../utils/favs";


const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505927107997-9efb95f9decd?q=80&w=1200&auto-format&fit=crop";

function fmtFecha(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-CL", {
      year: "numeric", month: "short", day: "2-digit",
    });
  } catch { return iso; }
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h4 style={{ margin: "10px 0 8px", fontSize: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>{title}</h4>
      {children}
    </div>
  );
}

export default function Subsidios() {
  const [subsidios, setSubsidios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('https://dev.pabellon.cl/api/api.php?recurso=subsidios')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setSubsidios(data || []);
      })
      .catch(err => {
        console.error("Error al cargar subsidios:", err);
        setError("No se pudieron cargar los subsidios.");
      })
      .finally(() => setLoading(false));
  }, []);

  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [region, setRegion] = useState("");
  const [subSel, setSubSel] = useState(null);

  const [favSubsIds, setFavSubsIds] = useState(() => new Set(JSON.parse(localStorage.getItem("favs_subsidios") || "[]")));
  const isFavSub = useCallback((id) => favSubsIds.has(id), [favSubsIds]);
  const toggleFavSub = useCallback((id) => {
    setFavSubsIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("favs_subsidios", JSON.stringify([...next]));
      notifyFavsChanged();
      return next;
    });
  }, []);
  
  const tipos = useMemo(() => Array.from(new Set(subsidios.map((s) => s.tipo))).sort(), [subsidios]);
  const estados = useMemo(() => Array.from(new Set(subsidios.map((s) => s.estado))).sort(), [subsidios]);
  const regiones = useMemo(() => Array.from(new Set(subsidios.map((s) => s.region))).sort(), [subsidios]);

  useEffect(() => { /* ... URL sync ... */ }, []);
  useEffect(() => { /* ... URL sync ... */ }, [q, tipo, estado, region]);

  const results = useMemo(() => {
    // ... tu lógica de filtrado ...
    return subsidios.filter(s => {
      const texto = `${s.nombre} ${s.bajada} ${(s.requisitos || []).join(" ")} ${(s.beneficio || []).join(" ")}`.toLowerCase();
      return texto.includes((q || "").toLowerCase());
    });
  }, [subsidios, q, tipo, estado, region]);

  const abrir = useCallback((s) => {
    setSubSel(s);
    track("open_subsidy", { id: s.id, slug: s.slug });
    document.body.classList.add("no-scroll");
  }, []);
  const cerrar = useCallback(() => {
    setSubSel(null);
    document.body.classList.remove("no-scroll");
  }, []);

  if (loading) return <div className="container section"><p className="muted">Cargando subsidios...</p></div>;
  if (error) return <div className="container section"><p style={{ color: 'red' }}><strong>Error:</strong> {error}</p></div>;

  return (
    <>
      <section className="hero" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2000&auto=format&fit=crop)" }}>
        <div className="hero__overlay">
          <h2>Subsidios</h2>
          {/* ... Tus filtros ... */}
        </div>
      </section>

      <section className="container section">
        <div className="grid grid--4">
          {results.map((s, i) => (
            <motion.article key={s.id} className="card card--hover">
              <div className="card__imgwrap" onClick={() => abrir(s)} role="button">
                <img src={s.imagen || FALLBACK_IMG} alt={s.nombre} className="card__img" />
                <div className="badge">{s.estado} {s.postulacion?.fin ? `· hasta ${fmtFecha(s.postulacion.fin)}` : ""}</div>
              </div>
              <div className="card__body">
                <h4 className="card__title">{s.nombre}</h4>
                <p className="muted">{s.bajada}</p>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button className="btn btn--primary" onClick={() => abrir(s)}>Ver detalle</button>
                  <button className="btn btn--ghost" onClick={(e) => { e.stopPropagation(); toggleFavSub(s.id); }} aria-pressed={isFavSub(s.id)}>
                    {isFavSub(s.id) ? "★ Guardado" : "☆ Guardar"}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* --- ESTE ES EL MODAL COMPLETO Y FUNCIONAL --- */}
      {subSel && (
        <div className="modal__backdrop" onMouseDown={(e) => e.target === e.currentTarget && cerrar()}>
          <motion.article
            className="modal"
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle de ${subSel.nombre}`}
          >
            <div className="modal__head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="iconbtn" onClick={cerrar} aria-label="Cerrar">←</button>
                <div>
                  <h3 style={{ margin: 0 }}>{subSel.nombre}</h3>
                  <div className="muted" style={{ fontSize: '0.9rem' }}>{subSel.tipo} · Región {subSel.region}</div>
                </div>
              </div>
              <div className="muted">{subSel.estado}</div>
            </div>

            <img src={subSel.imagen || FALLBACK_IMG} alt={subSel.nombre} className="modal__img" />
            
            <div className="modal__body">
              <p className="muted" style={{ fontStyle: 'italic' }}>{subSel.bajada}</p>

              {Array.isArray(subSel.beneficio) && subSel.beneficio.length > 0 && (
                <Section title="Beneficios">
                  <ul className="bullets">
                    {subSel.beneficio.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </Section>
              )}
              
              {Array.isArray(subSel.requisitos) && subSel.requisitos.length > 0 && (
                <Section title="Requisitos">
                   <div className="chips">
                    {subSel.requisitos.map((r, i) => <span className="chip" key={i}>{r}</span>)}
                  </div>
                </Section>
              )}
              
              {subSel.postulacion_inicio && (
                 <Section title="Fechas de Postulación">
                   <p className="muted" style={{margin: 0}}>
                     Desde el {fmtFecha(subSel.postulacion_inicio)} hasta el {fmtFecha(subSel.postulacion_fin)}.
                   </p>
                 </Section>
              )}
            </div>

            <div className="modal__cta">
              <button className="btn btn--ghost" onClick={() => toggleFavSub(subSel.id)} aria-pressed={isFavSub(subSel.id)}>
                {isFavSub(subSel.id) ? "★ Guardado" : "☆ Guardar"}
              </button>
              {subSel.link_oficial && (
                <a className="btn btn--primary" href={subSel.link_oficial} target="_blank" rel="noreferrer">Sitio Oficial</a>
              )}
            </div>
          </motion.article>
        </div>
      )}
    </>
  );
}