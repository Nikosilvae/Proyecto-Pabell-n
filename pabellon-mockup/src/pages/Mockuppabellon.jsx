import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import SearchBar from '../components/SearchBar';
import FilterBar from "../components/FilterBar";
import FichaProyecto from "../components/FichaProyecto";
import CardSlider from "../components/CardSlider";
import { getProjectFavs, toggleProjectFav } from "../utils/favs";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper';
import 'swiper/swiper-bundle.min.css';

// ... (La función useBuscar no cambia)
function useBuscar(proyectosInput, filterOptions) {
    const dataset = useMemo(() => (Array.isArray(proyectosInput) ? proyectosInput : []), [proyectosInput]);
    const [query, setQuery] = useState("");
    const [selectedRange, setSelectedRange] = useState(null);
    const [selectedDorm, setSelectedDorm] = useState(null);
    const [selectedComuna, setSelectedComuna] = useState(null);
    const [sort, setSort] = useState("relevance");
    const [page, setPage] = useState(1);
    const [onlyFavs, setOnlyFavs] = useState(false);
    const pageSize = 12;
    const filtered = useMemo(() => {
        const currentFavs = getProjectFavs();
        return dataset.filter(p => {
        const textOk = `${p.titulo} ${p.comuna}`.toLowerCase().includes((query || "").toLowerCase());
        const ufOk = !selectedRange || (typeof p.uf === 'number' && p.uf >= selectedRange.min_uf && p.uf <= selectedRange.max_uf);
        const dOk = !selectedDorm || (selectedDorm.operador === '>=' ? p.dormitorios >= selectedDorm.valor : p.dormitorios == selectedDorm.valor);
        const cOk = !selectedComuna || p.comuna === selectedComuna;
        const favOk = !onlyFavs || currentFavs.has(p.id);
        return textOk && ufOk && dOk && cOk && favOk;
        });
    }, [dataset, query, selectedRange, selectedDorm, selectedComuna, onlyFavs]);
    const results = useMemo(() => [...filtered], [filtered, sort]);
    const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
    const pageItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        return results.slice(start, start + pageSize);
    }, [results, page, pageSize]);
    const getSuggestions = (q) => {
        if (!q) return [];
        const ql = q.toLowerCase();
        const comunas = (filterOptions.comunas || []).filter(c => c.toLowerCase().includes(ql)).slice(0, 5).map(c => ({ type: "comuna", text: c }));
        const proyectosHits = dataset.filter(p => p.titulo.toLowerCase().includes(ql)).slice(0, 5).map(p => ({ type: "proyecto", text: p.titulo, id: p.id }));
        return [...comunas, ...proyectosHits];
    };
    const applySuggestion = (s) => {
        if (s.type === "comuna") setSelectedComuna(s.text);
        else if (s.type === "proyecto") setQuery(s.text);
    };
    return { query, setQuery, selectedRange, setSelectedRange, selectedDorm, setSelectedDorm, selectedComuna, setSelectedComuna, sort, setSort, onlyFavs, setOnlyFavs, filtered, results, pageItems, page, setPage, totalPages, autosuggest: { getSuggestions, apply: applySuggestion } };
}


