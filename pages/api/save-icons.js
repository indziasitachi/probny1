/* eslint-env node */
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Группы и подгруппы могут приходить как массив, а не как объект
      let { groups, groupIcons, subgroupIcons } = req.body;
      if (groups && Array.isArray(groups)) {
        // Сохраняем группы по slug в groups.json, подгруппы — в subgroups.json
        const groupsObj = {};
        const subgroupsArr = [];
        groups.forEach(g => {
          if (g.parent && g.parent.meta && g.parent.meta.href) {
            // Это подгруппа
            subgroupsArr.push({
              name: g.name,
              slug: g.slug || g.id,
              groupSlug: g.parent.meta.href.split('/').pop(),
              icon: g.image || null
            });
          } else {
            // Это группа
            groupsObj[g.slug || g.id] = {
              name: g.name,
              slug: g.slug || g.id,
              icon: g.image || null
            };
          }
        });
        fs.writeFileSync(path.join(process.cwd(), 'public', 'icons', 'groups.json'), JSON.stringify(groupsObj, null, 2));
        fs.writeFileSync(path.join(process.cwd(), 'public', 'icons', 'subgroups.json'), JSON.stringify(subgroupsArr, null, 2));
      } else if (groupIcons && subgroupIcons) {
        fs.writeFileSync(path.join(process.cwd(), 'public', 'icons', 'groups.json'), JSON.stringify(groupIcons, null, 2));
        fs.writeFileSync(path.join(process.cwd(), 'public', 'icons', 'subgroups.json'), JSON.stringify(subgroupIcons, null, 2));
      } else {
        throw new Error('Нет данных для сохранения');
      }
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
