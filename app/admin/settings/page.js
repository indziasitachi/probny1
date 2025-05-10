// app/admin/settings/page.js
"use client";
import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";

// Компоненты, которые раньше были на главной странице админки,
// теперь могут быть здесь или вынесены в другие разделы.
// Пока оставим AdminCategories здесь, GroupPhotoUploader тоже для примера.
const AdminCategories = dynamic(() => import("../AdminCategories.jsx"), { ssr: false }); 
// Убедитесь, что путь "../AdminCategories.jsx" корректен из app/admin/settings/
import GroupPhotoUploader from "../GroupPhotoUploader"; 
// Убедитесь, что путь "../GroupPhotoUploader" корректен

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      }).catch(err => {
        console.error("Failed to load settings:", err);
        setLoading(false);
        // Можно установить какие-то дефолтные настройки или показать ошибку
      });
  }, []);

  function handleChange(path, value) {
    setSettings((prev) => {
      // Глубокое копирование, чтобы избежать мутаций
      const copy = JSON.parse(JSON.stringify(prev)); 
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) {
        // Если на пути нет объекта, создаем его
        if (!ref[path[i]]) ref[path[i]] = {}; 
        ref = ref[path[i]];
      }
      ref[path[path.length - 1]] = value;
      return copy;
    });
  }

  async function saveSettings() {
    if (!settings) {
      alert("Настройки не загружены, сохранение невозможно.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        throw new Error(`Failed to save settings: ${res.statusText}`);
      }
      alert("Настройки успешно сохранены!"); // Добавим оповещение
    } catch (error) {
      console.error("Error saving settings:", error);
      alert(`Ошибка при сохранении настроек: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  // const [showUploader, setShowUploader] = useState(false); // GroupPhotoUploader теперь на странице /admin/media

  if (loading) {
    return <div className="text-white">Загрузка настроек...</div>;
  }

  if (!settings) {
    return <div className="text-white">Не удалось загрузить настройки. Пожалуйста, проверьте консоль или попробуйте обновить страницу.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Настройки Сайта</h1>
        {/* GroupPhotoUploader и кнопка для него убраны, т.к. он теперь на странице /admin/media */}
      </div>
      {/* {showUploader && <div className="mb-6"><GroupPhotoUploader /></div>} */}

      <div className="space-y-6">
        {/* Логотип */}
        {settings.logo && (
          <div className="p-4 bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3 text-gray-100">Логотип</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm text-gray-300 mb-1">Текст логотипа</span>
                <input className="border rounded px-3 py-2 text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" value={settings.logo.text || ''} onChange={e => handleChange(["logo", "text"], e.target.value)} />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-300 mb-1">Цвет текста</span>
                <input type="color" className="w-full h-10 p-1 border-none rounded" value={settings.logo.color || '#FFFFFF'} onChange={e => handleChange(["logo", "color"], e.target.value)} />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-300 mb-1">Размер шрифта (px)</span>
                <input type="number" min={10} max={72} className="border rounded px-3 py-2 text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" value={settings.logo.fontSize || 16} onChange={e => handleChange(["logo", "fontSize"], Number(e.target.value))} />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-300 mb-1">Цвет кружки</span>
                <input type="color" className="w-full h-10 p-1 border-none rounded" value={settings.logo.cupColor || '#FF0000'} onChange={e => handleChange(["logo", "cupColor"], e.target.value)} />
              </label>
              <label className="flex items-center gap-2 col-span-1 md:col-span-2 mt-2">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" checked={settings.logo.showCup || false} onChange={e => handleChange(["logo", "showCup"], e.target.checked)} />
                <span className="text-sm text-gray-300">Показывать кружку</span>
              </label>
            </div>
          </div>
        )}

        {/* Баннеры */}
        {settings.banners && (
          <div className="p-4 bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3 text-gray-100">Баннеры</h2>
            {settings.banners.map((b, i) => (
              <div key={i} className="p-3 border border-gray-700 rounded-md mb-3 space-y-2">
                <input className="w-full border rounded px-3 py-2 text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" placeholder="URL картинки или видео" value={b.image || ''} onChange={e => {
                  const arr = [...settings.banners]; arr[i].image = e.target.value; handleChange(["banners"], arr);
                }} />
                <input type="file" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*,video/*" onChange={async e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('file', file);
                  const res = await fetch('/api/upload', { method: 'POST', body: formData }); // Убедитесь, что /api/upload существует и работает
                  const data = await res.json();
                  if (data.url) {
                    const arr = [...settings.banners];
                    arr[i].image = data.url;
                    handleChange(["banners"], arr);
                  } else {
                    alert("Ошибка загрузки файла.");
                  }
                }} />
                <input className="w-full border rounded px-3 py-2 text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" placeholder="Заголовок" value={b.text || ''} onChange={e => {
                  const arr = [...settings.banners]; arr[i].text = e.target.value; handleChange(["banners"], arr);
                }} />
                <input className="w-full border rounded px-3 py-2 text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" placeholder="Подзаголовок" value={b.subtitle || ''} onChange={e => {
                  const arr = [...settings.banners]; arr[i].subtitle = e.target.value; handleChange(["banners"], arr);
                }} />
                <input className="w-full border rounded px-3 py-2 text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" placeholder="URL перехода (напр., /catalog/product-slug)" value={b.url || ''} onChange={e => {
                  const arr = [...settings.banners]; arr[i].url = e.target.value; handleChange(["banners"], arr);
                }} />
                <button type="button" className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors" onClick={() => {
                  const arr = [...settings.banners]; arr.splice(i, 1); handleChange(["banners"], arr);
                }}>Удалить баннер</button>
              </div>
            ))}
            <button type="button" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors" onClick={() => {
              const arr = [...(settings.banners || []), { image: '', text: '', subtitle: '', url: '' }]; handleChange(["banners"], arr);
            }}>Добавить баннер</button>
          </div>
        )}

        {/* Раздел "Управление Категориями" убран отсюда, так как категории теперь имеют свою страницу /admin/categories */}

        {/* Цвета */}
        {settings.colors && (
          <div className="p-4 bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3 text-gray-100">Цвета Сайта</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-4">
                <span className="w-32 text-sm text-gray-300">Основной цвет</span>
                <input type="color" className="w-12 h-10 p-1 border-none rounded" value={settings.colors.primary || '#2563EB'} onChange={e => handleChange(["colors", "primary"], e.target.value)} />
                <span className="text-xs text-gray-400">(кнопки, акценты)</span>
              </label>
              <label className="flex items-center gap-4">
                <span className="w-32 text-sm text-gray-300">Фоновый цвет</span>
                <input type="color" className="w-12 h-10 p-1 border-none rounded" value={settings.colors.background || '#F9FAFB'} onChange={e => handleChange(["colors", "background"], e.target.value)} />
                <span className="text-xs text-gray-400">(фон сайта)</span>
              </label>
              <label className="flex items-center gap-4">
                <span className="w-32 text-sm text-gray-300">Цвет акцента</span>
                <input type="color" className="w-12 h-10 p-1 border-none rounded" value={settings.colors.accent || '#000000'} onChange={e => handleChange(["colors", "accent"], e.target.value)} />
                <span className="text-xs text-gray-400">(текст, иконки на светлом фоне)</span>
              </label>
            </div>
          </div>
        )}

        {/* Тексты */}
        {settings.texts && (
          <div className="p-4 bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3 text-gray-100">Тексты Сайта</h2>
            <div className="space-y-3">
              <label className="flex flex-col">
                <span className="text-sm text-gray-300 mb-1">Приветственный текст</span>
                <input className="w-full border rounded px-3 py-2 text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" value={settings.texts.welcome || ''} onChange={e => handleChange(["texts", "welcome"], e.target.value)} />
                <span className="text-xs text-gray-400 mt-1">(отображается на главной странице)</span>
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-300 mb-1">Текст футера</span>
                <input className="w-full border rounded px-3 py-2 text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" value={settings.texts.footer || ''} onChange={e => handleChange(["texts", "footer"], e.target.value)} />
                <span className="text-xs text-gray-400 mt-1">(отображается внизу сайта)</span>
              </label>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors disabled:opacity-50" onClick={saveSettings} disabled={saving || loading}>
            {saving ? "Сохранение..." : "Сохранить все настройки"}
          </button>
        </div>
      </div>
    </div>
  );
}
