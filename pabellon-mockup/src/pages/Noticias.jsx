// src/pages/Noticias.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { NOTICIAS } from "../data/noticias";
import { track } from "../utils/tracking";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505927107997-9efb95f9decd?q=80&w=1200&auto=format&fit=crop";

// Portada tolerante a distintos nombres de campo
function getCover(n) {
  const tryFromContent = () => {
    const text = Array.isArray(n?.contenido) ? n.contenido.join(" ") : String(n?.contenido || "");
    const m = text.match(/https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp)/i);
    return m ? m[0] : "";
  };
  const candidates = [
    n?.img,
    n?.imagen,
    n?.image,
    n?.cover,
    n?.portada,
    n?.hero,
    tryFromContent(),
  ]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);

  return candidates[0] || FALLBACK_IMG;
}

// helper para construir la ventana de páginas con “…”
function buildPageItems(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (page <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (page >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];

  return [1, "…", page - 1, page, page + 1, "…", total];
}

export default function Noticias() {
  const navigate = useNavigate();

  // filtros
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  // paginación
  const pageSize = 12;
  const [page, setPage] = useState(1);

  // categorías únicas
  const categorias = useMemo(() => {
    const s = new Set(NOTICIAS.map((n) => (n.categoria || "General").trim()));
    return Array.from(s).sort((a, b) => a.localeCompare(b, "es"));
  }, []);

  // URL -> estado
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setQ(sp.get("q") || "");
    setCat(sp.get("cat") || "");
    const p = Number(sp.get("p") || "1");
    setPage(!Number.isNaN(p) && p > 0 ? p : 1);
  }, []);

  // estado -> URL
  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (cat) sp.set("cat", cat);
    if (page > 1) sp.set("p", String(page));
    const qs = sp.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [q, cat, page]);

  // Reset a página 1 cuando cambian filtros/búsqueda
  useEffect(() => {
    setPage(1);
  }, [q, cat]);

  // filtrado + sort por fecha desc
  const results = useMemo(() => {
    const ql = (q || "").toLowerCase();
    const f = NOTICIAS.filter((n) => {
      const titulo = (n.titulo || "").toLowerCase();
      const bajada = (n.bajada || "").toLowerCase();
      const texto = Array.isArray(n.contenido)
        ? n.contenido.join(" ").toLowerCase()
        : (n.contenido || "").toLowerCase();
      const categoria = (n.categoria || "General").trim();
      const byText = titulo.includes(ql) || bajada.includes(ql) || texto.includes(ql);
      const byCat = cat ? categoria === cat : true;
      return byText && byCat;
    });
    return f.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  }, [q, cat]);

  // page slice
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, page, pageSize]);

  // tracking
  useEffect(() => {
    track("view_news_list", { q, cat, total: results.length, page });
  }, [q, cat, results.length, page]);

  // scroll al cambiar de página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const goDetalle = useCallback(
    (slug) => {
      track("click_news_item", { slug, position: (page - 1) * pageSize + 1 });
      navigate(`/noticias/${slug}`);
    },
    [navigate, page, pageSize]
  );

  const fmtFecha = (iso) =>
    new Date(iso).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  const onImgError = (e) => {
    const img = e.currentTarget;
    if (img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.src = FALLBACK_IMG;
  };

  // handler para ir a una página concreta
  const goPage = (n) => {
    if (typeof n !== "number") return;
    setPage(Math.min(Math.max(1, n), totalPages));
  };

  const itemsForPager = buildPageItems(page, totalPages);

  return (
    <>
      {/* HERO */}
      <section
        className="hero"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2000&auto=format&fit=crop)",
        }}
      >
        <div className="hero__overlay">
          <h2>Noticias</h2>
          <div className="searchbar" style={{ justifyContent: "center" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca por título, categoría o contenido…"
              aria-label="Buscar noticia"
              style={{ minWidth: 360 }}
            />
            <select
              className="dropdown"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              aria-label="Filtrar por categoría"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            {results.length} de {NOTICIAS.length} artículos
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="container section">
        <div className="grid grid--4">
          {pageItems.map((n, i) => {
            const cover = getCover(n);
            const categoria = (n.categoria || "General").trim();
            return (
              <motion.article
                key={n.id || n.slug}
                className="card card--hover"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div
                  className="card__imgwrap"
                  onClick={() => goDetalle(n.slug)}
                  role="button"
                >
                  <img
                    src={cover || FALLBACK_IMG}
                    alt={n.titulo}
                    className="card__img"
                    loading="lazy"
                    onError={onImgError}
                    referrerPolicy="no-referrer"
                  />
                  {n.fecha && <div className="badge">{fmtFecha(n.fecha)}</div>}
                </div>

                <div className="card__body">
                  <h4 className="card__title" style={{ marginBottom: 6 }}>
                    {n.titulo}
                  </h4>
                  <div className="chips" style={{ marginBottom: 8 }}>
                    <button
                      className="chip"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCat(categoria);
                      }}
                      title="Filtrar por categoría"
                    >
                      {categoria}
                    </button>
                  </div>
                  {n.bajada && <p className="muted">{n.bajada}</p>}
                  <div style={{ marginTop: 10 }}>
                    <button
                      className="btn btn--primary"
                      onClick={() => goDetalle(n.slug)}
                    >
                      Leer más
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}

          {pageItems.length === 0 && (
            <div className="empty">
              <p>No encontramos noticias con esos filtros.</p>
            </div>
          )}
        </div>

        {/* Paginación numérica */}
        {results.length > 0 && (
          <nav className="pager" role="navigation" aria-label="Paginación">
            <button
              className="btn btn--ghost"
              disabled={page <= 1}
              onClick={() => goPage(1)}
              aria-label="Primera página"
            >
              « Primero
            </button>
            <button
              className="btn btn--ghost"
              disabled={page <= 1}
              onClick={() => goPage(page - 1)}
              aria-label="Página anterior"
            >
              ← Anterior
            </button>

            {/* Números */}
            {itemsForPager.map((it, idx) =>
              it === "…" ? (
                <span key={`ellipsis-${idx}`} className="pager__info">
                  …
                </span>
              ) : (
                <button
                  key={it}
                  className="btn btn--ghost"
                  aria-current={it === page ? "page" : undefined}
                  aria-label={`Página ${it}`}
                  disabled={it === page}
                  onClick={() => goPage(it)}
                >
                  {it}
                </button>
              )
            )}

            <button
              className="btn btn--ghost"
              disabled={page >= totalPages}
              onClick={() => goPage(page + 1)}
              aria-label="Página siguiente"
            >
              Siguiente →
            </button>
            <button
              className="btn btn--ghost"
              disabled={page >= totalPages}
              onClick={() => goPage(totalPages)}
              aria-label="Última página"
            >
              Última »
            </button>
          </nav>
        )}
      </section>
    </>
  );
}

