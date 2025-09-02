// src/components/FichaProyecto.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { track } from "../utils/tracking";
import ModalPortal from "./ModalPortal";

export default function FichaProyecto({ data, onBack }) {
  const fotos = useMemo(() => {
    const arr = Array.isArray(data?.fotos) ? data.fotos : [];
    const base = data?.img ? [data.img, ...arr] : arr;
    return [...new Set(base)];
  }, [data]);

  const [idx, setIdx] = useState(0);
  const foto = fotos[idx] || data?.img;

  const next = () => setIdx((i) => (i + 1) % Math.max(1, fotos.length));
  const prev = () =>
    setIdx((i) => (i - 1 + Math.max(1, fotos.length)) % Math.max(1, fotos.length));

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onBack?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  // Cerrar si se hace click fuera (exactamente en el backdrop)
  const onBackdropMouseDown = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onBack?.();
    },
    [onBack]
  );

  const precio =
    typeof data?.uf === "number"
      ? `Desde ${data.uf.toLocaleString("es-CL")} UF`
      : "Consultar precio";

  // Formulario de contacto
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.nombre || form.nombre.trim().length < 2)
      e.nombre = "Ingresa tu nombre (mín. 2 caracteres).";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || "");
    if (!emailOk) e.email = "Ingresa un correo válido.";
    if (form.telefono && form.telefono.replace(/\D/g, "").length < 7)
      e.telefono = "Teléfono muy corto (opcional).";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSending(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      track("generate_lead", {
        item_id: data?.id,
        item_name: data?.titulo,
        comuna: data?.comuna,
        origin: "contact_form",
        payload: { ...form },
      });
      setSent(true);
      setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
    } finally {
      setSending(false);
    }
  };

  const handleQuickLead = (origin) => {
    track("generate_lead", {
      item_id: data?.id,
      item_name: data?.titulo,
      comuna: data?.comuna,
      origin,
    });
    alert("Simulación: contacto enviado ✅");
  };

  if (!data) return null;

  return (
    <ModalPortal>
      <div className="modal__backdrop" onMouseDown={onBackdropMouseDown}>
        <motion.article
          className="modal"
          onMouseDown={(e) => e.stopPropagation()} // evita que mousedown en contenido burbujee al backdrop
          // ⬇️ Solo opacidad (sin y / sin scale) para no romper el centrado
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-label={`Ficha de ${data?.titulo ?? "proyecto"}`}
        >
          {/* Head */}
          <div className="modal__head">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="iconbtn" onClick={onBack} aria-label="Volver">
                ←
              </button>
              <div>
                <h3 style={{ margin: 0 }}>{data?.titulo}</h3>
                <div className="muted" style={{ fontSize: 13 }}>
                  {data?.comuna} · {data?.direccion || "Dirección no disponible"}
                </div>
              </div>
            </div>
            <div className="muted">{precio}</div>
          </div>

          {/* Imagen principal */}
          {foto && (
            <div style={{ position: "relative" }}>
              <img src={foto} alt={data?.titulo} className="modal__img" />
              {fotos.length > 1 && (
                <>
                  <button
                    className="iconbtn"
                    style={{ position: "absolute", left: 12, top: 12 }}
                    onClick={prev}
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>
                  <button
                    className="iconbtn"
                    style={{ position: "absolute", right: 12, top: 12 }}
                    onClick={next}
                    aria-label="Foto siguiente"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          )}

          {/* Cuerpo con scroll interno */}
          <div className="modal__body">
            {/* Thumbs */}
            {fotos.length > 1 && (
              <div
                className="thumbs"
                style={{
                  padding: "10px 0 0",
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                }}
              >
                {fotos.map((f, i) => (
                  <button
                    key={i}
                    className={`thumb ${i === idx ? "is-active" : ""}`}
                    onClick={() => setIdx(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={f}
                      alt={`thumb ${i + 1}`}
                      style={{
                        width: 72,
                        height: 50,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Columnas */}
            <div className="modal__cols" style={{ marginTop: 12 }}>
              <div style={{ gridColumn: "span 3" }}>
                <Section title="Resumen">
                  <ul className="bullets">
                    <li>{precio}</li>
                    <li>
                      {data?.dormitorios ?? "—"} dormitorios / {data?.banos ?? "—"} baños
                    </li>
                    <li>{data?.comuna ?? "—"}</li>
                    {data?.direccion && <li>{data.direccion}</li>}
                  </ul>
                </Section>

                {Array.isArray(data?.amenities) && data.amenities.length > 0 && (
                  <Section title="Amenidades">
                    <div className="chips">
                      {data.amenities.map((a, i) => (
                        <span className="chip" key={i}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                <Section title="Descripción">
                  <p className="muted">
                    Proyecto de muestra para el mock. Aquí iría el texto comercial
                    (metros, terminaciones, etapas, etc.).
                  </p>
                </Section>

                <Section title="Ubicación (referencial)">
                  <div className="mapbox">
                    <span className="muted">Mapa placeholder</span>
                  </div>
                </Section>
              </div>

              {/* Col derecha: Contacto */}
              <div>
                <Section title="Contacto">
                  {sent ? (
                    <div className="notice notice--ok">
                      ¡Gracias! Te contactaremos muy pronto.
                    </div>
                  ) : (
                    <form className="form" onSubmit={handleSubmit} noValidate>
                      <div className="form__row">
                        <label>Nombre</label>
                        <input
                          className={`input ${errors.nombre ? "is-invalid" : ""}`}
                          type="text"
                          value={form.nombre}
                          onChange={(e) =>
                            setForm({ ...form, nombre: e.target.value })
                          }
                          placeholder="Tu nombre"
                          required
                        />
                        {errors.nombre && (
                          <div className="error">{errors.nombre}</div>
                        )}
                      </div>

                      <div className="form__row">
                        <label>Correo</label>
                        <input
                          className={`input ${errors.email ? "is-invalid" : ""}`}
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          placeholder="nombre@correo.com"
                          required
                        />
                        {errors.email && (
                          <div className="error">{errors.email}</div>
                        )}
                      </div>

                      <div className="form__row">
                        <label>
                          Teléfono <span className="muted">(opcional)</span>
                        </label>
                        <input
                          className={`input ${errors.telefono ? "is-invalid" : ""}`}
                          type="tel"
                          value={form.telefono}
                          onChange={(e) =>
                            setForm({ ...form, telefono: e.target.value })
                          }
                          placeholder="+56 9 1234 5678"
                        />
                        {errors.telefono && (
                          <div className="error">{errors.telefono}</div>
                        )}
                      </div>

                      <div className="form__row">
                        <label>
                          Mensaje <span className="muted">(opcional)</span>
                        </label>
                        <textarea
                          className="input"
                          rows={3}
                          value={form.mensaje}
                          onChange={(e) =>
                            setForm({ ...form, mensaje: e.target.value })
                          }
                          placeholder="Cuéntanos qué te interesa del proyecto…"
                        />
                      </div>

                      <button className="btn btn--primary" disabled={sending}>
                        {sending ? "Enviando…" : "Enviar"}
                      </button>
                    </form>
                  )}

                  {!sent && (
                    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                      <button
                        className="btn btn--ghost"
                        onClick={() => handleQuickLead("cta_contactar")}
                      >
                        Solicitar información rápida
                      </button>
                      <button
                        className="btn btn--ghost"
                        onClick={() => handleQuickLead("cta_llamar")}
                      >
                        Llamar
                      </button>
                    </div>
                  )}
                </Section>

                <Section title="Compartir">
                  <div style={{ display: "grid", gap: 8 }}>
                    <button
                      className="btn btn--ghost"
                      onClick={() => navigator.clipboard.writeText(window.location.href)}
                      title="Copiar enlace"
                    >
                      Copiar enlace
                    </button>
                  </div>
                </Section>
              </div>
            </div>
          </div>

          {/* CTA inferior fija dentro del modal */}
          <div className="modal__cta">
            <button className="btn btn--ghost" onClick={onBack}>
              Cerrar
            </button>
            <button
              className="btn btn--primary"
              onClick={() => handleQuickLead("cta_fixed")}
            >
              Quiero que me contacten
            </button>
          </div>
        </motion.article>
      </div>
    </ModalPortal>
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
