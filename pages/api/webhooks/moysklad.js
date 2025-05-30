/* eslint-env node */
import axios from 'axios';
import AWS from 'aws-sdk';
import fs from 'fs/promises'; // Используем promises версию fs
import path from 'path';

// Получаем чувствительные данные из переменных окружения Vercel
const MS_TOKEN = process.env.MS_TOKEN;
const CLOUDRU_BUCKET = process.env.CLOUDRU_BUCKET;
const CLOUDRU_ENDPOINT = process.env.CLOUDRU_ENDPOINT;
const CLOUDRU_KEY = process.env.CLOUDRU_KEY;
const CLOUDRU_SECRET = process.env.CLOUDRU_SECRET;

// Проверка наличия всех необходимых переменных окружения
if (!MS_TOKEN || !CLOUDRU_BUCKET || !CLOUDRU_ENDPOINT || !CLOUDRU_KEY || !CLOUDRU_SECRET) {
    console.error('ERROR: Missing required environment variables for webhook handler.');
    // В реальном приложении здесь можно выбросить ошибку или корректно обработать ситуацию
    // Для вебхука, возможно, стоит просто залогировать и завершить выполнение
}

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('Received MoySklad webhook.');

    const webhookData = req.body;

    // Ищем событие, связанное с товаром
    const productEvent = webhookData.events.find(event => event.entity.type === 'product');

    if (!productEvent) {
      console.log('No product event found in webhook.');
      return res.status(200).json({ message: 'No product event to process' });
    }

    const productId = productEvent.entity.id;
    console.log(`Processing product with ID: ${productId}`);

    // 1. Получаем полные данные товара из MoySklad API
    const productResponse = await axios.get(
      `https://api.moysklad.ru/api/remap/1.2/entity/product/${productId}`,
      {
        headers: {
          'Accept': 'application/json;charset=utf-8',
          'Authorization': `Bearer ${MS_TOKEN}`,
          'User-Agent': 'axios'
        }
      }
    );

    const productData = productResponse.data;
    console.log('Fetched product data:', productData.name);

    // 2. Обработать изображения
    const imageUrlsCloudRu = [];
    if (productData.images && productData.images.meta && productData.images.meta.href) {
      try {
        const imagesRes = await axios.get(productData.images.meta.href, {
          headers: {
            'Accept': 'application/json;charset=utf-8',
            'Authorization': `Bearer ${MS_TOKEN}`,
            'User-Agent': 'axios'
          }
        });
        const images = imagesRes.data.rows || [];
        console.log(`  Found ${images.length} images for product ${productData.name}`);

        let imgIndex = 1;
        for (const img of images) {
          if (!img.meta || !img.meta.downloadHref) {
            console.log(`  Skipping image (no downloadHref)`);
            continue;
          }

          try {
            // Качаем фото из MoySklad
            console.log(`  Downloading image: ${img.meta.downloadHref}`);
            const imgRes = await axios.get(img.meta.downloadHref, {
              headers: {
                'Authorization': `Bearer ${MS_TOKEN}`,
                'User-Agent': 'axios'
              },
              responseType: 'arraybuffer'
            });

            // Определяем расширение и mime-тип
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

            // Формируем уникальное имя файла для Cloud.ru
            let uniquePart = img.id || imgIndex.toString();
            const filename = `products/${productId}_${uniquePart}${ext}`;

            // Грузим в Cloud.ru
            console.log(`  Uploading image to Cloud.ru: ${filename}`);
            const uploadResult = await uploadToCloudRu(imgRes.data, filename, mime);
            const url = uploadResult.Location; // Получаем URL из результата загрузки
            imageUrlsCloudRu.push(url);
            console.log(`  Uploaded: ${url}`);

          } catch (uploadError) {
            console.error(`  Error processing image ${imgIndex}:`, uploadError.message);
          }
          imgIndex++;
        }
      } catch (imgListError) {
        console.error('Error fetching image list from MoySklad:', imgListError.message);
      }
    }


    console.log('Finished image processing. Cloud.ru URLs:', imageUrlsCloudRu);

    // 3. Обновить локальные файлы products.json и cloudru-images-map.json
    const productsFilePath = path.join(process.cwd(), 'public', 'products.json');
    const imageMapFilePath = path.join(process.cwd(), 'cloudru-images-map.json'); // Обратите внимание: imageMap находится в корне, не в public

    try {
      // Читаем текущие данные
      const productsData = JSON.parse(await fs.readFile(productsFilePath, 'utf-8'));
      const imageMapData = JSON.parse(await fs.readFile(imageMapFilePath, 'utf-8'));

      // Обновляем или добавляем товар в productsData
      const productIndex = productsData.findIndex(p => p.id === productId);
      if (productIndex > -1) {
        // Обновляем существующий товар
        productsData[productIndex] = { ...productsData[productIndex], ...productData };
        console.log(`Updated product ${productId} in products.json`);
      } else {
        // Добавляем новый товар
        productsData.push(productData);
        console.log(`Added new product ${productId} to products.json`);
      }

      // Обновляем или добавляем карту изображений в imageMapData
      const imageMapIndex = imageMapData.findIndex(item => item.productId === productId);
      if (imageMapIndex > -1) {
        // Обновляем карту изображений для существующего товара
        imageMapData[imageMapIndex].imageUrls = imageUrlsCloudRu;
        console.log(`Updated image map for product ${productId}`);
      } else {
        // Добавляем новую карту изображений
        imageMapData.push({ productId: productId, imageUrls: imageUrlsCloudRu });
        console.log(`Added new image map for product ${productId}`);
      }

      // Записываем обновленные данные обратно в файлы
      await fs.writeFile(productsFilePath, JSON.stringify(productsData, null, 2), 'utf-8');
      await fs.writeFile(imageMapFilePath, JSON.stringify(imageMapData, null, 2), 'utf-8');

      console.log('Successfully updated local data files.');

    } catch (fileError) {
      console.error('Error updating local data files:', fileError.message);
      // Важно: Если здесь произошла ошибка, нужно решить, как реагировать.
      // Возможно, стоит логировать и отправить 500, чтобы MoySklad попробовал снова.
      res.status(500).json({ message: 'Error updating local data files' });
      return; // Прерываем выполнение, чтобы не отправлять успешный ответ
    }

    res.status(200).json({ message: `Product ${productId} processed successfully` });
  } catch (error) {
    console.error('Error processing MoySklad webhook:', error);
    // В случае ошибки, MoySklad может повторить отправку вебхука
    res.status(500).json({ message: 'Error processing webhook' });
  }
}