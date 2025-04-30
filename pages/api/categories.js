/* eslint-disable no-undef */
import fs from "fs";
import path from "path";

const categoriesPath = path.join(process.cwd(), "public", "categories.json");

export default function handler(req, res) {
  if (req.method === "GET") {
    let data = [];
    try {
      if (fs.existsSync(categoriesPath)) {
        data = JSON.parse(fs.readFileSync(categoriesPath, "utf-8"));
      }
    } catch (e) {
      return res.status(500).json({ error: "Ошибка чтения категорий" });
    }
    return res.status(200).json(data);
  }
  if (req.method === "POST") {
    try {
      fs.writeFileSync(categoriesPath, JSON.stringify(req.body, null, 2), "utf-8");
    } catch (e) {
      return res.status(500).json({ error: "Ошибка сохранения категорий" });
    }
    return res.status(200).json({ ok: true });
  }
  res.status(405).json({ error: "Метод не поддерживается" });
}
