const fs = require('fs');

const file = 'products.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

let changed = false;

data.forEach(product => {
    if (Array.isArray(product.images)) {
        const filtered = product.images.filter(img => !img.includes('api.moysklad.ru'));
        if (filtered.length !== product.images.length) changed = true;
        product.images = filtered;
    }
});

if (changed) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    console.log('Старые ссылки на МойСклад удалены.');
} else {
    console.log('Ссылок на МойСклад не найдено.');
} 