// src/data/proyectos.js

export const COMUNAS = [
  "Ñuñoa", "La Florida", "Providencia", "Santiago Centro",
  "Maipú", "Las Condes", "Puente Alto", "Independencia"
];

export const RANGOS_UF = [
  { id: "r1", label: "≤ 2.500 UF",   min: 0,    max: 2500 },
  { id: "r2", label: "2.501–3.500",  min: 2501, max: 3500 },
  { id: "r3", label: "3.501–5.000",  min: 3501, max: 5000 },
  { id: "r4", label: "≥ 5.001 UF",   min: 5001, max: 9999999 }
];

export const DORMS = [
  { id: "d1", label: "1D",  value: 1 },
  { id: "d2", label: "2D",  value: 2 },
  { id: "d3", label: "3D+", value: 3 } // 3 o más
];

export const PROYECTOS = [
  {
    id: "p1",
    titulo: "Condominio Moderno 1",
    comuna: "Ñuñoa",
    direccion: "Av. Irarrázaval 1234",
    uf: 2600,
    dormitorios: 2, banos: 1,
    img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
    fotos: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505691723518-36a5ac3b2a02?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c52f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop"
    ],
    amenities: ["Piscina", "Gimnasio", "Cowork", "Conserjería 24/7"]
  },
  {
    id: "p2",
    titulo: "Parque Providencia",
    comuna: "Providencia",
    direccion: "Los Leones 456",
    uf: 5200,
    dormitorios: 3, banos: 2,
    img: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
    fotos: [],
    amenities: ["Áreas verdes", "Sala multiuso", "Bicicletero"]
  },
  {
    id: "p3",
    titulo: "Altos de Maipú",
    comuna: "Maipú",
    direccion: "Pajaritos 2345",
    uf: 2400,
    dormitorios: 2, banos: 1,
    img: "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop",
    fotos: [],
    amenities: ["Quinchos", "Juegos infantiles", "Pet-friendly"]
  },
  {
    id: "p4",
    titulo: "Vista Las Condes",
    comuna: "Las Condes",
    direccion: "Apoquindo 9000",
    uf: 7100,
    dormitorios: 3, banos: 2,
    img: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop",
    fotos: [],
    amenities: ["Piscina temperada", "Gimnasio", "Paneles solares"]
  },
  {
    id: "p5",
    titulo: "Centro Urbano",
    comuna: "Santiago Centro",
    direccion: "Alameda 1001",
    uf: null, // mostrará "Consultar precio"
    dormitorios: 1, banos: 1,
    img: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?q=80&w=1200&auto=format&fit=crop",
    fotos: [],
    amenities: ["Conserjería 24/7", "Lavandería"]
  },
  {
    id: "p6",
    titulo: "Jardines de La Florida",
    comuna: "La Florida",
    direccion: "Vicuña Mackenna 7777",
    uf: 3300,
    dormitorios: 2, banos: 2,
    img: "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1200&auto=format&fit=crop",
    fotos: [],
    amenities: ["Áreas verdes", "Bicicletero"]
  },
  {
    id: "p7",
    titulo: "Puente Alto Life",
    comuna: "Puente Alto",
    direccion: "Eyzaguirre 3000",
    uf: 2100,
    dormitorios: 2, banos: 1,
    img: "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1200&auto=format&fit=crop",
    fotos: [],
    amenities: ["Juegos infantiles", "Sala multiuso"]
  },
  {
    id: "p8",
    titulo: "Independencia Plus",
    comuna: "Independencia",
    direccion: "La Paz 1590",
    uf: 2800,
    dormitorios: 2, banos: 1,
    img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop",
    fotos: [],
    amenities: ["Cowork", "Gimnasio", "Conserjería 24/7"]
  }
];
