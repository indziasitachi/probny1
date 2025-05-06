import React from 'react';
import { useState, useEffect } from "react";

function groupArrayToObject(arr, originalObj) {
  // arr: [{name, icon, slug}...], originalObj: {slug: {name, icon}}
  const obj = {};
  arr.forEach(g => {
    // ищем ключ по совпадению name или slug
    let key = g.slug;
    if (!key && originalObj) {
      for (const k in originalObj) {
        if (originalObj[k].name === g.name) key = k;
      }
    }
    obj[key || g.name] = { ...g };
  });
  return obj;
}

function subgroupsArrayToObject(arr, originalObj) {
  // arr: [{name, icon, slug}], originalObj: {groupSlug: [subgroups]}
  const obj = {};
  if (!originalObj) return obj;
  Object.keys(originalObj).forEach(groupSlug => {
    obj[groupSlug] = arr.filter(sg =>
      originalObj[groupSlug].some(orig => orig.name === sg.name)
    );
  });
  return obj;
}


export default function GroupPhotoUploader() {
  const [groups, setGroups] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState(null);
  const [originalGroupsObj, setOriginalGroupsObj] = useState({});
  const [originalSubgroupsObj, setOriginalSubgroupsObj] = useState({});
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    fetch("/api/groups-subgroups")
      .then(res => res.json())
      .then(data => {
        setGroups(data.groups || []);
        setSubgroups(data.subgroups || []);
        // Получаем оригинальные объекты для сохранения
        fetch("/icons/groups.json").then(r => r.json()).then(setOriginalGroupsObj);
        fetch("/icons/subgroups.json").then(r => r.json()).then(setOriginalSubgroupsObj);
      });
  }, []);

  const handleFileChange = async (type, slug, file) => {
    setUploading(`${type}-${slug}`);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        if (type === "group") {
          setGroups(prev => prev.map(g => (g.slug === slug || g.name === slug) ? { ...g, icon: data.url } : g));
        } else {
          setSubgroups(prev => prev.map(sg => (sg.slug === slug || sg.name === slug) ? { ...sg, icon: data.url } : sg));
        }
        setChanged(true);
      } else {
        setError("Ошибка загрузки файла");
      }
    } catch (e) {
      setError("Ошибка загрузки файла");
    }
    setUploading(null);
  };

  async function handleSave() {
    setError(null);
    try {
      const groupIcons = groupArrayToObject(groups, originalGroupsObj);
      const subgroupIcons = subgroupsArrayToObject(subgroups, originalSubgroupsObj);
      const res = await fetch("/api/save-icons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupIcons, subgroupIcons })
      });
      if (!res.ok) throw new Error("Ошибка сохранения на сервере");
      setChanged(false);
    } catch (e) {
      setError(e.message || "Ошибка сохранения");
    }
  }

  return (
    <div className="my-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Настройка логотипов групп и подгрупп</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-2">Группы</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {groups.map(g => (
              <div key={g.slug || g.name} className="flex flex-col items-center bg-gray-50 p-3 rounded shadow-sm">
                <div className="relative w-20 h-20 mb-2">
                  {g.icon && (
                    <img
                      src={g.icon}
                      alt={g.name}
                      className="w-20 h-20 object-contain rounded border bg-white"
                    />
                  )}
                  {uploading === `group-${g.slug}` && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-gray-600 text-xs">Загрузка...</div>
                  )}
                </div>
                <div className="text-center text-xs font-medium mb-1">{g.name}</div>
                <label className="block w-full">
                  <span className="sr-only">Выбрать файл</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files[0]) handleFileChange("group", g.slug, e.target.files[0]);
                    }}
                  />
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded cursor-pointer text-xs hover:bg-blue-700 transition">Изменить</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Подгруппы</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {subgroups.map(sg => (
              <div key={sg.slug || sg.name} className="flex flex-col items-center bg-gray-50 p-3 rounded shadow-sm">
                <div className="relative w-20 h-20 mb-2">
                  {sg.icon && (
                    <img
                      src={sg.icon}
                      alt={sg.name}
                      className="w-20 h-20 object-contain rounded border bg-white"
                    />
                  )}
                  {uploading === `subgroup-${sg.slug}` && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-gray-600 text-xs">Загрузка...</div>
                  )}
                </div>
                <div className="text-center text-xs font-medium mb-1">{sg.name}</div>
                <label className="block w-full">
                  <span className="sr-only">Выбрать файл</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files[0]) handleFileChange("subgroup", sg.slug, e.target.files[0]);
                    }}
                  />
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded cursor-pointer text-xs hover:bg-blue-700 transition">Изменить</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      {changed && (
        <button
          className="mt-6 px-8 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition"
          onClick={handleSave}
          disabled={uploading}
        >
          Сохранить изменения
        </button>
      )}
      {error && <div className="text-red-600 mt-4">{error}</div>}
      {!error && !uploading && !changed && <div className="text-green-600 mt-4">Все изменения сохранены</div>}
    </div>
  );
}
