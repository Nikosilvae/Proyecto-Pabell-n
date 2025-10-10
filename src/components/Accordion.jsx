// src/components/Accordion.jsx
import React, { useState } from "react";

export default function Accordion({ items = [] }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="faq">
      {items.map((it, i) => (
        <div key={i} className="faq__item">
          <button
            className="faq__q"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {it.q}
            <span className="faq__icon">{open === i ? "–" : "+"}</span>
          </button>
          {open === i && <div className="faq__a">{it.a}</div>}
        </div>
      ))}
    </div>
  );
}
