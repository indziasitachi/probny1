"use client";
import React, { useEffect, useState } from 'react';

export const dynamic = 'force-static'; // для Next.js 13+ static export

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/products-frontend.json')
      .then(r => r.json())
      .then((groups) => {
        // Собираем все товары из всех групп в один массив
        const allProducts = groups.flatMap(group => group.products);
        setProducts(allProducts);
      });
  }, []);

  return (
    <div className="w-full p-4">
      <h1 className="text-3xl font-bold mb-6">Все товары</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
            tabIndex={0}
            aria-label={`Товар: ${product.name}`}
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-32 h-32 object-contain mb-2"
                loading="lazy"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center bg-gray-100 text-gray-400 mb-2">
                Нет фото
              </div>
            )}
            <div className="text-lg font-semibold text-center">{product.name}</div>
            <div className="text-primary font-bold mt-1">{product.price} ₽</div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ... existing code ...
// dummy change for git
