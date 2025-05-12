// public/sw.js

// Базовый Service Worker для Push-уведомлений

// Обработчик события 'install'
// Вызывается один раз при установке Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Установка...');
  // Пропускаем фазу ожидания, чтобы SW активировался сразу
  event.waitUntil(self.skipWaiting());
});

// Обработчик события 'activate'
// Вызывается после установки, когда SW готов к работе
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активация...');
  // Берем контроль над открытыми страницами немедленно
  event.waitUntil(self.clients.claim());
});

// Обработчик события 'push'
// Вызывается, когда сервер отправляет push-уведомление
self.addEventListener('push', (event) => {
  console.log('Service Worker: Получено Push-сообщение.');

  let notificationData = {};
  // Пытаемся распарсить данные из push-сообщения
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      console.error('Service Worker: Ошибка парсинга данных push-сообщения', e);
      notificationData = { title: 'Уведомление', body: event.data.text() || 'Получено новое уведомление' };
    }
  } else {
      notificationData = { title: 'Уведомление', body: 'Получено новое уведомление' };
  }

  const title = notificationData.title || 'Shop Уведомление';
  const options = {
    body: notificationData.body || 'У вас новое сообщение.',
    icon: notificationData.icon || '/icon-192x192.png', // Иконка по умолчанию
    badge: notificationData.badge || '/icon-192x192.png', // Иконка для статус бара (Android)
    // tag: notificationData.tag || 'default-tag', // Тег для группировки или замены уведомлений
    // renotify: notificationData.renotify || false, // Вибрировать/звучать снова при замене по тегу
    // data: notificationData.data || { url: '/' }, // Доп. данные, доступные при клике
    // actions: notificationData.actions || [] // Кнопки действий
    // Пример actions:
     actions: [
       { action: 'open_url', title: 'Открыть сайт' },
       // { action: 'dismiss', title: 'Закрыть' }
     ],
     data: { 
        url: notificationData.url || '/' // URL для открытия по умолчанию или из данных
     }
  };

  // Показываем уведомление
  // waitUntil() гарантирует, что SW не завершится до показа уведомления
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Обработчик события 'notificationclick'
// Вызывается, когда пользователь кликает на уведомление
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Клик по уведомлению.');

  const notification = event.notification;
  const action = event.action; // 'open_url' или null, если клик по телу

  // Закрываем уведомление
  notification.close();

  // Определяем URL для открытия
  const urlToOpen = notification.data?.url || '/'; 

  // Если кликнули по кнопке "Открыть сайт" или по самому уведомлению
  if (action === 'open_url' || !action) {
    // Ищем открытое окно с таким же URL и фокусируемся, иначе открываем новое
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          let client = clientList[i];
          // Сравниваем URL, возможно, нужно будет нормализовать URL
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Если окно не найдено, открываем новое
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
  // Можно добавить обработку других actions здесь
});

// Можно добавить обработчики fetch для кэширования (опционально)
// self.addEventListener('fetch', (event) => {
//   // Логика кэширования
// });
