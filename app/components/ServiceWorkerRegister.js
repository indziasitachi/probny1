// app/components/ServiceWorkerRegister.js
"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker зарегистрирован успешно:', registration);
          })
          .catch(error => {
            console.error('Ошибка регистрации Service Worker:', error);
          });
      });
    }
  }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз при монтировании

  return null; // Этот компонент не рендерит никакого видимого HTML
}
