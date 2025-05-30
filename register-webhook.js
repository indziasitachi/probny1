/* eslint-env node */
import axios from 'axios';

// Возьмем токен из существующего скрипта. В продакшене лучше использовать .env
const MS_TOKEN = '534f3fef594f45bac9acd06ebaebf1940a1130c2';

// !!! ЗАМЕНИТЕ ЭТОТ URL НА ВАШ ПУБЛИЧНЫЙ URL ДЛЯ WEBHOOK API ENDPOINT !!!
const YOUR_PUBLIC_WEBHOOK_URL = 'https://your-website-domain.com/api/webhooks/moysklad';
// Если вы используете ngrok, URL будет что-то вроде: https://RANDOM_STRING.ngrok.io/api/webhooks/moysklad

async function registerWebhook() {
    if (YOUR_PUBLIC_WEBHOOK_URL === 'https://your-website-domain.com/api/webhooks/moysklad') {
        console.error('ERROR: Please replace YOUR_PUBLIC_WEBHOOK_URL with your actual public webhook URL.');
        process.exit(1);
    }

    try {
        console.log(`Attempting to register webhook for URL: ${YOUR_PUBLIC_WEBHOOK_URL}`);

        const response = await axios.post(
            'https://api.moysklad.ru/api/remap/1.2/entity/webhook',
            {
                url: YOUR_PUBLIC_WEBHOOK_URL,
                entityType: 'product',
                action: 'CREATE', // Регистрируем для создания товара
                //action: 'UPDATE', // Также можно добавить для обновления
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MS_TOKEN}`,
                    'User-Agent': 'axios'
                }
            }
        );

        console.log('Webhook registered successfully:', response.data);

        // Вы можете зарегистрировать вебхук и для события UPDATE
        const updateResponse = await axios.post(
            'https://api.moysklad.ru/api/remap/1.2/entity/webhook',
            {
                url: YOUR_PUBLIC_WEBHOOK_URL,
                entityType: 'product',
                action: 'UPDATE', // Регистрируем для обновления товара
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MS_TOKEN}`,
                    'User-Agent': 'axios'
                }
            }
        );
        console.log('Webhook for UPDATE registered successfully:', updateResponse.data);

    } catch (error) {
        console.error('Error registering webhook:', error.response ? error.response.data : error.message);
    }
}

registerWebhook();
