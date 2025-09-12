// src/pages/Favoritos.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PROYECTOS } from "../data/proyectos";
import { SUBSIDIOS } from "../data/subsidios";
import FichaProyecto from "../components/FichaProyecto";
import { track } from "../utils/tracking";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505927107997-9efb95f9decd?q=80&w=1200&auto=format&fit=crop";

// util fecha
function fmtFecha(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function Favoritos() {
  // pestaña activa
  const [tab, setTab] = useState("proyectos"); // 'proyectos' | 'subsidios'

  // === ESTADO: PROYECTOS ===
  const [favIds, setFavIds] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("favs") || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  });

  // Filtros de proyectos
  const [pq, setPq] = useState("");            // query texto
  const [pc, setPc] = useState("");            // comuna
  const [pd, setPd] = useState("");            // dormitorios ("1","2","3+")

  const proyectos = useMemo(() => {
    const map = new Map(PROYECTOS.map((p) => [p.id, p]));
    return favIds.map((id) => map.get(id)).filter(Boolean);
  }, [favIds]);

  // Opciones de comunas desde TODO el dataset (mejor UX)
  const comunasOptions = useMemo(() => {
    const set = new Set(PROYECTOS.map((p) => p.comuna).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, []);

  // Filtrado de proyectos
  const proyectosFiltrados = useMemo(() => {
    const ql = (pq || "").toLowerCase();
    return proyectos.filter((p) => {
      const txt = `${p.titulo} ${p.comuna}`.toLowerCase();
      const byText = txt.includes(ql);
      const byComuna = pc ? p.comuna === pc : true;
      const byDorm =
        pd === "3+"
          ? (p.dormitorios || 0) >= 3
          : pd
          ? (p.dormitorios || 0) === Number(pd)
          : true;
      return byText && byComuna && byDorm;
    });
  }, [proyectos, pq, pc, pd]);

  const removeFav = useCallback((id) => {
    setFavIds((prev) => {
      const next = prev.filter((x) => x !== id);
      localStorage.setItem("favs", JSON.stringify(next));
      track("remove_favorite", { item_id: id, list_id: "favorites_projects" });
      // avisa a header para refrescar contador
      window.dispatchEvent(new Event("favs:changed"));
      return next;
    });
  }, []);

  const [seleccion, setSeleccion] = useState(null); // ficha proyecto

  // === ESTADO: SUBSIDIOS ===
  const [favSubsIds, setFavSubsIds] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("favs_subsidios") || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  });

  // Filtros subsidios
  const [sq, setSq] = useState("");          // query
  const [se, setSe] = useState("");          // estado
  const [sr, setSr] = useState("");          // región

  const subsidios = useMemo(() => {
    const map = new Map(SUBSIDIOS.map((s) => [s.id, s]));
    return favSubsIds.map((id) => map.get(id)).filter(Boolean);
  }, [favSubsIds]);

  const estadosOptions = useMemo(() => {
    const set = new Set(SUBSIDIOS.map((s) => s.estado).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, []);
  const regionesOptions = useMemo(() => {
    const set = new Set(SUBSIDIOS.map((s) => s.region).filter(Boolean));
    return Array.from(set).sort();
  }, []);

  const subsidiosFiltrados = useMemo(() => {
    const ql = (sq || "").toLowerCase();
    return subsidios.filter((s) => {
      const texto = `${s.nombre} ${s.bajada} ${(s.requisitos || []).join(" ")} ${(s.beneficio || []).join(" ")}`.toLowerCase();
      const byText = texto.includes(ql);
      const byEstado = se ? s.estado === se : true;
      const byRegion = sr ? s.region === sr : true;
      return byText && byEstado && byRegion;
    });
  }, [subsidios, sq, se, sr]);

  const removeFavSub = useCallback((id) => {
    setFavSubsIds((prev) => {
      const next = prev.filter((x) => x !== id);
      localStorage.setItem("favs_subsidios", JSON.stringify(next));
      track("remove_favorite", { item_id: id, list_id: "favorites_subsidies" });
      window.dispatchEvent(new Event("favs:changed"));
      return next;
    });
  }, []);

  const [subSel, setSubSel] = useState(null); // modal subsidio

  // tracking de vista
  useEffect(() => {
    track("view_favorites", {
      tab,
      total_projects: proyectos.length,
      total_subsidies: subsidios.length,
    });
  }, [tab, proyectos.length, subsidios.length]);

  // ============ URL -> ESTADO (al cargar) ============
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("tab");
    if (t === "subsidios") setTab("subsidios");
    if (t === "proyectos") setTab("proyectos");

    // proyectos
    setPq(sp.get("pq") || "");
    setPc(sp.get("pc") || "");
    setPd(sp.get("pd") || "");

    // subsidios
    setSq(sp.get("sq") || "");
    setSe(sp.get("se") || "");
    setSr(sp.get("sr") || "");
  }, []);

  // ============ ESTADO -> URL (cuando cambian) ============
  useEffect(() => {
    const sp = new URLSearchParams();

    // pestaña
    if (tab === "subsidios") sp.set("tab", "subsidios");
    if (tab === "proyectos") sp.set("tab", "proyectos");

    // proyectos
    if (pq) sp.set("pq", pq);
    if (pc) sp.set("pc", pc);
    if (pd) sp.set("pd", pd);

    // subsidios
    if (sq) sp.set("sq", sq);
    if (se) sp.set("se", se);
    if (sr) sp.set("sr", sr);

    const qs = sp.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [tab, pq, pc, pd, sq, se, sr]);

  return (
    <>
      <section className="container section">
        {/* Tabs */}
        <div className="tabs" role="tablist" aria-label="Favoritos">
          <button
            className={`tab ${tab === "proyectos" ? "is-active" : ""}`}
            role="tab"
            aria-selected={tab === "proyectos"}
            onClick={() => setTab("proyectos")}
          >
            Proyectos <span className="pill">{proyectosFiltrados.length}</span>
          </button>
          <button
            className={`tab ${tab === "subsidios" ? "is-active" : ""}`}
            role="tab"
            aria-selected={tab === "subsidios"}
            onClick={() => setTab("subsidios")}
          >
            Subsidios <span className="pill">{subsidiosFiltrados.length}</span>
          </button>
        </div>

        {/* PROYECTOS */}
        {tab === "proyectos" && (
          <>
            {/* Filtros */}
            <div className="filters__row" style={{ marginBottom: 12 }}>
              <div className="filters__group">
                <span className="filters__label">Buscar</span>
                <input
                  className="input"
                  placeholder="Nombre o comuna…"
                  value={pq}
                  onChange={(e) => setPq(e.target.value)}
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", minWidth: 260 }}
                />
              </div>

              <div className="filters__group">
                <span className="filters__label">Comuna</span>
                <select
                  className="dropdown"
                  value={pc}
                  onChange={(e) => setPc(e.target.value)}
                >
                  <option value="">Todas</option>
                  {comunasOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="filters__group">
                <span className="filters__label">Dorm.</span>
                <select
                  className="dropdown"
                  value={pd}
                  onChange={(e) => setPd(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="1">1D</option>
                  <option value="2">2D</option>
                  <option value="3+">3D+</option>
                </select>
              </div>
            </div>

            <div className="section__head" style={{ marginTop: 4 }}>
              <h3>Proyectos guardados</h3>
              <span className="muted">
                {proyectosFiltrados.length} proyecto{proyectosFiltrados.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid grid--4">
              {proyectosFiltrados.map((p, i) => (
                <motion.article
                  key={p.id}
                  className="card card--hover"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div
                    className="card__imgwrap"
                    onClick={() => setSeleccion(p)}
                    role="button"
                  >
                    <img src={p.img} alt={p.titulo} className="card__img" />
                    <div className="badge">
                      {typeof p.uf === "number"
                        ? `Desde ${p.uf.toLocaleString("es-CL")} UF`
                        : "Consultar precio"}
                    </div>
                  </div>
                  <div className="card__body">
                    <h4 className="card__title">{p.titulo}</h4>
                    <p className="muted">
                      {p.comuna} · {p.dormitorios}D/{p.banos}B
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn--primary" onClick={() => setSeleccion(p)}>
                        Ver ficha
                      </button>
                      <button className="btn btn--ghost" onClick={() => removeFav(p.id)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}

              {proyectosFiltrados.length === 0 && (
                <div className="empty">
                  <p>
                    No hay proyectos que coincidan con los filtros. Limpia los filtros o
                    ve a <strong>Proyectos</strong> y usa “☆ Guardar”.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* SUBSIDIOS */}
        {tab === "subsidios" && (
          <>
            {/* Filtros */}
            <div className="filters__row" style={{ marginBottom: 12 }}>
              <div className="filters__group">
                <span className="filters__label">Buscar</span>
                <input
                  className="input"
                  placeholder="Nombre, requisitos o beneficios…"
                  value={sq}
                  onChange={(e) => setSq(e.target.value)}
                  style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", minWidth: 320 }}
                />
              </div>

              <div className="filters__group">
                <span className="filters__label">Estado</span>
                <select
                  className="dropdown"
                  value={se}
                  onChange={(e) => setSe(e.target.value)}
                >
                  <option value="">Todos</option>
                  {estadosOptions.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div className="filters__group">
                <span className="filters__label">Región</span>
                <select
                  className="dropdown"
                  value={sr}
                  onChange={(e) => setSr(e.target.value)}
                >
                  <option value="">Todas</option>
                  {regionesOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="section__head" style={{ marginTop: 4 }}>
              <h3>Subsidios guardados</h3>
              <span className="muted">
                {subsidiosFiltrados.length} subsidio{subsidiosFiltrados.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid grid--4">
              {subsidiosFiltrados.map((s, i) => (
                <motion.article
                  key={s.id}
                  className="card card--hover"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div
                    className="card__imgwrap"
                    onClick={() => setSubSel(s)}
                    role="button"
                  >
                    <img
                      src={s.imagen || FALLBACK_IMG}
                      alt={s.nombre}
                      className="card__img"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (e.currentTarget.dataset.fallback !== "1") {
                          e.currentTarget.dataset.fallback = "1";
                          e.currentTarget.src = FALLBACK_IMG;
                        }
                      }}
                    />
                    <div className="badge">
                      {s.estado}
                      {s.postulacion?.fin ? ` · hasta ${fmtFecha(s.postulacion.fin)}` : ""}
                    </div>
                  </div>
                  <div className="card__body">
                    <h4 className="card__title">{s.nombre}</h4>
                    <p className="muted">
                      {s.tipo} · Región {s.region}
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn--primary" onClick={() => setSubSel(s)}>
                        Ver detalle
                      </button>
                      <button className="btn btn--ghost" onClick={() => removeFavSub(s.id)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}

              {subsidiosFiltrados.length === 0 && (
                <div className="empty">
                  <p>
                    No hay subsidios que coincidan con los filtros. Limpia los filtros o
                    ve a <strong>Subsidios</strong> y usa “☆ Guardar”.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Modales reutilizados */}
      {seleccion && <FichaProyecto data={seleccion} onBack={() => setSeleccion(null)} />}

      {subSel && (
        <div
          className="modal__backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setSubSel(null)}
        >
          <motion.article
            className="modal"
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle ${subSel.nombre}`}
          >
            <div className="modal__head">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="iconbtn" onClick={() => setSubSel(null)} aria-label="Cerrar">←</button>
                <div>
                  <h3 style={{ margin: 0 }}>{subSel.nombre}</h3>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {subSel.tipo} · Región {subSel.region}
                  </div>
                </div>
              </div>
              <div className="muted">
                {subSel.estado}
                {subSel.postulacion?.inicio && ` · ${fmtFecha(subSel.postulacion.inicio)}`}
                {subSel.postulacion?.fin && ` → ${fmtFecha(subSel.postulacion.fin)}`}
              </div>
            </div>

            <img
              src={subSel.imagen || FALLBACK_IMG}
              alt={subSel.nombre}
              className="modal__img"
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (e.currentTarget.dataset.fallback !== "1") {
                  e.currentTarget.dataset.fallback = "1";
                  e.currentTarget.src = FALLBACK_IMG;
                }
              }}
            />

            <div className="modal__body">
              {subSel.bajada && <p className="muted" style={{ marginBottom: 12 }}>{subSel.bajada}</p>}

              {Array.isArray(subSel.beneficio) && subSel.beneficio.length > 0 && (
                <Section title="Beneficios">
                  <ul className="bullets">
                    {subSel.beneficio.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </Section>
              )}

              {Array.isArray(subSel.requisitos) && subSel.requisitos.length > 0 && (
                <Section title="Requisitos">
                  <ul className="bullets">
                    {subSel.requisitos.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </Section>
              )}

              {subSel.link_oficial && (
                <Section title="Más información">
                  <a
                    className="btn btn--ghost"
                    href={subSel.link_oficial}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => track("click_subsidy_link", { id: subSel.id })}
                  >
                    Ver sitio oficial
                  </a>
                </Section>
              )}
            </div>

            <div className="modal__cta">
              <button className="btn btn--ghost" onClick={() => setSubSel(null)}>Cerrar</button>
            </div>
          </motion.article>
        </div>
      )}
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h4 style={{ margin: "10px 0 8px" }}>{title}</h4>
      {children}
    </div>
  );
}
