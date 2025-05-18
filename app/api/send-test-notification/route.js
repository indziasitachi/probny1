import { NextResponse } from 'next/server';
import webpush from 'web-push';

// Инициализация web-push с VAPID ключами
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error('VAPID keys are not set');
} else {
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function POST() {
  try {
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
