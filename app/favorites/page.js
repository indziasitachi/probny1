"use client";
import React, { useState, useEffect } from 'react';
import { useFavorites } from '../FavoritesContext';
import { useCart } from '../CartContext'; // Добавляем импорт хука корзины
import Link from 'next/link'; // Импорт компонента Link

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const { addToCart } = useCart(); // Получаем функцию добавления в корзину
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
        <div className="flex flex-col gap-4">
          {favorites.map(product => {
             // Логика получения изображения, аналогичная корзине
            let mainImage = product.image; 
            if (!mainImage && product.images && Array.isArray(product.images) && product.images.length > 0) {
              mainImage = product.images[0]?.url || product.images[0];
            }
            if (!mainImage && product.imageUrl) {
              mainImage = product.imageUrl;
            }
            const imageUrl = mainImage || '/placeholder.svg';

            return (
              <div key={product.id} className="flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 gap-3 sm:gap-6 transition-all">
                <Link href={`/product/${product.id}`} className="flex items-center gap-3 sm:gap-6 flex-grow">
                  {/* Отображение изображения */}
                  <img src={imageUrl} alt={product.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-contain bg-gray-100 flex-shrink-0" />

                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    {/* Название товара */}
                    <div className="font-semibold text-base sm:text-lg mb-0.5 line-clamp-2">{product.name}</div>
                    {/* Цена товара (если есть) */}
                     {product.price && (
                       <div className="text-gray-500 text-sm sm:text-base">{product.price} ₽</div>
                     )}
                  </div>
                </Link>
                {/* Кнопка добавить в корзину */}
                <button
                  onClick={() => addToCart(product)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md transition-colors duration-200"
                >
                  В корзину
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
