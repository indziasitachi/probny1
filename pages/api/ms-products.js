/* eslint-env node */

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Метод не поддерживается" });
  }
  try {
    const filePath = path.join(process.cwd(), 'products-updated.json');
    const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.status(200).json({ products });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка чтения products-updated.json: ' + e.message });
  }
}
