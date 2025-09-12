// src/pages/NoticiaDetalle.jsx
import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NOTICIAS } from "../data/noticias";
import { track } from "../utils/tracking";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505927107997-9efb95f9decd?q=80&w=1200&auto=format&fit=crop";

function pickCover(nota) {
  const tryFromContent = () => {
    const text = Array.isArray(nota?.contenido)
      ? nota.contenido.join(" ")
      : String(nota?.contenido || "");
    const m = text.match(/https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp)/i);
    return m ? m[0] : "";
  };

  const candidates = [
    nota?.imagen,
    nota?.img,
    nota?.image,
    nota?.cover,
    nota?.portada,
    nota?.hero,
    tryFromContent(),
  ]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);

  return candidates[0] || FALLBACK_IMG;
}

export default function NoticiaDetalle() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // 1) Encontrar la nota (hook siempre declarado)
  const nota = useMemo(() => {
    return NOTICIAS.find((n) => n.slug === slug) || null;
  }, [slug]);

  // 2) Tracking (hook siempre declarado)
  useEffect(() => {
    if (nota) track("view_news_detail", { slug: nota.slug, titulo: nota.titulo });
  }, [nota]);

  // 3) Derivados (hooks siempre declarados; devuelven valores seguros si no hay nota)
  const cover = useMemo(() => pickCover(nota || {}), [nota]);

  const fechaFmt = useMemo(() => {
    if (!nota?.fecha) return "";
    return new Date(nota.fecha).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  }, [nota]);

  const parrafos = useMemo(() => {
    if (!nota) return [];
    if (Array.isArray(nota.contenido)) return nota.contenido;
    return String(nota.contenido || "")
      .split(/\n{2,}/)
      .map((t) => t.trim())
      .filter(Boolean);
  }, [nota]);

  const relacionadas = useMemo(() => {
    if (!nota) return [];
    const cat = (nota.categoria || "General").trim();
    return NOTICIAS
      .filter((n) => n.slug !== nota.slug && (n.categoria || "General").trim() === cat)
      .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
      .slice(0, 4);
  }, [nota]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado ✅");
    } catch {}
  };

  const ir = (s) => navigate(`/noticias/${s}`);

  // 4) Render (una sola devolución; condiciones dentro del JSX)
  return (
    <>
      {/* HERO */}
      <section
        className="hero"
        style={{ backgroundImage: `url(${cover})` }}
      >
        <div className="hero__overlay">
          <div className="breadcrumb">
            <button className="btn btn--ghost" onClick={() => navigate("/noticias")}>
              ← Volver
            </button>
          </div>
          <h2 style={{ marginBottom: 6 }}>{nota?.titulo || "Noticia no encontrada"}</h2>
          <div className="chips" style={{ justifyContent: "center" }}>
            {nota?.categoria && <span className="chip">{nota.categoria}</span>}
            {fechaFmt && <span className="chip">{fechaFmt}</span>}
          </div>
        </div>
      </section>

      {/* CUERPO */}
      <section className="container section">
        {!nota ? (
          <>
            <p className="muted">No encontramos esta noticia.</p>
            <button className="btn btn--ghost" onClick={() => navigate("/noticias")}>
              ← Volver a Noticias
            </button>
          </>
        ) : (
          <>
            {nota.bajada && (
              <p className="muted" style={{ fontSize: 18, marginBottom: 10 }}>
                {nota.bajada}
              </p>
            )}

            <article className="article">
              {parrafos.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </article>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn btn--ghost" onClick={copiar}>Copiar enlace</button>
              <button className="btn btn--ghost" onClick={() => window.print()}>Imprimir</button>
            </div>

            {relacionadas.length > 0 && (
              <>
                <h3 style={{ marginTop: 28 }}>Relacionadas</h3>
                <div className="grid grid--4">
                  {relacionadas.map((n, i) => (
                    <motion.article
                      key={n.slug}
                      className="card card--hover"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <div className="card__imgwrap" onClick={() => ir(n.slug)} role="button">
                        <img
                          src={pickCover(n)}
                          alt={n.titulo}
                          className="card__img"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            if (e.currentTarget.dataset.fallback !== "1") {
                              e.currentTarget.dataset.fallback = "1";
                              e.currentTarget.src = FALLBACK_IMG;
                            }
                          }}
                        />
                        {n.fecha && (
                          <div className="badge">
                            {new Date(n.fecha).toLocaleDateString("es-CL", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                            })}
                          </div>
                        )}
                      </div>
                      <div className="card__body">
                        <h4 className="card__title" style={{ marginBottom: 6 }}>{n.titulo}</h4>
                        {n.bajada && <p className="muted">{n.bajada}</p>}
                        <div style={{ marginTop: 10 }}>
                          <button className="btn btn--primary" onClick={() => ir(n.slug)}>
                            Leer más
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}
