"use client";
import React, { useState } from "react";

// Восстановлен объект product для предотвращения ошибок not defined
const product = {
  id: 1,
  name: "Кофе Американо",
  price: 150,
  images: ["/images/products/coffee1", "/images/products/coffee2"],
  description: "Ароматный свежесваренный кофе.",
  specs: [
    { label: "Объем", value: "250 мл" },
    { label: "Сорт", value: "Арабика" },
    { label: "Калории", value: "10 ккал" },
  ],
  similar: [
    { id: 2, name: "Капучино", price: 170, image: "/images/products/cappuccino" },
    { id: 3, name: "Латте", price: 180, image: "/images/products/latte" },
  ],
};

// Универсальная функция для поиска изображения с разным расширением
function getImageUrl(basePath) {
  const exts = [".jpg", ".jpeg", ".png"];
  for (let ext of exts) {
    try {
      // Проверяем наличие файла через fetch (работает только в браузере)
      const req = new XMLHttpRequest();
      req.open("HEAD", basePath + ext, false);
      req.send();
      if (req.status !== 404) return basePath + ext;
    } catch (e) {/* ignore */ }
  }
  return "/logo.svg"; // Placeholder если не найдено
}

export default function ProductPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [favorite, setFavorite] = useState(false);

  // Преобразуем пути изображений (если это не абсолютный путь)
  const images = product.images.map(img => {
    if (img.startsWith("/images/products/")) {
      const base = img.replace(/\.(jpg|jpeg|png)$/i, "");
      return getImageUrl(base);
    }
    return img;
  });

  return (
    <main className="max-w-3xl mx-auto p-6">
      {/* Галерея фото */}
      <div className="flex gap-8 flex-col md:flex-row items-center md:items-start mb-8">
        <div className="w-64 h-64 relative mb-4 md:mb-0">
          <img
            src={images[activeIndex]}
            alt={product.name}
            className="w-full h-full object-contain rounded"
          />
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full ${activeIndex === i ? "bg-blue-600" : "bg-gray-300"}`}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Фото ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <div className="font-bold text-2xl mb-2">{product.name}</div>
          <div className="text-xl text-gray-500 mb-2">{product.price} ₽</div>
          <div className="flex gap-2">
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">В корзину</button>
            <button
              className={`px-6 py-2 rounded border ${favorite ? "bg-red-100 text-red-500 border-red-400" : "bg-gray-100 text-gray-500 border-gray-300"}`}
              onClick={() => setFavorite((f) => !f)}
              aria-label="В избранное"
            >
              ♥
            </button>
          </div>
        </div>
      </div>
      {/* Галерея всех фото */}
      {images.length > 1 && (
        <div className="flex gap-4 mb-8 flex-wrap">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Фото товара ${idx + 1}`}
              className="w-32 h-32 object-contain rounded border border-gray-200 bg-white shadow"
            />
          ))}
        </div>
      )}
      {/* Описание */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Описание</h3>
        <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
      </div>

      {/* Характеристики */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Характеристики</h3>
        <ul className="text-gray-700 dark:text-gray-300">
          {product.specs.map((s) => (
            <li key={s.label}><span className="font-medium">{s.label}:</span> {s.value}</li>
          ))}
        </ul>
      </div>

      {/* Похожие товары */}
      <div>
        <h3 className="font-semibold mb-2">Похожие товары</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {product.similar.map((sim) => {
            const image = getImageUrl(sim.image.replace(/\.(jpg|jpeg|png)$/i, ""));
            return (
              <div key={sim.id} className="min-w-[160px] bg-white dark:bg-gray-800 rounded shadow p-4 flex flex-col items-center">
                <img src={image} alt={sim.name} className="w-16 h-16 mb-2 object-contain bg-gray-100 rounded" />
                <div className="font-semibold mb-1 text-center">{sim.name}</div>
                <div className="text-gray-500 mb-2">{sim.price} ₽</div>
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm">В корзину</button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
