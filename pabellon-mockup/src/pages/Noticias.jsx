// src/pages/Noticias.jsx
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const NEWS = [
  { id: 1, titulo: "Tendencias 2025 en vivienda", fecha: "2025-08-10", resumen: "Panorama del mercado y tasas." },
  { id: 2, titulo: "Subsidios: nuevos llamados", fecha: "2025-07-28", resumen: "Fechas y requisitos principales." },
  { id: 3, titulo: "Barrios emergentes en Santiago", fecha: "2025-07-05", resumen: "Zonas con mayor plusvalía." },
];

export default function Noticias() {
  return (
    <div className="page">
      <Header />
      <section className="container section">
        <div className="section__head">
          <h3>Noticias</h3>
          <span className="muted">{NEWS.length} artículos</span>
        </div>

        <div className="grid grid--4">
          {NEWS.map((n) => (
            <article key={n.id} className="card card--hover">
              <div className="card__body">
                <h4 className="card__title">{n.titulo}</h4>
                <p className="muted">{new Date(n.fecha).toLocaleDateString("es-CL")}</p>
                <p>{n.resumen}</p>
                <div className="card__actions">
                  <a href="#!" className="btn btn--primary">Leer más</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
