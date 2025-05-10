"use client";
import React, { useState, useEffect } from 'react';
import { useFavorites } from '../FavoritesContext';
import ProductCard from '../ProductCard';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // {{Заглушка, ИДЕНТИЧНАЯ рендеру при пустом списке избранного на сервере}}
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Избранное</h1>
        <div className="text-gray-500 text-center py-16">Нет избранных товаров</div>
        {/* Убедиться, что здесь нет других элементов, которые бы рендерились при favorites.length > 0 */}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Избранное</h1>
      {favorites.length === 0 ? (
        <div className="text-gray-500 text-center py-16">Нет избранных товаров</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
