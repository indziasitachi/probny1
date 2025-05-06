import axios from 'axios';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

const MS_TOKEN = '534f3fef594f45bac9acd06ebaebf1940a1130c2';
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
        const errors = [];
        for (const product of products) {
            if (!product.images || !product.images.meta || !product.images.meta.href) {
                console.log(`Товар ${product.name} (${product.id}) — нет фото`);
                result.push({ productId: product.id, imageUrls: [] });
                continue;
            }

            // Получаем список фото для товара
            let images = [];
            try {
                const imagesRes = await axios.get(product.images.meta.href, {
                    headers: {
                        'Accept': 'application/json;charset=utf-8',
                        'Authorization': `Bearer ${MS_TOKEN}`,
                        'User-Agent': 'axios/1.9.0'
                    }
                });
                images = imagesRes.data.rows || [];
            } catch (err) {
                errors.push({ productId: product.id, error: 'Ошибка получения списка фото', details: err.message });
                result.push({ productId: product.id, imageUrls: [] });
                continue;
            }
            console.log(`Товар ${product.name} (${product.id}) — фото: ${images.length}`);
            const imageUrls = [];
            let imgIndex = 1;
            for (const img of images) {
                if (!img.meta || !img.meta.downloadHref) {
                    console.log(`  Пропущено фото (нет downloadHref)`);
                    continue;
                }
                // Формируем уникальное имя файла
                let uniquePart = "";
                if (img.id) {
                    uniquePart = img.id;
                } else if (img.fileName) {
                    uniquePart = path.basename(img.fileName, path.extname(img.fileName));
                } else {
                    uniquePart = imgIndex.toString();
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

                    // Определяем расширение по mime-типу
                    let ext = '.jpg';
                    let mime = img.meta.mimeType || imgRes.headers['content-type'] || 'image/jpeg';
                    if (!img.fileName) {
                        if (mime === 'image/png') ext = '.png';
                        else if (mime === 'image/webp') ext = '.webp';
                        else if (mime === 'image/gif') ext = '.gif';
                        else if (mime === 'image/svg+xml') ext = '.svg';
                        else ext = '.jpg';
                    } else {
                        ext = path.extname(img.fileName) || '.jpg';
                    }
                    const filename = `products/${product.id}_${uniquePart}${ext}`;

                    // Грузим в Cloud.ru
                    await uploadToCloudRu(imgRes.data, filename, mime);
                    const url = `${CLOUDRU_ENDPOINT.replace('https://', `https://${CLOUDRU_BUCKET}.`)}/${filename}`;
                    imageUrls.push(url);
                    console.log(`  Загружено: ${url}`);
                    await new Promise(r => setTimeout(r, 500));
                } catch (err) {
                    errors.push({ productId: product.id, image: img.meta.downloadHref, error: 'Ошибка загрузки фото', details: err.message });
                }
                imgIndex++;
            }
            result.push({ productId: product.id, imageUrls });
        }

        // 3. Сохраняем соответствие id товара → массив url картинок
        fs.writeFileSync('cloudru-images-map.json', JSON.stringify(result, null, 2));
        // 4. Сохраняем ошибки
        fs.writeFileSync('cloudru-errors.json', JSON.stringify(errors, null, 2));
        console.log('Готово! Ссылки сохранены в cloudru-images-map.json, ошибки — в cloudru-errors.json');
    } catch (err) {
        console.error('Ошибка выполнения скрипта:', err.message);
    }
})();