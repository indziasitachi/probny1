/* eslint-env node */

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Метод не поддерживается" });
  }
  try {
    const filePath = path.join(process.cwd(), 'products.json');
    const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const mapPath = path.join(process.cwd(), 'cloudru-images-map.json');
    const imageMapArr = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    const imageMap = Object.fromEntries(imageMapArr.map(item => [item.productId, item.imageUrls]));
    const productsWithCloudru = products.map(product => ({
      ...product,
      image: imageMap[product.id]?.[0] || null,
      images: imageMap[product.id] || []
    }));
    res.status(200).json({ products: productsWithCloudru });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
