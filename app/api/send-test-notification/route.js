import { NextResponse } from 'next/server';
import webpush from 'web-push';

// Получаем VAPID ключи из переменных окружения
const getVapidKeys = () => {
  if (typeof process === 'undefined') {
    // На клиенте используем глобальные переменные
    return {
      publicKey: globalThis.process?.env?.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      privateKey: globalThis.process?.env?.VAPID_PRIVATE_KEY || ''
    };
  }
  
  // На сервере используем process.env
  return {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || ''
  };
};

const { publicKey, privateKey } = getVapidKeys();

// Инициализируем web-push только если ключи доступны
if (publicKey && privateKey) {
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    publicKey,
    privateKey
  );
} else {
  console.error('VAPID keys are not properly configured');
}

export async function POST() {
  try {
    // Проверяем наличие VAPID ключей
    if (!publicKey || !privateKey) {
      return NextResponse.json(
        { message: 'VAPID ключи не настроены на сервере' },
        { status: 500 }
      );
    }

    // Здесь должен быть код для получения подписок из вашей БД
    // Это пример - замените на реальный запрос к вашей БД
    const subscriptions = []; // await db.subscription.findMany();
    
    if (subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'Нет активных подписок' },
        { status: 400 }
      );
    }

    // Отправляем уведомление каждой подписке
    const results = await Promise.allSettled(
      subscriptions.map(subscription => {
        return webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: 'Тестовое уведомление',
            body: 'Поздравляем! Push-уведомления работают!',
            icon: '/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
              url: window.location.href
            }
          })
        ).catch(error => {
          console.error('Ошибка при отправке уведомления:', error);
          // Здесь можно добавить логику удаления недействительных подписок
          // await db.subscription.delete({ where: { id: subscription.id } });
          return { status: 'error', error: error.message };
        });
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = results.length - successCount;

    return NextResponse.json({
      message: `Уведомления отправлены. Успешно: ${successCount}, с ошибками: ${errorCount}`,
      details: results
    });

  } catch (error) {
    console.error('Ошибка при отправке тестовых уведомлений:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при отправке уведомлений', error: error.message },
      { status: 500 }
    );
  }
}

// Отключаем кэширование
export const dynamic = 'force-dynamic';
