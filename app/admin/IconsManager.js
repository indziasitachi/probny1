import React, { useState } from "react";

// Пример: groups = [{slug: "пищевая-упаковка", name: "Пищевая упаковка", icon: "/icons/groups/food.svg"}, ...]
// Аналогично для subgroups

export default function IconsManager({ groups, subgroups, onSave }) {
  const [groupIcons, setGroupIcons] = useState(() => Object.fromEntries(groups.map(g => [g.slug, g.icon || ""])))
  const [subgroupIcons, setSubgroupIcons] = useState(() => Object.fromEntries(subgroups.map(sg => [sg.slug, sg.icon || ""])))

  const handleFileChange = async (slug, type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url) {
      if (type === "group") setGroupIcons(prev => ({...prev, [slug]: data.url}));
      else setSubgroupIcons(prev => ({...prev, [slug]: data.url}));
    }
  };


  const handleSave = () => {
    onSave(groupIcons, subgroupIcons);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Иконки групп</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {groups.map((g, i) => {
            const uniqueKey = g.slug || g.name || i;
            return (
              <div key={uniqueKey} className="flex flex-col items-center">
                <div className="w-16 h-16 mb-2 flex items-center justify-center bg-gray-100 rounded-full overflow-hidden">
                  {groupIcons[uniqueKey] ? <img src={groupIcons[uniqueKey]} alt={g.name} className="w-12 h-12 object-contain" /> : <span className="text-gray-400">Нет</span>}
                </div>
                <div className="mb-1 text-center text-sm font-medium">{g.name}</div>
                <input type="file" accept=".svg,.png,.jpg,.jpeg" onChange={e => handleFileChange(uniqueKey, "group", e.target.files[0])} />
              </div>
            )
          })} 
      </div>
      <h2 className="text-xl font-bold mb-4">Иконки подгрупп</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {subgroups.map((sg, i) => {
            const uniqueKey = sg.slug || sg.name || i;
            return (
              <div key={uniqueKey} className="flex flex-col items-center">
                <div className="w-14 h-14 mb-2 flex items-center justify-center bg-gray-100 rounded-full overflow-hidden">
                  {subgroupIcons[uniqueKey] ? <img src={subgroupIcons[uniqueKey]} alt={sg.name} className="w-10 h-10 object-contain" /> : <span className="text-gray-400">Нет</span>}
                </div>
                <div className="mb-1 text-center text-xs font-medium">{sg.name}</div>
                <input type="file" accept=".svg,.png,.jpg,.jpeg" onChange={e => handleFileChange(uniqueKey, "subgroup", e.target.files[0])} />
              </div>
            )
          })} 
      </div>
      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold" onClick={handleSave}>Сохранить</button>
    </div>
  );
}
