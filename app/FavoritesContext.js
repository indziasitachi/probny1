"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  // Загрузка избранного из localStorage при инициализации
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('favorites') : null;
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  // Сохранение избранного в localStorage при изменениях
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  // Добавить или убрать товар из избранного
  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
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
