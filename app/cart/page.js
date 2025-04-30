"use client";
import React from 'react';
import { useCart } from "../CartContext";

export default function CartPage() {
  const { cart } = useCart();
  const total = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Корзина</h2>
      {cart.length === 0 ? (
        <div className="text-center text-gray-500">Корзина пуста</div>
      ) : (
        <div className="space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center bg-white dark:bg-gray-800 rounded shadow p-4">
              <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-16 h-16 rounded mr-4 object-contain bg-gray-100" />
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1">{item.name}</div>
                <div className="text-gray-500">{item.price} ₽</div>
              </div>
              <div className="flex items-center mx-4">
                <span className="px-3">{item.qty || 1}</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center border-t pt-6 mt-6">
            <div className="text-xl font-bold">Итого: {total} ₽</div>
          </div>
        </div>
      )}
    </main>
  );
}
