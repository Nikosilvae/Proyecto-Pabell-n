// src/components/CardSlider.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
// Asegúrate de que los módulos se importan desde 'swiper' para la versión 8
import { Autoplay, Pagination, Navigation } from 'swiper';

// Importamos los estilos necesarios
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// El componente ahora acepta una imagen principal (`mainImage`) como respaldo
export default function CardSlider({ images, mainImage, title }) {
  // Asegurarnos de que 'images' es un array con contenido
  const imageList = Array.isArray(images) && images.length > 0 ? images : [];

  // CASO 1: Si no hay galería de imágenes, pero SÍ hay una imagen principal, la mostramos.
  if (imageList.length === 0 && mainImage) {
    return <img src={mainImage} alt={title} className="card__img" />;
  }

  // CASO 2: Si no hay NINGUNA imagen (ni galería, ni principal), mostramos el placeholder local.
  if (imageList.length === 0) {
    return <img src="/images/placeholder.jpg" alt={title} className="card__img" />;
  }

  // CASO 3: Si hay una galería de imágenes, mostramos el slider.
  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      centeredSlides={true}
      autoplay={{
        delay: 3000, // Un poco más de tiempo por imagen
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      loop={true}
      className="card-swiper"
    >
      {imageList.map((imgUrl, index) => (
        <SwiperSlide key={index}>
          <img src={imgUrl} alt={`${title} - Imagen ${index + 1}`} className="card__img" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}