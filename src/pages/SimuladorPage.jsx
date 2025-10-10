// src/pages/SimuladorPage.jsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function SimuladorPage() {
  const [valorUF, setValorUF] = useState(36800); // Valor de la UF (puedes actualizarlo)
  const [precioPropiedad, setPrecioPropiedad] = useState(3000); // en UF
  const [piePorcentaje, setPiePorcentaje] = useState(20); // en %
  const [tasaAnual, setTasaAnual] = useState(4.5); // en %
  const [plazoAnos, setPlazoAnos] = useState(25); // en Años

  const calculos = useMemo(() => {
    const pie = (precioPropiedad * piePorcentaje) / 100;
    const montoCredito = precioPropiedad - pie;
    const tasaMensual = (tasaAnual / 100) / 12;
    const plazoMeses = plazoAnos * 12;

    if (montoCredito <= 0 || tasaMensual <= 0 || plazoMeses <= 0) {
      return { dividendoUF: 0, dividendoCLP: 0, montoCreditoUF: 0 };
    }

    // Fórmula del dividendo (cuota fija)
    const dividendo = (montoCredito * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses));
    
    return {
      montoCreditoUF: montoCredito,
      dividendoUF: dividendo,
      dividendoCLP: dividendo * valorUF,
    };
  }, [precioPropiedad, piePorcentaje, tasaAnual, plazoAnos, valorUF]);

  return (
    <motion.div 
      className="container section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="section__head" style={{justifyContent: 'center', textAlign: 'center', flexDirection: 'column'}}>
        <h2>Simulador de Crédito Hipotecario</h2>
        <p className="muted">Calcula el dividendo aproximado para tu próximo hogar.</p>
      </div>

      <div className="simulador-layout">
        {/* Columna de Inputs */}
        <div className="simulador-form">
          <div className="form-group">
            <label>Precio de la Propiedad (UF)</label>
            <input type="number" className="input" value={precioPropiedad} onChange={e => setPrecioPropiedad(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Pie ({piePorcentaje}%)</label>
            <input type="range" min="10" max="50" step="5" value={piePorcentaje} onChange={e => setPiePorcentaje(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Tasa de Interés Anual (%)</label>
            <input type="number" step="0.1" className="input" value={tasaAnual} onChange={e => setTasaAnual(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Plazo (Años)</label>
            <input type="number" max="30" className="input" value={plazoAnos} onChange={e => setPlazoAnos(Number(e.target.value))} />
          </div>
        </div>

        {/* Columna de Resultados */}
        <div className="simulador-resultado">
          <h4>Resumen de tu simulación</h4>
          <div className="resultado-item">
            <span>Monto del crédito</span>
            <strong>{calculos.montoCreditoUF.toLocaleString('es-CL', { maximumFractionDigits: 2 })} UF</strong>
          </div>
          <div className="resultado-item dividendo">
            <span>Dividendo Mensual Aprox.</span>
            <strong>{calculos.dividendoUF.toLocaleString('es-CL', { maximumFractionDigits: 2 })} UF</strong>
            <small>${calculos.dividendoCLP.toLocaleString('es-CL', { maximumFractionDigits: 0 })} CLP</small>
          </div>
          <p className="muted" style={{fontSize: '0.8rem', marginTop: '1rem'}}>
            *Cálculo referencial. No incluye seguros ni otros costos asociados. Valor de la UF: ${valorUF.toLocaleString('es-CL')}.
          </p>
        </div>
      </div>
    </motion.div>
  );
}