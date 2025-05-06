"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Загрузка корзины из localStorage при инициализации
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Сохранение корзины в localStorage при изменениях
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Добавить товар в корзину
  const addToCart = (product) => {
    setCart((prev) => {
      // Если такой товар уже есть, увеличиваем количество
      const idx = prev.findIndex((item) => item.id === product.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].qty += 1;
        return updated;
      }
      // Если товара нет — добавляем с qty=1
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Получить общее количество товаров в корзине
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Увеличить количество товара
  const increaseQty = (id) => {
    setCart((prev) => prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item));
  };

  // Уменьшить количество товара (и удалить, если qty=1)
  const decreaseQty = (id) => {
    setCart((prev) => prev.flatMap(item => {
      if (item.id === id) {
        if (item.qty > 1) return { ...item, qty: item.qty - 1 };
        // Если qty=1, удаляем товар
        return [];
      }
      return item;
    }));
  };

  // Удалить товар из корзины
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, cartCount, increaseQty, decreaseQty, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
