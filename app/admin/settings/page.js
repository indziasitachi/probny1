"use client";
import React from 'react';
import { useState, useEffect } from "react";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  function handleChange(path, value) {
    setSettings((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
      ref[path[path.length - 1]] = value;
      return copy;
    });
  }

  async function saveSettings() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
  }

  if (loading) return <div>Загрузка настроек...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Настройки сайта</h1>
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h2 className="font-semibold mb-2">Логотип</h2>
        <div className="mb-2 flex flex-col gap-2">
          <label className="flex flex-col">
            <span className="text-sm text-gray-300 mb-1">Логотип (изображение)</span>
            <div className="flex gap-4 items-center">
              {settings.logo.image && (
                <img src={settings.logo.image} alt="Логотип" style={{ maxHeight: 64, background: '#222', borderRadius: 8, padding: 4 }} />
              )}
              <input type="file" accept="image/*" onChange={async e => {
                const file = e.target.files[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.url) handleChange(["logo", "image"], data.url);
              }} />
            </div>
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-gray-300 mb-1">Текст логотипа</span>
            <input className="px-2 py-1 rounded w-full" value={settings.logo.text} onChange={e => handleChange(["logo", "text"], e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-gray-300 mb-1">Цвет текста</span>
            <input type="color" className="w-12 h-8 p-0 border-none" value={settings.logo.color} onChange={e => handleChange(["logo", "color"], e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-gray-300 mb-1">Размер шрифта (px)</span>
            <input type="number" min={10} max={72} className="px-2 py-1 rounded w-24" value={settings.logo.fontSize} onChange={e => handleChange(["logo", "fontSize"], Number(e.target.value))} />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-gray-300 mb-1">Цвет кружки</span>
            <input type="color" className="w-12 h-8 p-0 border-none" value={settings.logo.cupColor} onChange={e => handleChange(["logo", "cupColor"], e.target.value)} />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={settings.logo.straw} onChange={e => handleChange(["logo", "straw"], e.target.checked)} />
            <span className="text-sm text-gray-300">Трубочка</span>
          </label>
        </div>
      </div>
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h2 className="font-semibold mb-2">Баннеры</h2>
        {settings.banners.map((b, i) => (
          <div key={i} className="mb-4 p-2 bg-gray-700 rounded flex flex-col gap-2 relative">
            <label className="flex flex-col">
              <span className="text-sm text-gray-300 mb-1">Изображение (путь)</span>
              <div className="flex gap-2 items-center">
                <input className="px-2 py-1 rounded w-full" value={b.image} onChange={e => handleChange(["banners", i, "image"], e.target.value)} placeholder="/banners/banner1.jpg" />
                <input type="file" accept="image/*,video/mp4,video/webm" onChange={async e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('file', file);
                  const res = await fetch('/api/upload', { method: 'POST', body: formData });
                  const data = await res.json();
                  if (data.url) handleChange(["banners", i, "image"], data.url);
                }} />
              </div>
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-300 mb-1">Текст баннера</span>
              <input className="px-2 py-1 rounded w-full" value={b.text} onChange={e => handleChange(["banners", i, "text"], e.target.value)} />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-300 mb-1">Подзаголовок</span>
              <input className="px-2 py-1 rounded w-full" value={b.subtitle || ''} onChange={e => handleChange(["banners", i, "subtitle"], e.target.value)} />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-300 mb-1">Ссылка (url)</span>
              <input className="px-2 py-1 rounded w-full" value={b.url || ''} onChange={e => handleChange(["banners", i, "url"], e.target.value)} />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-300 mb-1">Прозрачность баннера (0.1 — 1.0)</span>
              <input type="number" min="0.1" max="1" step="0.05" className="px-2 py-1 rounded w-24" value={b.opacity ?? 1} onChange={e => handleChange(["banners", i, "opacity"], Number(e.target.value))} />
            </label>
            <button type="button" className="absolute right-2 top-2 text-red-400 hover:text-red-600 text-sm" onClick={() => {
              const arr = [...settings.banners]; arr.splice(i, 1); handleChange(["banners"], arr);
            }}>Удалить</button>
          </div>
        ))}
        <button type="button" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-1 rounded mt-2" onClick={() => {
          const arr = [...settings.banners, { image: '', text: '', subtitle: '', url: '' }]; handleChange(["banners"], arr);
        }}>Добавить баннер</button>
      </div>
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h2 className="font-semibold mb-2">Категории</h2>
        {settings.categories.map((c, i) => (
          <div key={i} className="mb-4 p-2 bg-gray-700 rounded flex flex-col gap-2 relative">
            <label className="flex flex-col">
              <span className="text-sm text-gray-300 mb-1">Название категории</span>
              <input className="px-2 py-1 rounded w-full" value={c.name} onChange={e => handleChange(["categories", i, "name"], e.target.value)} />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-300 mb-1">Иконка (emoji или svg)</span>
              <input className="px-2 py-1 rounded w-full" value={c.icon} onChange={e => handleChange(["categories", i, "icon"], e.target.value)} />
            </label>
            <button type="button" className="absolute right-2 top-2 text-red-400 hover:text-red-600 text-sm" onClick={() => {
              const arr = [...settings.categories]; arr.splice(i, 1); handleChange(["categories"], arr);
            }}>Удалить</button>
          </div>
        ))}
        <button type="button" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-1 rounded mt-2" onClick={() => {
          const arr = [...settings.categories, { name: '', icon: '' }]; handleChange(["categories"], arr);
        }}>Добавить категорию</button>
      </div>
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h2 className="font-semibold mb-2">Цвета</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-4">
            <span className="w-28 text-sm text-gray-300">Основной цвет</span>
            <input type="color" className="w-10 h-8 p-0 border-none" value={settings.colors.primary} onChange={e => handleChange(["colors", "primary"], e.target.value)} />
            <span className="text-xs text-gray-400">(кнопки, акценты)</span>
          </label>
          <label className="flex items-center gap-4">
            <span className="w-28 text-sm text-gray-300">Фоновый цвет</span>
            <input type="color" className="w-10 h-8 p-0 border-none" value={settings.colors.background} onChange={e => handleChange(["colors", "background"], e.target.value)} />
            <span className="text-xs text-gray-400">(фон сайта)</span>
          </label>
          <label className="flex items-center gap-4">
            <span className="w-28 text-sm text-gray-300">Цвет акцента</span>
            <input type="color" className="w-10 h-8 p-0 border-none" value={settings.colors.accent} onChange={e => handleChange(["colors", "accent"], e.target.value)} />
            <span className="text-xs text-gray-400">(текст, иконки)</span>
          </label>
        </div>
      </div>
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h2 className="font-semibold mb-2">Тексты</h2>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col">
            <span className="text-sm text-gray-300 mb-1">Приветственный текст</span>
            <input className="px-2 py-1 rounded w-full" value={settings.texts.welcome} onChange={e => handleChange(["texts", "welcome"], e.target.value)} />
            <span className="text-xs text-gray-400">(отображается на главной странице)</span>
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-gray-300 mb-1">Текст футера</span>
            <input className="px-2 py-1 rounded w-full" value={settings.texts.footer} onChange={e => handleChange(["texts", "footer"], e.target.value)} />
            <span className="text-xs text-gray-400">(отображается внизу сайта)</span>
          </label>
        </div>
      </div>
      <button className="bg-green-600 text-white px-6 py-2 rounded" onClick={saveSettings} disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</button>
    </div>
  );
}
