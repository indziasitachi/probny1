/* eslint-disable no-undef */
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
    const filePath = path.join(process.cwd(), 'public', 'products.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        res.status(200).json(Array.isArray(parsed) ? parsed : (parsed.products || []));
    } catch {
        res.status(200).json([]);
    }
} 