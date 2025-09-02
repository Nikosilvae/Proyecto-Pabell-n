// src/Mockuppabellon.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PROYECTOS, COMUNAS, RANGOS_UF, DORMS } from "./data/proyectos";
import SearchBar from "./components/SearchBar";
import FilterBar from "./components/FilterBar";
import FichaProyecto from "./components/FichaProyecto";
import { track } from "./utils/tracking";

// Hook: búsqueda + filtros + orden + paginación + favoritos
function useBuscar(proyectosInput) {
  const dataset = useMemo(
    () => (Array.isArray(proyectosInput) ? proyectosInput : []),
    [proyectosInput]
  );

  // filtros
  const [query, setQuery] = useState("");
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedDorm, setSelectedDorm] = useState(null);
  const [selectedComuna, setSelectedComuna] = useState(null);

  // orden
  const [sort, setSort] = useState("relevance");

  // paginación
  const pageSize = 12;
  const [page, setPage] = useState(1);

  // favoritos (persistentes)
  const [favs, setFavs] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("favs") || "[]");
      return new Set(Array.isArray(raw) ? raw : []);
    } catch {
      return new Set();
    }
  });
  const toggleFav = useCallback((id) => {
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("favs", JSON.stringify([...next]));
      return next;
    });
  }, []);
  const isFav = useCallback((id) => favs.has(id), [favs]);
  const [onlyFavs, setOnlyFavs] = useState(false);

  // leer estado desde URL
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("q") || "";
    const r = sp.get("r");
    const d = sp.get("d");
    const c = sp.get("c");
    const s = sp.get("s");
    const p = Number(sp.get("p") || "1");
    const f = sp.get("f") === "1";

    setQuery(q);
    if (r) {
      const foundR = RANGOS_UF.find((x) => x.id === r);
      if (foundR) setSelectedRange(foundR);
    }
    if (d) {
      const foundD = DORMS.find((x) => x.id === d);
      if (foundD) setSelectedDorm(foundD);
    }
    if (c) setSelectedComuna(c);
    if (s) setSort(s);
    if (!Number.isNaN(p) && p > 0) setPage(p);
    setOnlyFavs(f);
  }, []);

  // escribir estado a URL
  useEffect(() => {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (selectedRange) sp.set("r", selectedRange.id);
    if (selectedDorm) sp.set("d", selectedDorm.id);
    if (selectedComuna) sp.set("c", selectedComuna);
    if (sort && sort !== "relevance") sp.set("s", sort);
    if (page && page > 1) sp.set("p", String(page));
    if (onlyFavs) sp.set("f", "1");
    const qs = sp.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [query, selectedRange, selectedDorm, selectedComuna, sort, page, onlyFavs]);

  // reset a página 1 al cambiar filtros/orden/búsqueda/favs
  useEffect(() => {
    setPage(1);
  }, [query, selectedRange, selectedDorm, selectedComuna, sort, onlyFavs]);

  // filtrado (incluye "solo guardados")
  const filtered = useMemo(() => {
    return dataset.filter((raw) => {
      const p = raw && typeof raw === "object" ? raw : {};
      const titulo = String(p.titulo ?? "");
      const comuna = String(p.comuna ?? "");

      const textOk = (titulo + " " + comuna)
        .toLowerCase()
        .includes((query || "").toLowerCase());

      const ufOk = selectedRange
        ? typeof p.uf === "number" &&
          p.uf >= selectedRange.min &&
          p.uf <= selectedRange.max
        : true;

      const dOk = selectedDorm
        ? selectedDorm.value === 3
          ? (p.dormitorios || 0) >= 3
          : (p.dormitorios || 0) === selectedDorm.value
        : true;

      const cOk = selectedComuna ? comuna === selectedComuna : true;

      const favOk = onlyFavs ? favs.has(p.id) : true;

      return textOk && ufOk && dOk && cOk && favOk;
    });
  }, [dataset, query, selectedRange, selectedDorm, selectedComuna, onlyFavs, favs]);

  // orden → results
  const results = useMemo(() => {
    const arr = [...filtered];

    const cmpUF = (a, b, dir) => {
      const av = typeof a.uf === "number";
      const bv = typeof b.uf === "number";
      if (av && !bv) return -1;
      if (!av && bv) return 1;
      if (!av && !bv) return 0;
      return dir === "asc" ? a.uf - b.uf : b.uf - a.uf;
    };

    switch (sort) {
      case "uf_asc":
        arr.sort((a, b) => cmpUF(a, b, "asc"));
        break;
      case "uf_desc":
        arr.sort((a, b) => cmpUF(a, b, "desc"));
        break;
      case "dorm_desc":
        arr.sort((a, b) => (b.dormitorios || 0) - (a.dormitorios || 0));
        break;
      case "title_az":
        arr.sort((a, b) =>
          String(a.titulo || "").localeCompare(String(b.titulo || ""), "es")
        );
        break;
      default:
        // relevance: mantiene orden original
        break;
    }
    return arr;
  }, [filtered, sort]);

  // paginación (slice)
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, page, pageSize]);

  // tracking de listado
  useEffect(() => {
    track("view_item_list", {
      list_id: "search_results",
      total_results: filtered.length,
      page,
      only_favorites: onlyFavs,
      sort,
    });
  }, [filtered.length, page, onlyFavs, sort]);

  // autosuggest
  const getSuggestions = (q) => {
    if (!q) return [];
    const ql = String(q).toLowerCase();
    const comunas = COMUNAS.filter((c) => String(c).toLowerCase().includes(ql))
      .slice(0, 5)
      .map((c) => ({ type: "comuna", text: c }));
    const proyectosHits = dataset
      .filter((p) => String(p.titulo || "").toLowerCase().includes(ql))
      .slice(0, 5)
      .map((p) => ({ type: "proyecto", text: p.titulo, id: p.id }));
    return [...comunas, ...proyectosHits];
  };

  const applySuggestion = (s) => {
    if (!s) return;
    if (s.type === "comuna") {
      setSelectedComuna(s.text);
      setQuery("");
    } else if (s.type === "proyecto") {
      setQuery(s.text);
    }
  };

  return {
    // filtros
    query, setQuery,
    selectedRange, setSelectedRange,
    selectedDorm, setSelectedDorm,
    selectedComuna, setSelectedComuna,

    // favoritos
    favs, isFav, toggleFav,
    onlyFavs, setOnlyFavs,

    // orden
    sort, setSort,

    // datos
    filtered,
    results,
    pageItems,

    // paginación
    page, setPage,
    totalPages,

    // autosuggest
    autosuggest: { getSuggestions, apply: applySuggestion },
  };
}

