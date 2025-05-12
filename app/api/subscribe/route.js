import { NextResponse } from 'next/server';
import { Client } from 'pg';

// Функция для подключения к базе данных (копируем из send-notification)
async function connectToDatabase() {
    const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL или POSTGRES_URL не определен.');
    }
    const client = new Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    return client;
}

export async function POST(request) {
    let client;
    try {
        const subscription = await request.json();
        // subscription: { endpoint, keys: { p256dh, auth }, ... }
        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return NextResponse.json({ message: 'Некорректные данные подписки' }, { status: 400 });
        }
        client = await connectToDatabase();
        // Проверяем, есть ли уже такая подписка
        const { rowCount } = await client.query(
            'SELECT 1 FROM push_subscriptions WHERE endpoint = $1',
            [subscription.endpoint]
        );
        if (rowCount > 0) {
            // Обновляем ключи, если подписка уже есть
            await client.query(
                'UPDATE push_subscriptions SET p256dh = $1, auth = $2 WHERE endpoint = $3',
                [subscription.keys.p256dh, subscription.keys.auth, subscription.endpoint]
            );
        } else {
            // Вставляем новую подписку
            await client.query(
                'INSERT INTO push_subscriptions (endpoint, p256dh, auth) VALUES ($1, $2, $3)',
                [subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
            );
        }
        return NextResponse.json({ message: 'Подписка сохранена' }, { status: 201 });
    } catch (error) {
        console.error('Ошибка при сохранении подписки:', error);
        return NextResponse.json({ message: 'Ошибка сервера при сохранении подписки' }, { status: 500 });
    } finally {
        if (client) await client.end();
    }
}
