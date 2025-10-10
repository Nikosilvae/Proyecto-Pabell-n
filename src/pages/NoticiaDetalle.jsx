// src/pages/NoticiaDetalle.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { track } from "../utils/tracking";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505927107997-9efb95f9decd?q=80&w=1200&auto-format&fit=crop";

function pickCover(nota) {
  const tryFromContent = () => {
    const text = Array.isArray(nota?.contenido) ? nota.contenido.join(" ") : String(nota?.contenido || "");
    const m = text.match(/https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp)/i);
    return m ? m[0] : "";
  };
  const candidates = [ nota?.imagen, nota?.img, tryFromContent() ]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
  return candidates[0] || FALLBACK_IMG;
}

export default function NoticiaDetalle() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // --- Estados para manejar la carga de datos de la API ---
  const [nota, setNota] = useState(null);
  const [relacionadas, setRelacionadas] = useState([]); // Opcional: para noticias relacionadas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- useEffect para llamar a la API y buscar la noticia por slug ---
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    // Llamamos al endpoint de detalle que creamos en la API
    fetch(`https://dev.pabellon.cl/api/api.php?recurso=noticia_detalle&slug=${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("La noticia no fue encontrada.");
        return res.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setNota(data);
        track("view_news_detail", { slug: data.slug, titulo: data.titulo });
        // Opcional: Aquí podrías hacer otra llamada fetch para buscar noticias relacionadas
      })
      .catch(err => {
        console.error("Error al cargar detalle de la noticia:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug]); // Se ejecuta de nuevo si el slug en la URL cambia

  const cover = useMemo(() => pickCover(nota || {}), [nota]);
  const fechaFmt = useMemo(() => {
    if (!nota?.fecha) return "";
    return new Date(nota.fecha).toLocaleDateString("es-CL", {
      year: "numeric", month: "long", day: "2-digit",
    });
  }, [nota]);

  // Los párrafos ahora vienen del campo 'contenido' de la base de datos
  const parrafos = useMemo(() => {
    if (!nota?.contenido) return [];
    // Si el contenido ya es un array (porque el JSON lo parseó), lo usamos.
    if (Array.isArray(nota.contenido)) return nota.contenido;
    // Si es un string, lo separamos por saltos de línea.
    return String(nota.contenido).split(/\n{1,}/).map(t => t.trim()).filter(Boolean);
  }, [nota]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado ✅");
    } catch {}
  };
  
  const ir = (s) => navigate(`/noticias/${s}`);

  if (loading) {
    return <div className="container section"><p className="muted">Cargando noticia...</p></div>;
  }
  if (error) {
    return (
      <section className="container section">
        <h2>Noticia no encontrada</h2>
        <p className="muted">{error}</p>
        <button className="btn btn--ghost" onClick={() => navigate("/noticias")}>
          Volver a Noticias
        </button>
      </section>
    );
  }
  if (!nota) return null;

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${cover})` }}>
        <div className="hero__overlay">
          <div className="breadcrumb">
            <button className="btn btn--ghost" onClick={() => navigate("/noticias")}>
              ← Volver a Noticias
            </button>
          </div>
          <h2 style={{ marginBottom: 6 }}>{nota.titulo}</h2>
          <div className="chips" style={{ justifyContent: "center" }}>
            {nota.categoria && <span className="chip">{nota.categoria}</span>}
            {fechaFmt && <span className="chip">{fechaFmt}</span>}
          </div>
        </div>
      </section>

      <section className="container section" style={{ maxWidth: 900 }}>
        {nota.bajada && (
          <p className="muted" style={{ fontSize: 18, marginBottom: 10, fontStyle: 'italic' }}>
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
            <h3 style={{ marginTop: 28 }}>Noticias Relacionadas</h3>
            <div className="grid grid--4">
              {/* Aquí iría el mapeo de las noticias relacionadas */}
            </div>
          </>
        )}
      </section>
    </>
  );
}