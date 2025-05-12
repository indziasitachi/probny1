// app/admin/BannersManager.jsx
"use client";
import React, { useState, useEffect } from 'react';

export default function BannersManager() {
  const [settings, setSettings] = useState(null); // Полный объект настроек
  const [banners, setBanners] = useState([]); // Только массив баннеров для удобства
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data); // Сохраняем все настройки
        setBanners(data.banners || []); // Инициализируем баннеры
        setLoading(false);
      }).catch(err => {
        console.error("Failed to load settings for BannersManager:", err);
        setLoading(false);
        alert("Не удалось загрузить настройки баннеров.");
      });
  }, []);

  // Функция для обновления только части banners в общем объекте settings
  function handleBannersChange(newBannersArray) {
    setBanners(newBannersArray); // Обновляем локальное состояние баннеров

    // Обновляем banners в общем объекте settings
    // Это важно, чтобы при сохранении settings содержал актуальные баннеры
    setSettings(prevSettings => ({
      ...prevSettings,
      banners: newBannersArray
    }));
  }
  
  async function saveBannersSettings() {
    if (!settings) { // Проверяем наличие всего объекта settings
      alert("Настройки не загружены, сохранение невозможно.");
      return;
    }
    setSaving(true);
    try {
      // Отправляем ВЕСЬ ОБЪЕКТ settings, включая обновленные баннеры
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings), 
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})); // Попытка получить тело ошибки
        throw new Error(`Failed to save settings: ${res.statusText} (Status: ${res.status}) ${errorData.error ? JSON.stringify(errorData.error) : ''}`);
      }
      alert("Настройки баннеров успешно сохранены!");
    } catch (error) {
      console.error("Error saving banners settings:", error);
      alert(`Ошибка при сохранении настроек баннеров: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-white">Загрузка настроек баннеров...</div>;
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow">
      {/* <h2 className="text-xl font-semibold mb-3 text-gray-100">Баннеры</h2> */}
      {(banners || []).map((b, i) => (
        <div key={i} className="p-3 border border-gray-700 rounded-md mb-3 space-y-2">
          <label className="block text-sm font-medium text-gray-300">URL картинки или видео</label>
          <input 
            className="w-full border rounded px-3 py-2 text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="URL картинки или видео" 
            value={b.image || ''} 
            onChange={e => {
              const newBanners = [...banners]; 
              newBanners[i].image = e.target.value; 
              handleBannersChange(newBanners);
            }} 
          />
          <label className="block text-sm font-medium text-gray-300 mt-1">Загрузить файл</label>
          <input 
            type="file" 
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            accept="image/*,video/*" 
            onChange={async e => {
              const file = e.target.files[0];
              if (!file) return;
              const formData = new FormData();
              formData.append('file', file);
              setSaving(true); // Индикация загрузки файла
              try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (res.ok && data.url) {
                  const newBanners = [...banners];
                  newBanners[i].image = data.url;
                  handleBannersChange(newBanners);
                  alert("Файл успешно загружен!");
                } else {
                  throw new Error(data.error || "Ошибка загрузки файла с сервера.");
                }
              } catch (uploadError) {
                console.error("Upload error:", uploadError);
                alert(`Ошибка загрузки файла: ${uploadError.message}`);
              } finally {
                setSaving(false);
              }
            }} 
          />
          <label className="block text-sm font-medium text-gray-300 mt-2">Заголовок</label>
          <input 
            className="w-full border rounded px-3 py-2 text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Заголовок" 
            value={b.text || ''} 
            onChange={e => {
              const newBanners = [...banners]; 
              newBanners[i].text = e.target.value; 
              handleBannersChange(newBanners);
            }} 
          />
          <label className="block text-sm font-medium text-gray-300 mt-2">Подзаголовок</label>
          <input 
            className="w-full border rounded px-3 py-2 text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Подзаголовок" 
            value={b.subtitle || ''} 
            onChange={e => {
              const newBanners = [...banners]; 
              newBanners[i].subtitle = e.target.value; 
              handleBannersChange(newBanners);
            }} 
          />
          <label className="block text-sm font-medium text-gray-300 mt-2">URL перехода</label>
          <input 
            className="w-full border rounded px-3 py-2 text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="URL перехода (напр., /catalog/product-slug)" 
            value={b.url || ''} 
            onChange={e => {
              const newBanners = [...banners]; 
              newBanners[i].url = e.target.value; 
              handleBannersChange(newBanners);
            }} 
          />
          <button 
            type="button" 
            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors mt-2" 
            onClick={() => {
              const newBanners = [...banners]; 
              newBanners.splice(i, 1); 
              handleBannersChange(newBanners);
            }}>
            Удалить баннер
          </button>
        </div>
      ))}
      <button 
        type="button" 
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors" 
        onClick={() => {
          const newBanners = [...(banners || []), { image: '', text: '', subtitle: '', url: '' }]; 
          handleBannersChange(newBanners);
        }}>
        Добавить баннер
      </button>
      <div className="mt-8">
        <button 
          className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors disabled:opacity-50" 
          onClick={saveBannersSettings} 
          disabled={saving || loading}>
          {saving ? "Сохранение..." : "Сохранить все баннеры"}
        </button>
      </div>
    </div>
  );
}
