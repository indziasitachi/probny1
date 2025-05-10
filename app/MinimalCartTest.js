"use client";
import React, { useState, useEffect } from 'react';
import { useCart } from "./CartContext"; // Убедитесь, что путь правильный

export default function MinimalCartTest() {
  const { cart, cartCount } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div>
        <h1>Минимальный Тест Корзины</h1>
        <p>Загрузка данных корзины... (Сервер/До монтирования)</p>
        <p>Количество товаров: 0</p> 
      </div>
    );
  }

  // После монтирования
  return (
    <div>
      <h1>Минимальный Тест Корзины</h1>
      {cart.length === 0 ? (
        <p>Корзина пуста (Клиент)</p>
      ) : (
        <p>Товары в корзине (Клиент): {cart.length} шт. Общее количество: {cartCount}</p>
      )}
      <p>Содержимое корзины:</p>
      <pre style={{ border: '1px solid #ccc', padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(cart, null, 2)}
      </pre>
    </div>
  );
}