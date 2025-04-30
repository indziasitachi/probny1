/* eslint-env node */
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { url, id } = req.query;
  if (!url || !id) return res.status(400).send('Missing url or id');

  // Определяем путь для кэша
  const cacheDir = path.join(process.cwd(), 'public', 'ms-cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  // Имя файла — id + расширение из url (если есть)
  const ext = path.extname(url.split('?')[0]) || '.jpg';
  const fileName = `${id}${ext}`;
  const filePath = path.join(cacheDir, fileName);

  // Если файл уже есть — отдаём его
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', getMimeType(ext));
    return res.send(fs.readFileSync(filePath));
  }

  // Если файла нет — скачиваем, сохраняем и отдаём
  try {
    const imgRes = await fetch(url);
    if (!imgRes.ok) return res.status(imgRes.status).send('Failed to fetch image');
    const arrayBuffer = await imgRes.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    res.setHeader('Content-Type', getMimeType(ext));
    return res.send(Buffer.from(arrayBuffer));
  } catch (e) {
    return res.status(500).send('Image cache error: ' + e.message);
  }
}

function getMimeType(ext) {
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    default: return 'application/octet-stream';
  }
}