function MockupPabellon() {
  const [proyectos, setProyectos] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ comunas: [], rangosUF: [], dorms: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seleccion, setSeleccion] = useState(null);
  const [favs, setFavs] = useState(() => getProjectFavs());

  useEffect(() => {
    const refreshFavs = () => setFavs(getProjectFavs());
    window.addEventListener("favsChanged", refreshFavs);
    return () => window.removeEventListener("favsChanged", refreshFavs);
  }, []);
  
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('https://dev.pabellon.cl/api/api.php?recurso=proyectos').then(res => res.json()),
      fetch('https://dev.pabellon.cl/api/api.php?recurso=comunas').then(res => res.json()),
      fetch('https://dev.pabellon.cl/api/api.php?recurso=rangos_uf').then(res => res.json()),
      fetch('https://dev.pabellon.cl/api/api.php?recurso=filtros_dorms').then(res => res.json()),
      fetch('https://dev.pabellon.cl/api/api.php?recurso=proyectos_destacados').then(res => res.json())
    ])
    .then(([dataProyectos, dataComunas, dataRangos, dataDorms, dataDestacados]) => {
      const proyectosConNumeros = (dataProyectos || []).map(p => ({ ...p, uf: p.uf ? parseFloat(p.uf) : null, dormitorios: p.dormitorios ? parseInt(p.dormitorios, 10) : 0, banos: p.banos ? parseInt(p.banos, 10) : 0 }));
      setProyectos(proyectosConNumeros);
      setDestacados(dataDestacados || []);
      setFilterOptions({ comunas: dataComunas || [], rangosUF: dataRangos || [], dorms: dataDorms || [] });
    })
    .catch(err => setError("No se pudieron cargar los datos de la página."))
    .finally(() => setLoading(false));
  }, []);

  const buscar = useBuscar(proyectos, filterOptions);
  const handleToggleFav = (e, projectId) => { e.stopPropagation(); toggleProjectFav(projectId); };

  if (loading) return <div className="container section"><p className="muted">Cargando datos...</p></div>;
  if (error) return <div className="container section"><p style={{ color: 'red' }}><strong>Error:</strong> {error}</p></div>;

  return (
    <>
      <section 
        className="hero" // Mantenemos la clase por si acaso, pero los estilos inline son los que mandan
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8rem 2rem',
          overflow: 'hidden',
          backgroundColor: '#f3f4f6'
        }}
      >
        {destacados.length > 0 && (
          <Swiper
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
            modules={[Autoplay, EffectFade]}
            effect="fade"
            loop={true}
            allowTouchMove={false}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
          >
            {destacados.map((proyecto) => (
              <SwiperSlide key={proyecto.id}>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${proyecto.img})`
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        <div 
          className="hero__overlay"
          style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: 'rgba(17, 24, 39, 0.7)',
            padding: '2.5rem 3rem',
            borderRadius: '16px',
            maxWidth: '750px',
            width: '100%',
            textAlign: 'center'
          }}
        >
          <h2 style={{marginTop: 0, marginBottom: '1.5rem', fontSize: '3rem', color: '#fff'}}>
            Encuentra tu próximo hogar
          </h2>
          <SearchBar 
            query={buscar.query} 
            onChange={buscar.setQuery} 
            getSuggestions={buscar.autosuggest.getSuggestions} 
            applySuggestion={buscar.autosuggest.apply} 
          />
        </div>
      </section>

      <section className="container section">
        <FilterBar {...buscar} rangosUF={filterOptions.rangosUF} dorms={filterOptions.dorms} comunas={filterOptions.comunas} />
        <div className="section__head">
            <h3>Resultados</h3>
            <span>{buscar.filtered.length} de {proyectos.length} proyectos</span>
        </div>
        <div className="grid grid--4">
          {buscar.pageItems.map((p) => (
            <motion.article key={p.id} className="card">
              <div className="card__imgwrap" onClick={() => setSeleccion(p)}>
                <CardSlider images={p.fotos} mainImage={p.img} title={p.titulo} />
              </div>
              <div className="card__body">
                <h4 className="card__title">{p.titulo}</h4>
                <p className="muted">{p.comuna} · {p.dormitorios}D/{p.banos}B</p>
                <div className="card__actions" style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn--primary" onClick={() => setSeleccion(p)}>Ver ficha</button>
                  <button className="btn btn--ghost" onClick={(e) => handleToggleFav(e, p.id)} aria-pressed={favs.has(p.id)}>
                    {favs.has(p.id) ? "★ Guardado" : "☆ Guardar"}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
      {seleccion && <FichaProyecto data={seleccion} onBack={() => setSeleccion(null)} />}
    </>
  );
}
export default MockupPabellon;