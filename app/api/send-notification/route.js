/* eslint-env node */
// app/api/send-notification/route.js

import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { Client } from 'pg';

// Получаем конфиг с серверными переменными окружения
const { serverRuntimeConfig } = require('next/constants')();

// Установка VAPID ключей из serverRuntimeConfig
const vapidPublicKey = serverRuntimeConfig?.vapidPublicKey || process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = serverRuntimeConfig?.vapidPrivateKey || process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
  const errorMsg = 'VAPID public or private key is not set.\n' +
    `VAPID_PUBLIC_KEY: ${!!process.env.VAPID_PUBLIC_KEY}\n` +
    `NEXT_PUBLIC_VAPID_PUBLIC_KEY: ${!!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY}\n` +
    `VAPID_PRIVATE_KEY: ${!!process.env.VAPID_PRIVATE_KEY}\n` +
    `serverRuntimeConfig.vapidPublicKey: ${!!(serverRuntimeConfig?.vapidPublicKey)}\n` +
    `serverRuntimeConfig.vapidPrivateKey: ${!!(serverRuntimeConfig?.vapidPrivateKey)}`;
  
  console.error(errorMsg);
  // Возвращаем ошибку, чтобы увидеть её в логах Vercel
  return NextResponse.json(
    { error: 'Server configuration error', details: 'VAPID keys not configured' },
    { status: 500 }
  );
}

try {
  webpush.setVapidDetails(
    'mailto:your_email@example.com', // Замените на ваш контактный email
    vapidPublicKey,
    vapidPrivateKey
  );
  console.log('VAPID details успешно установлены');
} catch (error) {
  console.error('Ошибка при установке VAPID details:', error);
  throw error;
}

// Функция для подключения к базе данных
async function connectToDatabase() {
  const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL или POSTGRES_URL не определен.');
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { // Настройки SSL для Supabase (могут варьироваться)
      rejectUnauthorized: false // В продакшене стоит настроить CA сертификат
    }
  });

  await client.connect();
  return client;
}

export async function POST() { // Используем POST для отправки
  let client;
  try {
    // Пример данных уведомления (можно получить из тела запроса)
    const notificationPayload = {
      title: 'Новое уведомление!',
      body: 'Это тестовое push-уведомление из вашего приложения.',
      icon: '/icon-192x192.png', // Указываем иконку
      badge: '/icon-192x192.png', // Иконка для статус бара (Android)
      data: { url: '/' } // Доп. данные для клика (url)
    };

    client = await connectToDatabase();

    // Получаем все подписки из базы данных
    const { rows: subscriptions } = await client.query('SELECT endpoint, p256dh, auth FROM push_subscriptions');

    console.log(`Найдено ${subscriptions.length} подписок.`);

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(notificationPayload));
        console.log('Уведомление успешно отправлено на endpoint:', sub.endpoint);
      } catch (error) {
        console.error('Ошибка при отправке уведомления на endpoint:', sub.endpoint, error);

        // Обрабатываем ошибки, связанные с недействительными подписками
        // Коды ошибок 404 (NotFound) и 410 (Gone) обычно означают, что подписка больше недействительна
        if (error.statusCode === 404 || error.statusCode === 410) {
          console.log('Удаление недействительной подписки:', sub.endpoint);
          // Удаляем подписку из базы данных
          try {
            await client.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint]);
            console.log('Недействительная подписка удалена из БД.');
          } catch (deleteError) {
            console.error('Ошибка при удалении недействительной подписки из БД:', sub.endpoint, deleteError);
          }
        } else {
          // Обработка других ошибок отправки
          console.error('Общая ошибка отправки уведомления:', sub.endpoint, error);
        }
      }
    });

    // Ждем завершения всех отправок (или обрабатываем параллельно)
    await Promise.all(sendPromises);

    return NextResponse.json({ message: 'Попытка отправки уведомлений завершена.' }, { status: 200 });

  } catch (error) {
    console.error('Ошибка сервера при отправке уведомлений:', error);
    return NextResponse.json({ message: 'Ошибка сервера при отправке уведомлений' }, { status: 500 });
  } finally {
    // Всегда закрываем соединение с базой данных
    if (client) {
      await client.end();
    }
  }
}

