"use client";
import React, { useEffect, useState } from "react";

export default function GroupPhotoUploader() {
  const [groups, setGroups] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState(null);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    fetch("/api/ms-groups")
      .then(res => res.json())
      .then(data => setGroups(data.groups || []));
  }, []);

  const handleFileChange = async (groupId, file) => {
    setUploading(groupId);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("groupId", groupId);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, image: data.url } : g));
        setChanged(true);
      } else {
        setError("Ошибка загрузки файла");
      }
    } catch (e) {
      setError("Ошибка загрузки файла");
    }
    setUploading(null);
  };

  const handleSave = async () => {
    setError(null);
    try {
      // Отправляем обновлённые иконки на сервер для сохранения в groups.json/subgroups.json
      const res = await fetch("/api/save-icons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups })
      });
      if (!res.ok) throw new Error("Ошибка сохранения на сервере");
      setChanged(false);
    } catch (e) {
      setError(e.message || "Ошибка сохранения");
    }
  };

  return (
    <div className="my-8 p-6 bg-white rounded shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Фото групп и подгрупп</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {groups.map(g => (
          <div key={g.id} className="flex flex-col items-center bg-gray-50 p-3 rounded shadow-sm mb-4">
            <div className="relative w-20 h-20 mb-2">
              {g.image && (
                <img
                  src={g.image}
                  alt={g.name}
                  className="w-20 h-20 object-contain rounded border bg-white"
                />
              )}
              {uploading === g.id && (
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
                  if (e.target.files[0]) handleFileChange(g.id, e.target.files[0]);
                }}
              />
              <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded cursor-pointer text-xs hover:bg-blue-700 transition">Изменить</span>
            </label>
          </div>
        ))}
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
