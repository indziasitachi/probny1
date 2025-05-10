"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

const CART_STORAGE_KEY = 'cart'; // Используем константу для ключа

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // Ленивая инициализация состояния из localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          return JSON.parse(storedCart);
        }
      } catch (error) {
        console.error("Error reading cart from localStorage on init:", error);
      }
    }
    return []; // По умолчанию пустая корзина
  });

  // Убираем отдельный useEffect для начальной загрузки, так как это теперь в useState
  // useEffect(() => {
  //   const stored = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
  //   if (stored) setCart(JSON.parse(stored));
  // }, []);

  // Сохранение корзины в localStorage при изменениях
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [cart]);

  // Добавить товар в корзину
  const addToCart = (product) => {
    setCart((prev) => {
      // Если такой товар уже есть, увеличиваем количество
      const idx = prev.findIndex((item) => item.id === product.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].qty = (updated[idx].qty || 0) + 1; // Добавим проверку на случай, если qty не определено
        return updated;
      }
      // Если товара нет — добавляем с qty=1
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Получить общее количество товаров в корзине
  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0); // Добавим проверку на случай, если qty не определено

  // Увеличить количество товара
  const increaseQty = (id) => {
    setCart((prev) => 
      prev.map(item => 
        item.id === id ? { ...item, qty: (item.qty || 0) + 1 } : item // Добавим проверку
      )
    );
  };

  // Уменьшить количество товара (и удалить, если qty=1)
  const decreaseQty = (id) => {
    setCart((prev) => 
      prev.flatMap(item => {
        if (item.id === id) {
          const currentQty = item.qty || 0; // Добавим проверку
          if (currentQty > 1) return { ...item, qty: currentQty - 1 };
          return []; 
        }
        return item;
      })
    );
  };

  // Удалить товар из корзины
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  // Очистить корзину (добавим, если нужно)
  // const clearCart = () => {
  //   setCart([]);
  // };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        cartCount, 
        increaseQty, 
        decreaseQty, 
        removeFromCart,
        // clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
