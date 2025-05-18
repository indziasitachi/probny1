"use client"; // Этот компонент должен работать на клиенте
import React, { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [notificationPermission, setNotificationPermission] = useState(null); // 'granted', 'denied', 'default'

  useEffect(() => {
    // Проверяем поддержку Service Worker и Push API
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Service Workers or Push API not supported');
      setNotificationPermission('unsupported'); // Кастомный статус для неподдерживаемых браузеров
      return;
    }

    // Проверяем текущее разрешение
    setNotificationPermission(Notification.permission);

    // Можно добавить слушатель изменения разрешения, если пользователь меняет его в настройках браузера
    // Но это событие не стандартизировано и не везде поддерживается.
    // const handlePermissionChange = () => { setNotificationPermission(Notification.permission); };
    // navigator.permissions.query({name: 'notifications'}).then(notificationPerm => {
    //   notificationPerm.addEventListener('change', handlePermissionChange);
    // });
    // Cleanup (опционально)
    // return () => { navigator.permissions.query({name: 'notifications'}).then(notificationPerm => {
    //   notificationPerm.removeEventListener('change', handlePermissionChange);
    // }); };

  }, []);

  const requestNotificationPermission = async () => {
    if (notificationPermission === 'granted') {
      console.log('Уведомления уже разрешены.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        console.log('Разрешение на уведомления получено!');
        // Теперь получаем Push Subscription
        subscribeToPush();
      } else {
        console.warn('В разрешении на уведомления отказано.');
        alert('Вы запретили показ уведомлений.');
      }
    } catch (error) {
      console.error('Ошибка при запросе разрешения на уведомления:', error);
      alert('Произошла ошибка при запросе разрешения.');
    }
  };

  const subscribeToPush = async () => {
    // Получаем VAPID Public Key из глобального window (он должен быть определён в _document.js или _app.js)
    const applicationServerKey = typeof window !== 'undefined' ? window.NEXT_PUBLIC_VAPID_PUBLIC_KEY : undefined;

    if (!applicationServerKey) {
      console.error('VAPID Public Key не определен в window.NEXT_PUBLIC_VAPID_PUBLIC_KEY.');
      alert('Ошибка конфигурации: VAPID ключ отсутствует.');
      return;
    }

    // Преобразуем ключ
    const applicationServerKeyUint8Array = urlBase64ToUint8Array(applicationServerKey);

    if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      try {
        // Ждем активации Service Worker
        const registration = await navigator.serviceWorker.ready;

        // Пытаемся получить существующую подписку, если она есть
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          console.log('Уже подписан на Push-уведомления:', JSON.stringify(existingSubscription));
          // TODO: Можно отправить существующую подписку на сервер для перепроверки
          // await sendSubscriptionToServer(existingSubscription);
          alert('Уведомления уже включены и подписаны.'); // Или другое сообщение
          return; // Выходим, если уже подписаны
        }

        // Создаем новую подписку
        console.log('Создание новой Push-подписки...');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true, // Уведомления всегда видимы
          applicationServerKey: applicationServerKeyUint8Array
        });

        console.log('Новая Push Subscription получена:', JSON.stringify(subscription));

        // ** Шаг 3: Отправляем подписку на ваш backend **
        // TODO: Замените '/api/subscribe' на ваш реальный эндпоинт для сохранения подписок
        const sendResult = await fetch('/api/subscribe', { // <--- ГИПОТЕТИЧЕСКИЙ API ЭНДПОИНТ
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // TODO: Добавить токен авторизации, если у вас есть пользователи
          },
          body: JSON.stringify(subscription),
        });

        if (sendResult.ok) {
          console.log('Подписка успешно отправлена на сервер.');
          alert('Подписка на уведомления оформлена!');
        } else {
          const errorBody = await sendResult.text();
          console.error('Ошибка при отправке подписки на сервер:', sendResult.status, errorBody);
          alert(`Ошибка при сохранении подписки на сервере: ${sendResult.status}`);
          // TODO: Возможно, стоит отменить подписку, если сервер не смог ее сохранить?
        }

      } catch (error) {
        console.error('Ошибка при создании или отправке Push Subscription:', error);
        alert(`Ошибка при включении уведомлений: ${error.message}`);
      }
    }

  };

  // Хелпер для преобразования URL-safe base64 строки в Uint8Array
  // Потребуется для VAPID ключа
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Отладочная информация (можно будет убрать после отладки)
  console.log('Текущий статус уведомлений:', notificationPermission);
  console.log('ServiceWorker в навигаторе:', 'serviceWorker' in navigator);
  console.log('PushManager в window:', 'PushManager' in window);
  console.log('Notification в window:', 'Notification' in window);

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Профиль пользователя</h1>

      {/* Отладочная информация */}
      <div className="bg-gray-100 p-3 rounded-lg mb-6 text-left text-sm">
        <p className="font-semibold">Отладочная информация:</p>
        <p>Состояние уведомлений: <span className="font-mono">{notificationPermission}</span></p>
        <p>ServiceWorker: <span className="font-mono">{('serviceWorker' in navigator).toString()}</span></p>
        <p>Push API: <span className="font-mono">{('PushManager' in window).toString()}</span></p>
        <p>Notification API: <span className="font-mono">{('Notification' in window).toString()}</span></p>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Управление уведомлениями</h2>

        {notificationPermission === 'unsupported' && (
          <p className="text-gray-600">Ваш браузер не поддерживает уведомления.</p>
        )}

        {notificationPermission === 'default' && (
          <button
            onClick={requestNotificationPermission}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
          >
            Включить уведомления
          </button>
        )}

        {notificationPermission === 'denied' && (
          <p className="text-red-600">Вы запретили уведомления. Разрешите их в настройках браузера.</p>
        )}

        {notificationPermission === 'granted' && (
          <p className="text-green-600 font-semibold">Уведомления включены!</p>
          // TODO: Добавить кнопку для отключения уведомлений (отписка)
        )}
      </div>
    </div>
  );
}
