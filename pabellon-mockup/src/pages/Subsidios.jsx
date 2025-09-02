// src/pages/Subsidios.jsx
import React from "react";
import Accordion from "../components/Accordion";

const FAQ = [
  {
    q: "¿Qué es el DS1?",
    a: "Subsidio para compra de vivienda nueva o usada para sectores medios. Exige ahorro mínimo y tope de precio, con tramos según ingresos."
  },
  {
    q: "¿Qué es el DS19?",
    a: "Programa de Integración Social y Territorial. Proyectos con cupos de subsidio integrados; asignación según requisitos y postulación."
  },
  {
    q: "¿Puedo usar crédito hipotecario más subsidio?",
    a: "Sí. El subsidio complementa tu pie y/o financiamiento. Depende del banco y del tramo del programa."
  },
  {
    q: "¿Cómo postulo?",
    a: "En los llamados del MINVU. Reúne ahorro mínimo, RSH actualizado y documentos; postula en línea o presencial según el llamado."
  },
];

export default function Subsidios() {
  return (
    <>
      {/* Hero */}
      <section
        className="hero hero--subsidios"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1502005229762-cf1b2da7c52f?q=80&w=2000&auto=format&fit=crop)",
        }}
      >
        <div className="hero__overlay">
          <h2>Subsidios Habitacionales</h2>
          <p className="muted" style={{ marginTop: 6 }}>
            Conoce programas como DS1 y DS19 y cómo postular según tu perfil.
          </p>
          <div style={{ marginTop: 12 }}>
            <a className="btn btn--light" href="#programas">Ver programas</a>
            <a className="btn btn--primary" style={{ marginLeft: 8 }} href="#faq">Preguntas frecuentes</a>
          </div>
        </div>
      </section>

      {/* Perfiles / atajos */}
      <section className="container section">
        <div className="section__head">
          <h3>¿Cuál es tu perfil?</h3>
        </div>
        <div className="grid grid--4">
          {[
            { t: "Primera vivienda", d: "Ahorro mínimo y tope de precio.", link: "#programas" },
            { t: "Familia con hijos", d: "Evaluar DS1 Tramo 2 o DS19 según comuna.", link: "#programas" },
            { t: "Pareja joven", d: "Revisa requisitos de ahorro y RSH.", link: "#programas" },
            { t: "Mejorar vivienda", d: "Programas de mejoramiento (referencial).", link: "#programas" },
          ].map((c, i) => (
            <article key={i} className="card card--hover card--clickable" onClick={()=>window.location.hash="programas"}>
              <div className="card__body">
                <h4 className="card__title">{c.t}</h4>
                <p className="muted">{c.d}</p>
                <div style={{ marginTop: 8 }}>
                  <span className="chip">Ver opciones →</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Programas */}
      <section id="programas" className="container section">
        <div className="section__head">
          <h3>Programas vigentes</h3>
        </div>

        <div className="grid grid--4">
          {/* DS1 */}
          <article className="card card--hover">
            <div className="card__imgwrap">
              <img
                className="card__img"
                alt="DS1"
                src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop"
              />
              <div className="badge">DS1</div>
            </div>
            <div className="card__body">
              <h4 className="card__title">DS1 — Sectores medios</h4>
              <p className="muted">Compra de vivienda nueva o usada, con ahorro mínimo y tramos según ingresos.</p>
              <ul className="bullets">
                <li>Ahorro mínimo exigido</li>
                <li>Tope de precio por tramo</li>
                <li>Postulación en llamados</li>
              </ul>
              <div style={{ marginTop: 8 }}>
                <a className="btn btn--ghost" href="#faq">Requisitos</a>
              </div>
            </div>
          </article>

          {/* DS19 */}
          <article className="card card--hover">
            <div className="card__imgwrap">
              <img
                className="card__img"
                alt="DS19"
                src="https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop"
              />
              <div className="badge">DS19</div>
            </div>
            <div className="card__body">
              <h4 className="card__title">DS19 — Integración Social</h4>
              <p className="muted">Proyectos con cupos de subsidio integrados, por comuna y disponibilidad.</p>
              <ul className="bullets">
                <li>Asignación en el proyecto</li>
                <li>Requisitos de RSH</li>
                <li>Compatibilidad con crédito</li>
              </ul>
              <div style={{ marginTop: 8 }}>
                <a className="btn btn--ghost" href="#faq">Requisitos</a>
              </div>
            </div>
          </article>

          {/* Enlaces útiles */}
          <article className="card card--hover">
            <div className="card__imgwrap">
              <img
                className="card__img"
                alt="Guías"
                src="https://images.unsplash.com/photo-1465310477141-6fb93167a273?q=80&w=1200&auto=format&fit=crop"
              />
              <div className="badge">Guías</div>
            </div>
            <div className="card__body">
              <h4 className="card__title">Guías y documentos</h4>
              <p className="muted">Revisa los pasos para postular, documentos y plazos.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="chip">Ahorro</span>
                <span className="chip">RSH</span>
                <span className="chip">Llamados</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <a className="btn btn--ghost" href="#faq">Ver más</a>
              </div>
            </div>
          </article>

          {/* Simulador (placeholder) */}
          <article className="card card--hover">
            <div className="card__imgwrap">
              <img
                className="card__img"
                alt="Simulador"
                src="https://images.unsplash.com/photo-1553729784-e91953dec042?q=80&w=1200&auto=format&fit=crop"
              />
              <div className="badge">Simulador</div>
            </div>
            <div className="card__body">
              <h4 className="card__title">Calcula tu subsidio</h4>
              <p className="muted">Ingresa ingreso y ahorro y obtén una estimación referencial.</p>
              <button className="btn btn--primary" onClick={()=>alert("Simulador en construcción")}>
                Comenzar
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container section">
        <div className="section__head">
          <h3>Preguntas frecuentes</h3>
        </div>
        <Accordion items={FAQ} />
      </section>
    </>
  );
}
