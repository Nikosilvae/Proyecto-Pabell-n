// src/pages/Subsidios.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { SUBSIDIOS } from "../data/subsidios";
import { track } from "../utils/tracking";
import { notifyFavsChanged } from "../utils/favs";


const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505927107997-9efb95f9decd?q=80&w=1200&auto=format&fit=crop";

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

export default function Subsidios() {
  // Filtros
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [region, setRegion] = useState("");

  // Modal detalle
  const [subSel, setSubSel] = useState(null);

  // === Favoritos (subsidios) ===
  const [favSubsIds, setFavSubsIds] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("favs_subsidios") || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  });
  const isFavSub = useCallback((id) => favSubsIds.includes(id), [favSubsIds]);
  const toggleFavSub = useCallback((id) => {
    setFavSubsIds((prev) => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter((x) => x !== id);
        track("remove_favorite", { item_id: id, list_id: "subsidies" });
      } else {
        next = [...prev, id];
        track("add_favorite", { item_id: id, list_id: "subsidies" });
      }
      localStorage.setItem("favs_subsidios", JSON.stringify(next));
      notifyFavsChanged();
      return next;
    });
  }, []);

  // Opciones únicas
  const tipos = useMemo(() => {
    return Array.from(new Set(SUBSIDIOS.map((s) => s.tipo))).sort((a, b) =>
      String(a).localeCompare(String(b), "es")
    );
  }, []);
  const estados = useMemo(() => {
    return Array.from(new Set(SUBSIDIOS.map((s) => s.estado))).sort((a, b) =>
      String(a).localeCompare(String(b), "es")
    );
  }, []);
  const regiones = useMemo(() => {
    return Array.from(new Set(SUBSIDIOS.map((s) => s.region))).sort();
  }, []);

  // URL <-> estado
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setQ(sp.get("q") || "");
    setTipo(sp.get("t") || "");
    setEstado(sp.get("e") || "");
    setRegion(sp.get("r") || "");
  }, []);
  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (tipo) sp.set("t", tipo);
    if (estado) sp.set("e", estado);
    if (region) sp.set("r", region);
    const qs = sp.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [q, tipo, estado, region]);

  // Filtrado + sort
  const results = useMemo(() => {
    const rankEstado = (s) =>
      s === "Abierto" ? 0 : s === "Próximo" ? 1 : s === "Cerrado" ? 2 : 3;

    const ql = (q || "").toLowerCase();
    const f = SUBSIDIOS.filter((s) => {
      const texto =
        `${s.nombre} ${s.bajada} ${(s.requisitos || []).join(" ")} ${(s.beneficio || []).join(" ")}`.toLowerCase();
      const byText = texto.includes(ql);
      const byTipo = tipo ? s.tipo === tipo : true;
      const byEstado = estado ? s.estado === estado : true;
      const byRegion = region ? s.region === region : true;
      return byText && byTipo && byEstado && byRegion;
    });

    return f.sort((a, b) => {
      const ra = rankEstado(a.estado);
      const rb = rankEstado(b.estado);
      if (ra !== rb) return ra - rb;
      const fa = a.postulacion?.fin ? new Date(a.postulacion.fin).getTime() : Infinity;
      const fb = b.postulacion?.fin ? new Date(b.postulacion.fin).getTime() : Infinity;
      return fa - fb;
    });
  }, [q, tipo, estado, region]);

  // Tracking
  useEffect(() => {
    track("view_subsidy_list", { q, tipo, estado, region, total: results.length });
  }, [q, tipo, estado, region, results.length]);

  // Abrir / cerrar modal
  const abrir = useCallback((s) => {
    setSubSel(s);
    track("open_subsidy", { id: s.id, slug: s.slug, estado: s.estado });
    document.body.classList.add("no-scroll");
  }, []);
  const cerrar = useCallback(() => {
    setSubSel(null);
    document.body.classList.remove("no-scroll");
  }, []);

  return (
    <>
      <section
        className="hero"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2000&auto=format&fit=crop)",
        }}
      >
        <div className="hero__overlay">
          <h2>Subsidios</h2>
          <div className="searchbar" style={{ justifyContent: "center" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca por nombre, beneficio o requisito…"
              aria-label="Buscar subsidio"
              style={{ minWidth: 360 }}
            />
            <select className="dropdown" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Tipo: todos</option>
              {tipos.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select className="dropdown" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Estado: todos</option>
              {estados.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <select className="dropdown" value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">Región: todas</option>
              {regiones.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            {results.length} de {SUBSIDIOS.length} subsidios
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="grid grid--4">
          {results.map((s, i) => (
            <motion.article
              key={s.id}
              className="card card--hover"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="card__imgwrap" onClick={() => abrir(s)} role="button">
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
                  {s.estado} {s.postulacion?.fin ? `· hasta ${fmtFecha(s.postulacion.fin)}` : ""}
                </div>
              </div>
              <div className="card__body">
                <h4 className="card__title" style={{ marginBottom: 6 }}>{s.nombre}</h4>
                <div className="chips" style={{ marginBottom: 8 }}>
                  <span className="chip">{s.tipo}</span>
                  <span className="chip">Región {s.region}</span>
                </div>
                <p className="muted">{s.bajada}</p>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button className="btn btn--primary" onClick={() => abrir(s)}>
                    Ver detalle
                  </button>
                  <button
                    className="btn btn--ghost"
                    onClick={() => toggleFavSub(s.id)}
                    aria-pressed={isFavSub(s.id)}
                    title={isFavSub(s.id) ? "Quitar de guardados" : "Guardar"}
                  >
                    {isFavSub(s.id) ? "★ Guardado" : "☆ Guardar"}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}

          {results.length === 0 && (
            <div className="empty">
              <p>No encontramos subsidios con esos filtros.</p>
            </div>
          )}
        </div>
      </section>

      {subSel && (
        <div
          className="modal__backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && cerrar()}
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
                <button className="iconbtn" onClick={cerrar} aria-label="Cerrar">←</button>
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

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn--ghost"
                  onClick={() => toggleFavSub(subSel.id)}
                  aria-pressed={isFavSub(subSel.id)}
                >
                  {isFavSub(subSel.id) ? "★ Guardado" : "☆ Guardar"}
                </button>

                {subSel.link_oficial && (
                  <a
                    className="btn btn--ghost"
                    href={subSel.link_oficial}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => track("click_subsidy_link", { id: subSel.id })}
                  >
                    Ver sitio oficial
                  </a>
                )}
              </div>
            </div>

            <div className="modal__cta">
              <button className="btn btn--ghost" onClick={cerrar}>Cerrar</button>
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
