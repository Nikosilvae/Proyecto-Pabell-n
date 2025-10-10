// src/components/FilterBar.jsx
import React from "react";

export default function FilterBar({
  rangosUF,
  dorms,
  comunas,
  selectedRange,
  setSelectedRange,
  selectedDorm,
  setSelectedDorm,
  selectedComuna,
  setSelectedComuna,
  orderBy,
  setOrderBy,
  // nuevos
  onlyFavs,
  setOnlyFavs,
  pageSize,
  setPageSize,
}) {
  return (
    <div className="filterbar">
      {/* Rango UF */}
      <select
        value={selectedRange?.id || ""}
        onChange={(e) => {
          const id = e.target.value;
          const r = rangosUF.find((x) => x.id === id) || null;
          setSelectedRange(r);
        }}
        aria-label="Precio (UF)"
      >
        <option value="">Precio (UF)</option>
        {rangosUF.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>

      {/* Dormitorios */}
      <select
        value={selectedDorm?.id || ""}
        onChange={(e) => {
          const id = e.target.value;
          const d = dorms.find((x) => x.id === id) || null;
          setSelectedDorm(d);
        }}
        aria-label="Dormitorios"
      >
        <option value="">Dormitorios</option>
        {dorms.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>

      {/* Comuna */}
      <select
        value={selectedComuna || ""}
        onChange={(e) => setSelectedComuna(e.target.value || null)}
        aria-label="Comuna"
      >
        <option value="">Comuna</option>
        {comunas.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Orden */}
      <select
        value={orderBy}
        onChange={(e) => setOrderBy(e.target.value)}
        aria-label="Ordenar"
      >
        <option value="relevancia">Ordenar</option>
        <option value="precio_asc">Precio: menor a mayor</option>
        <option value="precio_desc">Precio: mayor a menor</option>
        <option value="nombre">Nombre (A–Z)</option>
        <option value="dormitorios">Más dormitorios</option>
      </select>

      {/* Solo guardados */}
      <label
        htmlFor="onlyFavs"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
        className="btn btn--ghost"
      >
        <input
          id="onlyFavs"
          type="checkbox"
          checked={!!onlyFavs}
          onChange={(e) => setOnlyFavs(e.target.checked)}
        />
        {onlyFavs ? "★ Solo guardados" : "☆ Solo guardados"}
      </label>

      {/* Página: tamaño */}
      <select
        value={String(pageSize)}
        onChange={(e) => setPageSize(Number(e.target.value) || 12)}
        aria-label="Mostrar por página"
      >
        <option value="8">Mostrar: 8</option>
        <option value="12">Mostrar: 12</option>
        <option value="16">Mostrar: 16</option>
        <option value="24">Mostrar: 24</option>
      </select>
    </div>
  );
}
