// src/components/AuthSlider.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper';
import 'swiper/swiper-bundle.min.css';

// Lista de imágenes para el carrusel.
const sliderImages = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1563205237-bf0bdbf8f5a1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGRlcGFydGFtZW50b3N8ZW58MHx8MHx8fDA%3D'
];

export default function AuthSlider({ children }) {
  return (
    <div className="auth-branding">
      <Swiper
        // --- LÍNEA CLAVE AÑADIDA ---
        // Le decimos a Swiper qué módulos debe activar
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        allowTouchMove={false}
        className="auth-swiper"
      >
        {sliderImages.map((imageUrl, index) => (
          <SwiperSlide key={index}>
            <div 
              className="auth-slide-image" 
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="auth-branding-content">
        {children}
      </div>
    </div>
  );
}