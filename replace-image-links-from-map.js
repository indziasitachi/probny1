const fs = require('fs');

// Загружаем базу товаров и карту ссылок
const products = JSON.parse(fs.readFileSync('products.json', 'utf-8'));
const imageMap = JSON.parse(fs.readFileSync('cloudru-images-map.json', 'utf-8'));

// Создаём быстрый поиск по productId
const mapById = {};
imageMap.forEach(item => {
    mapById[item.productId] = item.imageUrl;
});

// Заменяем ссылки
products.forEach(product => {
    if (mapById[product.id]) {
        product.image = mapById[product.id];
        // Если у товара есть массив images, заменяем первый элемент
        if (Array.isArray(product.images) && product.images.length > 0) {
            product.images[0] = mapById[product.id];
        } else if (Array.isArray(product.images)) {
            // Если массив пустой, добавляем ссылку
            product.images.push(mapById[product.id]);
        }
    }
    // Если у товара несколько фото (массив), раскомментируйте:
    // if (Array.isArray(product.images)) {
    //   product.images = product.images.map((img, idx) => imageMap.find(m => m.productId === product.id && m.index === idx)?.imageUrl || img);
    // }
});

// Сохраняем результат
fs.writeFileSync('products-updated.json', JSON.stringify(products, null, 2));
console.log('Готово! Ссылки обновлены и сохранены в products-updated.json'); 