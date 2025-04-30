/* eslint-env node */

// --- In-memory cache ---
let cache = {
  products: null,
  expires: 0
};
const CACHE_TTL = 3 * 60 * 1000; // 3 минуты

// --- Используем Bearer Token ---
const ACCESS_TOKEN = process.env.MS_TOKEN;

// --- Функции ---
async function fetchAllProducts(token) {
  let all = [];
  let offset = 0;
  const limit = 100;
  let more = true;
  while (more) {
    const res = await fetch(`https://api.moysklad.ru/api/remap/1.2/entity/product?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json;charset=utf-8'
        }
      }
    );
    if (!res.ok) throw new Error('Ошибка загрузки товаров: ' + res.status);
    const data = await res.json();
    all = all.concat(data.rows || []);
    offset += limit;
    more = (data.rows && data.rows.length === limit);
  }
  return all;
}

async function fetchProductImages(products, token) {
  const result = [];
  for (const product of products) {
    let images = [];
    const imagesMetaHref = product.images?.meta?.href;
    if (imagesMetaHref) {
      try {
        const imgListRes = await fetch(imagesMetaHref, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json;charset=utf-8'
          }
        });
        if (imgListRes.ok) {
          const imgListData = await imgListRes.json();
          for (const img of imgListData.rows || []) {
            // 1. Пробуем добавить miniature/tiny превью если есть
            if (img.miniature && img.miniature.href) {
              images.push(img.miniature.href);
              continue;
            }
            if (img.tiny && img.tiny.href) {
              images.push(img.tiny.href);
              continue;
            }
            // 2. Если нет превью — пробуем получить временную ссылку через downloadHref
            if (img.meta && img.meta.downloadHref) {
              try {
                const resp = await fetch(img.meta.downloadHref, { method: 'GET', redirect: 'manual' });
                const location = resp.headers.get('location') || resp.headers.get('Location');
                if (location) {
                  images.push(location);
                }
              } catch (e) {
                console.log('Ошибка получения Location для фото:', e);
              }
            }
          }
        } else {
          console.log(`Ошибка получения списка изображений для товара ${product.name}:`, await imgListRes.text());
        }
      } catch (e) {
        console.log('Ошибка получения изображений:', e);
      }
    }
    result.push({
      id: product.id,
      name: product.name,
      images,
      price: product.salePrices && product.salePrices[0] ? product.salePrices[0].value / 100 : null,
      // Гарантируем, что productFolder.id совпадает с id группы из ms-groups
      productFolder: product.productFolder && product.productFolder.meta && product.productFolder.meta.href
        ? { id: product.productFolder.meta.href.split('/').pop() }
        : null,
    });
  }
  return result;
}

function cleanToken(token) {
  // Удаляем пробелы и невидимые символы
  return token ? token.trim().replace(/\s+/g, '') : '';
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Метод не поддерживается" });
  }

  const now = Date.now();
  const fs = require('fs');
  const path = require('path');
  const cachePath = path.join(process.cwd(), 'public', 'products.json');
  // Если есть свежий файл-кэш, читаем из него
  if (fs.existsSync(cachePath)) {
    try {
      const stat = fs.statSync(cachePath);
      if (now - stat.mtimeMs < 10 * 60 * 1000) { // 10 минут
        const fileData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        return res.status(200).json({ products: fileData });
      }
    } catch (e) { /* если ошибка — продолжаем */ }
  }

  if (cache.products && cache.expires > now) {
    return res.status(200).json({ products: cache.products });
  }

  const cleanedToken = cleanToken(ACCESS_TOKEN);
  console.log('=== API /api/ms-products handler called (Bearer) ===');
  console.log('TOKEN:', cleanedToken);

  try {
    // Получаем все товары с пагинацией
    const allProducts = await fetchAllProducts(cleanedToken);
    const products = await fetchProductImages(allProducts, cleanedToken);

    // Кэшируем результат
    cache.products = products;
    cache.expires = Date.now() + CACHE_TTL;
    // --- Сохраняем в файл-кэш ---
    try {
      fs.writeFileSync(cachePath, JSON.stringify(products, null, 2));
    } catch (e) { /* если ошибка — просто пропускаем */ }

    res.status(200).json({ products });
  } catch (error) {
    cache.products = null;
    cache.expires = 0;
    console.log('API error:', error);
    res.status(500).json({ error: error.message });
  }
}
