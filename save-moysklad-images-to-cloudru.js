import axios from 'axios';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

const MS_TOKEN = 'b71c06daf79a384ddc640c60661dafe90dfd825a';
const CLOUDRU_BUCKET = 'apsnypack';
const CLOUDRU_ENDPOINT = 'https://s3.cloud.ru';
const CLOUDRU_KEY = '943abc19-52c0-479d-8452-78dd01ad30fd:15c804aa4fc4f54c75b70327284ffe0a';
const CLOUDRU_SECRET = '026bd156904f1e96a594d19bc17b73e2';

// === НАСТРОЙКА S3 ===
const s3 = new AWS.S3({
    accessKeyId: CLOUDRU_KEY,
    secretAccessKey: CLOUDRU_SECRET,
    endpoint: CLOUDRU_ENDPOINT,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    region: 'ru-central-1', // исправлено для Cloud.ru
});

// === ФУНКЦИЯ ЗАГРУЗКИ ФОТО В CLOUD.RU ===
async function uploadToCloudRu(buffer, filename, mime) {
    return s3.upload({
        Bucket: CLOUDRU_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: mime,
        ACL: 'public-read'
    }).promise();
}

(async () => {
    try {
        // 1. Получаем товары из МойСклад
        const productsRes = await axios.get(
            'https://api.moysklad.ru/api/remap/1.2/entity/product?limit=1000',
            {
                headers: {
                    'Accept': 'application/json;charset=utf-8',
                    'Authorization': `Bearer ${MS_TOKEN}`,
                    'User-Agent': 'axios/1.9.0'
                }
            }
        );
        const products = productsRes.data.rows;
        console.log(`Найдено товаров: ${products.length}`);

        // 2. Для каждого товара качаем фото и грузим в Cloud.ru
        const result = [];
        for (const product of products) {
            if (!product.images || !product.images.meta || !product.images.meta.href) {
                console.log(`Товар ${product.name} (${product.id}) — нет фото`);
                continue;
            }

            // Получаем список фото для товара
            const imagesRes = await axios.get(product.images.meta.href, {
                headers: {
                    'Accept': 'application/json;charset=utf-8',
                    'Authorization': `Bearer ${MS_TOKEN}`,
                    'User-Agent': 'axios/1.9.0'
                }
            });
            const images = imagesRes.data.rows || [];
            console.log(`Товар ${product.name} (${product.id}) — фото: ${images.length}`);
            for (const img of images) {
                if (!img.meta || !img.meta.downloadHref) {
                    console.log(`  Пропущено фото (нет downloadHref)`);
                    continue;
                }
                try {
                    // Качаем фото
                    console.log(`  Качаю фото: ${img.meta.downloadHref}`);
                    const imgRes = await axios.get(img.meta.downloadHref, {
                        headers: {
                            'Authorization': `Bearer ${MS_TOKEN}`,
                            'User-Agent': 'axios/1.9.0'
                        },
                        responseType: 'arraybuffer'
                    });

                    // Определяем имя файла
                    const ext = img.fileName ? path.extname(img.fileName) : '.jpg';
                    const filename = `products/${product.id}_${img.id}${ext}`;

                    // Грузим в Cloud.ru
                    await uploadToCloudRu(imgRes.data, filename, img.meta.mimeType || 'image/jpeg');
                    const url = `${CLOUDRU_ENDPOINT.replace('https://', `https://${CLOUDRU_BUCKET}.`)}/${filename}`;
                    result.push({ productId: product.id, imageUrl: url });
                    console.log(`  Загружено: ${url}`);
                    // Пауза между запросами к МойСклад (500 мс)
                    await new Promise(r => setTimeout(r, 500));
                } catch (err) {
                    console.error(`  Ошибка загрузки фото:`, err.message);
                }
            }
        }

        // 3. Сохраняем соответствие id товара → url картинки
        fs.writeFileSync('cloudru-images-map.json', JSON.stringify(result, null, 2));
        console.log('Готово! Ссылки сохранены в cloudru-images-map.json');
    } catch (err) {
        console.error('Ошибка выполнения скрипта:', err.message);
    }
})(); 