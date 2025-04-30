import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export default async function handler(req, res) {
  const ACCESS_TOKEN = process.env.MS_TOKEN;
  const { url } = req.query;
  if (!url) {
    return res.status(400).send("Missing url");
  }

  // --- Файловый кэш ---
  const cacheDir = path.join(process.cwd(), "public", "ms-cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  // Хешируем url для имени файла
  const hash = crypto.createHash("md5").update(url).digest("hex");
  const ext = ".jpg"; // Можно попытаться определить по content-type, но для большинства фото jpg
  const cacheFile = path.join(cacheDir, hash + ext);

  // Если файл уже есть в кэше — отдаём его
  if (fs.existsSync(cacheFile)) {
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=604800");
    return res.send(fs.readFileSync(cacheFile));
  }

  // Если нет — скачиваем, сохраняем и отдаём
  const msRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Accept': 'application/json;charset=utf-8',
      'User-Agent': 'Mozilla/5.0 (compatible; CascadeBot/1.0)'
    }
  });

  if (!msRes.ok) {
    return res.status(msRes.status).send("Failed to load image");
  }

  const contentType = msRes.headers.get("content-type") || "image/jpeg";
  const buffer = await msRes.buffer();
  fs.writeFileSync(cacheFile, buffer); // Сохраняем в кэш
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=604800"); // Кэшировать 7 дней
  res.send(buffer);
}
