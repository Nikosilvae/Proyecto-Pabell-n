// src/pages/AyudaPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Accordion from '../components/Accordion'; // Reutilizamos el componente existente

const preguntasFrecuentes = [
  {
    q: '¿Qué es un subsidio habitacional?',
    a: 'Es una ayuda económica que entrega el Estado para facilitar la compra de una vivienda. Existen diferentes tipos de subsidios, cada uno con sus propios requisitos.'
  },
  {
    q: '¿Cómo puedo guardar un proyecto en mis Favoritos?',
    a: 'Simplemente haz clic en el botón con el ícono de estrella (☆ Guardar) que aparece en cada tarjeta de proyecto. Los encontrarás todos juntos en la sección "Favoritos".'
  },
  {
    q: '¿El simulador de crédito es una oferta formal?',
    a: 'No, el simulador es una herramienta referencial para estimar un dividendo. La aprobación final, la tasa y los costos asociados dependen de la evaluación de cada entidad financiera.'
  },
  {
    q: '¿Cómo puedo publicar mi propiedad en Pabellon.cl?',
    a: 'Dirígete a la sección "Publicar Propiedad" en el menú, completa el formulario con los datos de tu vivienda y envíalo para revisión. Nuestro equipo lo validará y se pondrá en contacto contigo.'
  }
];

export default function AyudaPage() {
  return (
    <motion.div 
      className="container section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="section__head" style={{justifyContent: 'center', textAlign: 'center', flexDirection: 'column'}}>
        <h2>Ayuda y Preguntas Frecuentes</h2>
        <p className="muted">Encuentra respuestas a las dudas más comunes.</p>
      </div>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Accordion items={preguntasFrecuentes} />
      </div>
    </motion.div>
  );
}