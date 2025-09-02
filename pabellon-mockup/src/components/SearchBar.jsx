// src/components/SearchBar.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

export default function SearchBar({
  // texto y cambio
  query = "",
  onChange = () => {},

  // API nueva (props separadas)
  getSuggestions,          // opcional
  applySuggestion,         // opcional

  // API antigua (objeto): { getSuggestions, apply }
  onSelect,                // opcional
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);

  // Normaliza funciones para soportar ambas APIs
  const getSugs = useCallback(
    (q) => {
      try {
        if (typeof getSuggestions === "function") return getSuggestions(q) || [];
        if (onSelect && typeof onSelect.getSuggestions === "function")
          return onSelect.getSuggestions(q) || [];
      } catch {}
      return [];
    },
    [getSuggestions, onSelect]
  );

  const applySugg = useCallback(
    (s) => {
      try {
        if (typeof applySuggestion === "function") return applySuggestion(s);
        if (onSelect && typeof onSelect.apply === "function") return onSelect.apply(s);
      } catch {}
    },
    [applySuggestion, onSelect]
  );

  // cerrar al hacer click fuera
  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // obtener sugerencias de forma segura
  const suggestions = useMemo(() => {
    const arr = getSugs(query);
    return Array.isArray(arr) ? arr : [];
  }, [query, getSugs]);

  // si cambia la cantidad, reubica el índice activo
  useEffect(() => {
    if (active >= suggestions.length) setActive(0);
  }, [suggestions.length, active]);

  const pick = (s) => {
    applySugg(s);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && suggestions[active]) {
        e.preventDefault();
        pick(suggestions[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="searchbar" ref={boxRef}>
      <input
        value={query}
        placeholder="Busca por comuna o proyecto…"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {open && suggestions.length > 0 && (
        <div className="suggest" role="listbox">
          {suggestions.map((s, i) => (
            <div
              key={`${s.type}-${s.text}-${i}`}
              className={`suggest__item ${i === active ? "is-active" : ""}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()} // evita blur antes del click
              onClick={() => pick(s)}
            >
              <span className={`tag tag--${s.type}`}>{s.type}</span>
              <span className="suggest__text">{s.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
