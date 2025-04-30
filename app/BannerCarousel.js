"use client";
import React, { useState, useEffect } from "react";

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [active, setActive] = useState(0);

  // Для свайпа
  const touchStartX = React.useRef(null);
  const touchEndX = React.useRef(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => setBanners(data.banners || []));
  }, []);

  function prev() {
    setActive(a => (a === 0 ? banners.length - 1 : a - 1));
  }
  function next() {
    setActive(a => (a === banners.length - 1 ? 0 : a + 1));
  }

  // Touch events
  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchMove(e) {
    touchEndX.current = e.touches[0].clientX;
  }
  function onTouchEnd() {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const dx = touchEndX.current - touchStartX.current;
      if (Math.abs(dx) > 40) {
        if (dx < 0) next(); // swipe left
        else prev(); // swipe right
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }

  if (!banners.length) return null;

  return (
    <div
      className="relative w-full max-w-2xl mx-auto mb-6"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="overflow-hidden rounded-2xl shadow-lg">
        <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${active * 100}%)` }}>
          {banners.map((b, idx) => (
            <div key={idx} className="relative min-w-full h-40 sm:h-64 flex items-end px-3 py-3 rounded-3xl overflow-hidden shadow-lg mb-3 sm:mb-6">
              {/* Фоновое изображение или видео с настраиваемой прозрачностью */}
              {b.image && b.image.match(/\.(mp4|webm)$/i) ? (
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src={b.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ opacity: b.opacity ?? 1 }}
                />
              ) : (
                <img src={b.image} alt={b.text || b.title} className="absolute inset-0 w-full h-full object-cover" style={{ opacity: b.opacity ?? 1 }} />
              )}
              {/* Затемнение для читаемости текста */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/10" />
              {/* Контент поверх */}
              <div className="relative z-10 flex-1 text-white flex flex-col justify-end pb-2 sm:pb-4">
                <div className="text-lg sm:text-2xl font-bold mb-1 drop-shadow-lg leading-tight">{b.text || b.title}</div>
                {b.subtitle && <div className="text-sm sm:text-lg mb-2 drop-shadow-lg leading-tight">{b.subtitle}</div>}
                {b.url && (
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="bg-white text-blue-700 font-semibold px-4 py-1.5 rounded-full shadow hover:bg-blue-100 transition inline-block text-sm sm:text-base">Подробнее</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Controls */}
      <button onClick={prev} className="hidden lg:block absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10">
        <span className="text-2xl text-blue-700">&#8592;</span>
      </button>
      <button onClick={next} className="hidden lg:block absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10">
        <span className="text-2xl text-blue-700">&#8594;</span>
      </button>
      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {banners.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full ${active === i ? 'bg-white' : 'bg-white/50'} border border-blue-700`}
            onClick={() => setActive(i)}
            aria-label={`Перейти к баннеру ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
