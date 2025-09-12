// src/data/subsidios.js
export const SUBSIDIOS = [
  {
    id: "s1",
    slug: "ds1-tramo-2",
    nombre: "Subsidio DS1 Tramo 2",
    tipo: "DS1",
    estado: "Abierto",
    region: "RM",
    imagen: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop",
    bajada: "Apoyo para familias que buscan su primera vivienda con ahorro previo.",
    requisitos: [
      "Ahorro mínimo exigido.",
      "Estar en Registro Social de Hogares (RSH).",
      "Sin propiedad a tu nombre."
    ],
    beneficio: [
      "Aporte estatal para compra de vivienda nueva o usada.",
      "Complementable con crédito hipotecario."
    ],
    postulacion: {
      inicio: "2025-09-01",
      fin: "2025-09-30"
    },
    link_oficial: "https://www.minvu.cl/programas/ds1/",
  },
  {
    id: "s2",
    slug: "ds49-fondo-solidario",
    nombre: "Subsidio DS49 (Fondo Solidario)",
    tipo: "DS49",
    estado: "Próximo",
    region: "RM",
    imagen: "https://images.unsplash.com/photo-1505691723518-36a5ac3b2a02?q=80&w=1200&auto=format&fit=crop",
    bajada: "Para familias sin vivienda que no cuenten con crédito hipotecario.",
    requisitos: [
      "RSH en percentil exigido por el llamado.",
      "Ahorro mínimo según bases del proceso.",
    ],
    beneficio: [
      "Financia una parte importante del valor de la vivienda.",
      "Orientado a proyectos habitacionales."
    ],
    postulacion: {
      inicio: "2025-10-10",
      fin: "2025-10-25"
    },
    link_oficial: "https://www.minvu.cl/programas/ds49/",
  },
  {
    id: "s3",
    slug: "subsidio-arriendo",
    nombre: "Subsidio de Arriendo",
    tipo: "Arriendo",
    estado: "Cerrado",
    region: "V",
    imagen: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?q=80&w=1200&auto=format&fit=crop",
    bajada: "Aporte temporal para pagar parte del arriendo.",
    requisitos: [
      "Edad y tramo RSH según llamado.",
      "Contrato de arriendo formal al adjudicar."
    ],
    beneficio: [
      "Aporte mensual por un período determinado.",
      "Posibilidad de usar en distintas comunas/regiones."
    ],
    postulacion: {
      inicio: "2025-05-01",
      fin: "2025-06-15"
    },
    link_oficial: "https://www.minvu.cl/programas/subsidio-de-arriendo/",
  },
  {
    id: "s4",
    slug: "ds19-integracion-social",
    nombre: "DS19 Integración Social",
    tipo: "DS19",
    estado: "Abierto",
    region: "VIII",
    imagen: "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop",
    bajada: "Proyectos con cuotas de integración social y precios accesibles.",
    requisitos: [
      "RSH y tope de ingresos según bases.",
      "Ahorro mínimo y no tener vivienda."
    ],
    beneficio: [
      "Acceso a viviendas en proyectos integrados.",
      "Subsidio según tramo y localización."
    ],
    postulacion: {
      inicio: "2025-08-20",
      fin: "2025-09-20"
    },
    link_oficial: "https://www.minvu.cl/programas/ds19/",
  }
];
