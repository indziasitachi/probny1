"use client";
import React, { useState } from 'react';
import { useCart } from "../CartContext";

export default function CartPage() {
  const { cart, increaseQty, decreaseQty, removeFromCart, addToCart } = useCart();
  const total = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', comment: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          comment: form.comment,
          cart: cart.map(item => ({ id: item.id, name: item.name, qty: item.qty, price: item.price }))
        })
      });
      if (!res.ok) throw new Error('Ошибка оформления заказа');
      setSuccess(true);
      setShowModal(false);
      setForm({ name: '', phone: '', comment: '' });
      // Очищаем корзину
      cart.forEach(item => removeFromCart(item.id));
    } catch (e) {
      setError(e.message || 'Ошибка оформления заказа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-2 sm:p-8 max-w-2xl mx-auto min-h-screen flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-center">Корзина</h2>
      {cart.length === 0 ? (
        <div className="text-center text-gray-500 py-16">Корзина пуста</div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 pb-32 sm:pb-0">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 gap-3 sm:gap-6 transition-all">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-contain bg-gray-100 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="font-semibold text-base sm:text-lg mb-0.5 line-clamp-2">{item.name}</div>
                <div className="text-gray-500 text-sm sm:text-base">{item.price} ₽ за шт.</div>
                <div className="text-gray-700 font-bold text-base sm:text-lg">{(item.price * (item.qty || 1)).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => decreaseQty(item.id)} className="w-11 h-11 flex items-center justify-center text-2xl rounded-full bg-blue-100 hover:bg-blue-200 font-bold border border-blue-400 text-blue-700 shadow">-</button>
                  <input
                    type="number"
                    min={1}
                    value={item.qty || 1}
                    onChange={e => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      if (val > item.qty) {
                        for (let i = item.qty; i < val; i++) increaseQty(item.id);
                      } else if (val < item.qty) {
                        for (let i = item.qty; i > val; i--) decreaseQty(item.id);
                      }
                    }}
                    className="w-20 h-11 text-center font-extrabold text-2xl border-2 border-blue-400 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow placeholder-gray-400"
                    placeholder="1"
                    style={{ MozAppearance: 'textfield', opacity: 1 }}
                  />
                  <button onClick={() => increaseQty(item.id)} className="w-11 h-11 flex items-center justify-center text-2xl rounded-full bg-blue-100 hover:bg-blue-200 font-bold border border-blue-400 text-blue-700 shadow">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:underline mt-1">Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Закреплённый футер для мобильных */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 p-4 pb-20 flex flex-col sm:static sm:p-0 sm:pb-0 sm:bg-transparent sm:border-0">
          <div className="flex justify-between items-center mb-3 sm:mb-0">
            <div className="text-xl font-bold">Итого: {total.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</div>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-base shadow hover:bg-blue-700 transition w-full sm:w-auto ml-4" onClick={() => setShowModal(true)}>Оформить заказ</button>
          </div>
        </div>
      )}
      {/* Модальное окно оформления заказа */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={handleOrder} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4 relative">
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-2 text-black dark:text-white">Оформление заказа</h3>
            <input required type="text" placeholder="Ваше имя" className="border rounded px-3 py-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input required type="tel" placeholder="Телефон" className="border rounded px-3 py-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <textarea placeholder="Комментарий к заказу" className="border rounded px-3 py-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} />
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold text-base shadow hover:bg-blue-700 transition disabled:opacity-50" disabled={loading}>{loading ? 'Отправка...' : 'Подтвердить заказ'}</button>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </form>
        </div>
      )}
      {/* Сообщение об успехе */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
            <div className="text-3xl mb-4">✅</div>
            <div className="text-xl font-bold mb-2">Заказ успешно оформлен!</div>
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold text-base shadow hover:bg-blue-700 transition" onClick={() => setSuccess(false)}>Закрыть</button>
          </div>
        </div>
      )}
    </main>
  );
}