function MockupPabellon() {
  const dataset = useMemo(
    () => (Array.isArray(PROYECTOS) ? PROYECTOS : []),
    []
  );

  const [seleccion, setSeleccion] = useState(null);
  const buscar = useBuscar(dataset);

  // tracking de ficha
  useEffect(() => {
    if (seleccion) {
      track("view_item", {
        item_id: seleccion.id,
        item_name: seleccion.titulo,
        comuna: seleccion.comuna,
        price_from_uf: seleccion.uf,
      });
    }
  }, [seleccion]);

  // bloquea scroll del fondo cuando la ficha está abierta
  useEffect(() => {
    document.body.classList.toggle("no-scroll", !!seleccion);
    return () => document.body.classList.remove("no-scroll");
  }, [seleccion]);

  return (
    <div className="page">
      {/* Header y Footer van en App.js */}
      {seleccion ? (
        <FichaProyecto data={seleccion} onBack={() => setSeleccion(null)} />
      ) : (
        <>
          <section
            className="hero hero--desktop"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2000&auto=format&fit=crop)",
            }}
          >
            <div className="hero__overlay">
              <h2>Encuentra tu próximo hogar</h2>
              <SearchBar
                query={buscar.query}
                onChange={buscar.setQuery}
                getSuggestions={buscar.autosuggest.getSuggestions}
                applySuggestion={buscar.autosuggest.apply}
                onSelect={{
                  // compat API antigua
                  getSuggestions: buscar.autosuggest.getSuggestions,
                  apply: buscar.autosuggest.apply,
                }}
              />
              <p className="muted" style={{ marginTop: 8 }}>
                Tip: escribe una <b>comuna</b> o el nombre de un <b>proyecto</b>
              </p>
            </div>
          </section>

          <section className="container section">
            <FilterBar
              rangosUF={RANGOS_UF}
              dorms={DORMS}
              comunas={COMUNAS}
              selectedRange={buscar.selectedRange}
              setSelectedRange={buscar.setSelectedRange}
              selectedDorm={buscar.selectedDorm}
              setSelectedDorm={buscar.setSelectedDorm}
              selectedComuna={buscar.selectedComuna}
              setSelectedComuna={buscar.setSelectedComuna}
              sort={buscar.sort}
              setSort={buscar.setSort}
              onlyFavs={buscar.onlyFavs}
              setOnlyFavs={buscar.setOnlyFavs}
            />

            <div className="section__head">
              <h3>Resultados</h3>
              <span className="muted">
                {buscar.filtered.length} de {dataset.length} proyectos
              </span>
            </div>

            <div className="grid grid--4">
              {buscar.pageItems.map((p, i) => (
                <motion.article
                  key={p.id}
                  className="card card--hover"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div
                    className="card__imgwrap"
                    onClick={() => {
                      track("select_item", {
                        item_id: p.id,
                        item_name: p.titulo,
                        position: i + 1,
                        list_id: "search_results",
                      });
                      setSeleccion(p);
                    }}
                  >
                    <img
                      src={p.img}
                      alt={`Foto de ${p.titulo}`}
                      className="card__img"
                    />
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
                    <div
                      className="card__actions"
                      style={{ display: "flex", gap: 8 }}
                    >
                      <button
                        className="btn btn--primary"
                        onClick={() => {
                          track("select_item", {
                            item_id: p.id,
                            item_name: p.titulo,
                            position: i + 1,
                            list_id: "search_results",
                          });
                          setSeleccion(p);
                        }}
                      >
                        Ver ficha
                      </button>
                      <button
                        className="btn btn--ghost"
                        onClick={() => buscar.toggleFav(p.id)}
                        title={
                          buscar.isFav(p.id) ? "Quitar de guardados" : "Guardar"
                        }
                        aria-pressed={buscar.isFav(p.id)}
                      >
                        {buscar.isFav(p.id) ? "★ Guardado" : "☆ Guardar"}
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}

              {buscar.pageItems.length === 0 && (
                <div className="empty">
                  <p>No encontramos resultados con esos filtros.</p>
                </div>
              )}
            </div>

            {/* Paginación */}
            <div className="pager">
              <button
                className="btn btn--ghost"
                disabled={buscar.page <= 1}
                onClick={() => buscar.setPage((p) => Math.max(1, p - 1))}
              >
                ← Anterior
              </button>
              <span className="pager__info">
                Página {buscar.page} de {buscar.totalPages}
              </span>
              <button
                className="btn btn--ghost"
                disabled={buscar.page >= buscar.totalPages}
                onClick={() =>
                  buscar.setPage((p) => Math.min(buscar.totalPages, p + 1))
                }
              >
                Siguiente →
              </button>
            </div>
          </section>

          <section className="cta">
            <div className="container cta__inner">
              <h3>Beneficios exclusivos en Pabellón.cl</h3>
              <p>
                Simulador de créditos, subsidios y visitas virtuales para decidir
                mejor.
              </p>
              <button className="btn btn--light">Explorar beneficios</button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default MockupPabellon;
