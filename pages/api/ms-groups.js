/* eslint-env node */
// API: /api/ms-groups
// Получает все группы и подгруппы (категории) товаров из МойСклад

export default async function handler(req, res) {
  const token = process.env.MS_TOKEN; // или получите токен так же, как в ms-products.js
  if (!token) return res.status(401).json({ error: 'No MS_TOKEN' });

  try {
    let all = [];
    let offset = 0;
    const limit = 100;
    let more = true;
    while (more) {
      const resp = await fetch(`https://api.moysklad.ru/api/remap/1.2/entity/productfolder?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json;charset=utf-8'
          }
        }
      );
      if (!resp.ok) return res.status(resp.status).json({ error: await resp.text() });
      const data = await resp.json();
      all = all.concat(data.rows || []);
      offset += limit;
      more = (data.rows && data.rows.length === limit);
    }

    // --- ДОБАВЛЯЕМ КАРТИНКИ К ГРУППАМ ИЗ groups.json ---
    let groupIcons = {};
    try {
      const fs = require('fs');
      const path = require('path');
      const iconsPath = path.join(process.cwd(), 'public', 'icons', 'groups.json');
      if (fs.existsSync(iconsPath)) {
        groupIcons = JSON.parse(fs.readFileSync(iconsPath, 'utf8'));
      }
    } catch (e) {/* ignore */ }
    // --- ДОБАВЛЯЕМ КАРТИНКИ К ПОДГРУППАМ ИЗ subgroups.json ---
    let subgroupsIcons = {};
    try {
      const fs = require('fs');
      const path = require('path');
      const iconsPath = path.join(process.cwd(), 'public', 'icons', 'subgroups.json');
      if (fs.existsSync(iconsPath)) {
        const arr = JSON.parse(fs.readFileSync(iconsPath, 'utf8'));
        arr.forEach(sg => {
          subgroupsIcons[sg.name] = sg.icon;
        });
      }
    } catch (e) {/* ignore */ }
    // --- ДОБАВЛЯЕМ ПОЛЕ image К КАЖДОЙ ГРУППЕ ---
    all = all.map(g => {
      // ищем по name или slug (если есть)
      let image = null;
      // для групп
      for (const key in groupIcons) {
        if (groupIcons[key].name === g.name && groupIcons[key].icon) image = groupIcons[key].icon;
      }
      // для подгрупп
      if (!image && subgroupsIcons[g.name]) image = subgroupsIcons[g.name];
      return { ...g, image };
    });

    // Возвращаем все группы/подгруппы
    return res.status(200).json({ groups: all });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
