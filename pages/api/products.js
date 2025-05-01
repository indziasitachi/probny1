/* eslint-disable no-undef */
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
    const filePath = path.join(process.cwd(), 'public', 'products.json');
    const imageMapPath = path.join(process.cwd(), 'cloudru-images-map.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        const imageMap = JSON.parse(await fs.readFile(imageMapPath, 'utf-8'));
        const getImage = (id) => {
            const found = imageMap.find(item => item.productId === id);
            return found ? found.imageUrl : null;
        };
        const enriched = (Array.isArray(parsed) ? parsed : (parsed.products || [])).map(p => ({
            ...p,
            image: getImage(p.id) || p.image || (Array.isArray(p.images) ? p.images[0] : null) || null
        }));
        res.status(200).json(enriched);
    } catch {
        res.status(200).json([]);
    }
} 