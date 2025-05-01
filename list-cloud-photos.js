const AWS = require('aws-sdk');
const fs = require('fs');

// Замените на свои значения:
const BUCKET = 'apsnypack';
const ENDPOINT = 'https://s3.cloud.ru';
const ACCESS_KEY_ID = '943abc19-52c0-479d-8452-78dd01ad30fd:15c804aa4fc4f54c75b70327284ffe0a'; // tenant_id:key_id
const SECRET_ACCESS_KEY = '026bd156904f1e96a594d19bc17b73e2'; // secret_key

const s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    endpoint: ENDPOINT,
    region: 'ru-central-1',
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
});

async function listAllObjects(token) {
    const params = {
        Bucket: BUCKET,
        ContinuationToken: token,
    };
    const result = await s3.listObjectsV2(params).promise();
    return result;
}

(async () => {
    let token = undefined;
    let allObjects = [];
    do {
        const result = await listAllObjects(token);
        allObjects = allObjects.concat(result.Contents);
        token = result.IsTruncated ? result.NextContinuationToken : undefined;
    } while (token);

    // Формируем публичные ссылки
    const links = allObjects.map(obj =>
        `https://${BUCKET}.s3.storage.selcloud.ru/${obj.Key}`
    );

    // Выводим ссылки в консоль
    links.forEach(link => console.log(link));

    // Если нужно сохранить в файл, раскомментируйте строку ниже:
    // fs.writeFileSync('links.txt', links.join('\n'));
})(); 