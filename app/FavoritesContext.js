"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext();

const FAVORITES_STORAGE_KEY = 'favorites'; // Используем константу для ключа

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    // Ленивая инициализация состояния из localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (storedFavorites) {
          return JSON.parse(storedFavorites);
        }
      } catch (error) {
        console.error("Error reading favorites from localStorage on init:", error);
      }
    }
    return []; // По умолчанию пустой массив избранного
  });

  // Убираем отдельный useEffect для начальной загрузки
  // useEffect(() => {
  //   const stored = typeof window !== 'undefined' ? localStorage.getItem('favorites') : null;
  //   if (stored) setFavorites(JSON.parse(stored));
  // }, []);

  // Сохранение избранного в localStorage при изменениях
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error("Error saving favorites to localStorage:", error);
      }
    }
  }, [favorites]);

  // Добавить или убрать товар из избранного
  const toggleFavorite = (product) => {
    // Логика определения основного изображения
    let mainImage = product.image; // Предполагаем, что image уже есть и корректно
    if (!mainImage && product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Если product.image нет, но есть массив product.images
      mainImage = product.images[0]?.url || product.images[0]; // Пытаемся взять .url, если это объект, или сам элемент
    }
    if (!mainImage && product.imageUrl) {
      // Если все еще нет, берем imageUrl
      mainImage = product.imageUrl;
    }
    // Если mainImage все еще не определено, можно установить placeholder или оставить null/undefined
    // mainImage = mainImage || '/placeholder.svg'; 

    const productWithPossiblyUpdatedImage = { ...product, image: mainImage };

    setFavorites((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      // При добавлении сохраняем объект с актуальным изображением
      return [...prev, productWithPossiblyUpdatedImage];
    });
  };

  // Проверить, находится ли товар в избранном
  const isFavorite = (id) => favorites.some((item) => item.id === id);

  // Количество избранных товаров
  const favoritesCount = favorites.length;

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, favoritesCount }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
