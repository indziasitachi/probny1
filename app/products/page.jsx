"use client";
import React, { useEffect, useState } from 'react';

export const dynamic = 'force-static'; // для Next.js 13+ static export

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('/api/moysklad-products')
      .then(r => r.json())
      .then(setProducts);
  }, []);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Товары</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
            <div className="mb-2">
              {product._images && product._images.length > 0 ? (
                <img src={product._images[0].miniature || product._images[0].href} alt={product.name} className="w-full h-40 object-contain" />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">Нет фото</div>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-1">{product.name}</h2>
            <p className="text-gray-700 text-sm mb-2">{product.description || 'Без описания'}</p>
            <div className="text-lg font-bold text-green-600">
              {product.salePrices && product.salePrices.length > 0 ? (
                `${product.salePrices[0].value / 100} ₽`
              ) : (
                'Нет цены'
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ... existing code ...
// dummy change for git
