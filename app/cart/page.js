"use client";
import React, { useState, useEffect } from 'react';
import { useCart } from "../CartContext";
// import ProductCard from '../ProductCard';
import CartItemSkeleton from '../CartItemSkeleton'; // {{ИСПРАВЛЕННЫЙ ПУТЬ ИМПОРТА}}

export default function CartPage() {
  const { cart, increaseQty, decreaseQty, removeFromCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  
  const total = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', comment: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [qtyInputs, setQtyInputs] = useState({}); 

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
        if (cart.length > 0) {
            setQtyInputs(Object.fromEntries(cart.map(item => [item.id, String(item.qty || 1)])));
        } else {
            setQtyInputs({});
        }
    }
  }, [cart]);

  const getImages = (item) => {
    // Обеспечиваем, что возвращается массив строк URL или плейсхолдер
    let imageUrls = [];
    if (Array.isArray(item.images) && item.images.length > 0) {
      imageUrls = item.images.map(img => (typeof img === 'string' ? img : img?.url)).filter(Boolean);
    } else if (item.image && typeof item.image === 'string') {
      imageUrls = [item.image];
    } else if (item.imageUrl && typeof item.imageUrl === 'string') {
      imageUrls = [item.imageUrl];
    }
    return imageUrls.length > 0 ? imageUrls : ['/placeholder.svg'];
  };

  const handleQtyChange = (id, value) => {
    if (/^\d*$/.test(value)) { // Разрешаем только цифры и пустое значение для временного ввода
      setQtyInputs(inputs => ({ ...inputs, [id]: value }));
    }
  };

  const handleQtyBlur = (item) => {
    let newQtyValidated = parseInt(qtyInputs[item.id], 10);
    if (isNaN(newQtyValidated) || newQtyValidated < 1) {
      newQtyValidated = 1;
    }
    
    const currentItemActualQty = item.qty || 0; 
    if (currentItemActualQty !== newQtyValidated) { 
        const diff = newQtyValidated - currentItemActualQty;
        if (diff > 0) {
            for (let i = 0; i < diff; i++) increaseQty(item.id);
        } else { 
            for (let i = 0; i < Math.abs(diff); i++) decreaseQty(item.id);
        }
    }
    // После изменения количества в корзине, cart обновится, и useEffect [cart]
    // обновит qtyInputs. Поэтому явное обновление qtyInputs[item.id] здесь может быть избыточным
    // или даже привести к двойному рендеру. Если нужно немедленное обновление инпута
    // до того, как cart обновится, тогда нужно:
    // setQtyInputs(inputs => ({ ...inputs, [item.id]: String(newQtyValidated) }));
    // Но лучше полагаться на обновление из useEffect [cart] для консистентности.
    // Однако, если decreaseQty удаляет товар, то item.qty в cart уже не будет.
    // Поэтому здесь мы обновим инпут на основе newQtyValidated,
    // а useEffect [cart] затем синхронизирует его с реальным состоянием корзины.
    // setQtyInputs(inputs => ({ // This line is removed based on the logic change to rely on useEffect [cart]
    //     ...inputs, 
    //     [item.id]: String(newQtyValidated) 
    // }));
    // Состояние qtyInputs будет обновлено через useEffect [cart]
  };
  
  const handleOrder = async (event) => {
    event.preventDefault();
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
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Ошибка оформления заказа: ${res.status} ${errorData}`);
      }
      setSuccess(true);
      setShowModal(false);
      setForm({ name: '', phone: '', comment: '' });
      const cartItemIds = cart.map(item => item.id);
      cartItemIds.forEach(id => removeFromCart(id));
    } catch (err) { 
      setError(err.message || 'Неизвестная ошибка оформления заказа');
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    // {{Отображаем скелеты, пока данные не загружены / компонент не смонтирован}}
    return (
      <main className="p-2 sm:p-8 max-w-2xl mx-auto min-h-screen flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-center">Корзина</h2>
        <div className="flex-1 flex flex-col gap-4 pb-32 sm:pb-0">
          {/* Можно отобразить несколько скелетов для лучшего эффекта */}
          <CartItemSkeleton />
          <CartItemSkeleton />
          <CartItemSkeleton />
        </div>
        {/* Можно также добавить скелет для футера, если он виден сразу */}
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 p-4 pb-20 flex flex-col sm:static sm:p-0 sm:pb-0 sm:bg-transparent sm:border-0 animate-pulse">
          <div className="flex justify-between items-center mb-3 sm:mb-0">
            <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div> {/* Итого - заглушка */}
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-xl w-1/3 ml-4"></div> {/* Кнопка - заглушка */}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-2 sm:p-8 max-w-2xl mx-auto min-h-screen flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-center">Корзина</h2>
      {cart.length === 0 ? (
        <div className="text-center text-gray-500 py-16 flex-1">Корзина пуста</div>
      ) : (
        // {{Отображаем реальные данные, когда они есть и компонент смонтирован}}
        <div className="flex-1 flex flex-col gap-4 pb-32 sm:pb-0">
          {cart.map((item) => {
            const images = getImages(item);
            const mainImage = images[0]; 

            return (
              // Возвращаем оригинальную разметку для элемента корзины
              <div key={item.id} className="flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 gap-3 sm:gap-6 transition-all">
                {/* Отображение основного изображения */}
                <img src={mainImage} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-contain bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="font-semibold text-base sm:text-lg mb-0.5 line-clamp-2">{item.name}</div>
                  <div className="text-gray-500 text-sm sm:text-base">{item.price} ₽ за шт.</div>
                  <div className="text-gray-700 font-bold text-base sm:text-lg">{(item.price * (item.qty || 1)).toLocaleString('ru-RU', { minimumFractionDigits: 0 })} ₽</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => decreaseQty(item.id)} 
                      className="w-11 h-11 flex items-center justify-center text-2xl rounded-full bg-blue-100 hover:bg-blue-200 font-bold border border-blue-400 text-blue-700 shadow"
                    >
                      -
                    </button>
                    <input
                      type="text" 
                      inputMode="numeric" 
                      pattern="[0-9]*"   
                      value={qtyInputs[item.id] ?? '1'}
                      onChange={e => handleQtyChange(item.id, e.target.value)}
                      onBlur={() => handleQtyBlur(item)}
                      onKeyDown={e => { if (e.key === 'Enter' && e.target instanceof HTMLElement) { e.target.blur(); } }}
                      className="w-20 h-11 text-center font-extrabold text-2xl border-2 border-blue-400 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow placeholder-gray-400"
                      placeholder="1"
                      style={{ MozAppearance: 'textfield' }}
                    />
                    <button onClick={() => increaseQty(item.id)} className="w-11 h-11 flex items-center justify-center text-2xl rounded-full bg-blue-100 hover:bg-blue-200 font-bold border border-blue-400 text-blue-700 shadow">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:underline mt-1">Удалить</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Футер и модальные окна */}
      {isMounted && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 p-4 pb-20 flex flex-col sm:static sm:p-0 sm:pb-0 sm:bg-transparent sm:border-0">
          <div className="flex justify-between items-center mb-3 sm:mb-0">
            <div className="text-xl font-bold">Итого: {total.toLocaleString('ru-RU', { minimumFractionDigits: 0 })} ₽</div>
            <button 
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-base shadow hover:bg-blue-700 transition w-full sm:w-auto ml-4" 
              onClick={() => setShowModal(true)}
            >
              Оформить заказ
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={handleOrder} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4 relative">
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-2 text-black dark:text-white">Оформление заказа</h3>
            <input 
              required type="text" 
              placeholder="Ваше имя" 
              className="border rounded px-3 py-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900" 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
            />
            <input 
              required type="tel" 
              placeholder="Телефон" 
              className="border rounded px-3 py-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900" 
              value={form.phone} 
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
            />
            <textarea 
              placeholder="Комментарий к заказу" 
              className="border rounded px-3 py-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900" 
              value={form.comment} 
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} 
            ></textarea>
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold text-base shadow hover:bg-blue-700 transition disabled:opacity-50" 
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Подтвердить заказ'}
            </button>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </form>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
            <div className="text-3xl mb-4">✅</div>
            <div className="text-xl font-bold mb-2">Заказ успешно оформлен!</div>
            <button 
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold text-base shadow hover:bg-blue-700 transition" 
              onClick={() => setSuccess(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
