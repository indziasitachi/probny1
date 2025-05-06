const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

// Пути к файлам
const PRODUCTS_PATH = path.join(__dirname, 'public/products.json');
const GROUPS_PATH = path.join(__dirname, 'public/icons/groups.json');
const OUTPUT_PATH = path.join(__dirname, 'public/products-frontend.json');

// S3 bucket для формирования публичных ссылок на фото
const S3_BASE_URL = 'https://apsnypack.s3.cloud.ru';
const BUCKET = 'apsnypack';
const ENDPOINT = 'https://s3.cloud.ru';
const ACCESS_KEY_ID = '943abc19-52c0-479d-8452-78dd01ad30fd:15c804aa4fc4f54c75b70327284ffe0a';
const SECRET_ACCESS_KEY = '026bd156904f1e96a594d19bc17b73e2';

const s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    endpoint: ENDPOINT,
    region: 'ru-central-1',
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
});

async function listAllObjects(prefix = '', token) {
    const params = {
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: token,
    };
    const result = await s3.listObjectsV2(params).promise();
    return result;
}

(async () => {
    // Получаем список всех файлов из S3
    let token = undefined;
    let allObjects = [];
    do {
        const result = await listAllObjects('products/', token);
        allObjects = allObjects.concat(result.Contents);
        token = result.IsTruncated ? result.NextContinuationToken : undefined;
    } while (token);

    // Массив всех файлов с полным путём
    const allS3Files = allObjects.map(obj => obj.Key);

    // Чтение и парсинг JSON-файлов
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
    const groups = JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'));

    // Собираем структуру групп с товарами
    const groupList = Object.entries(groups).map(([groupId, groupData]) => {
        // Фильтруем товары, относящиеся к этой группе
        const groupProducts = products
            .filter(product => product.productFolder && product.productFolder.id === groupId)
            .map(product => {
                // Ищем все файлы, начинающиеся с id товара (любое расширение)
                const productImages = allS3Files
                    .filter(key => key.startsWith(`products/${product.id}`))
                    .map(key => `${S3_BASE_URL}/${key}`);
                return {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    images: productImages,
                    imageUrl: productImages[0] || null
                };
            });

        return {
            id: groupId,
            name: groupData.name,
            slug: groupData.slug,
            icon: groupData.icon,
            products: groupProducts
        };
    });

    // Сохраняем результат
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(groupList, null, 2), 'utf8');

    console.log(`Готово! Сохранено ${groupList.length} групп в ${OUTPUT_PATH}`);
})(); 