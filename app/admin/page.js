// app/admin/page.js

"use client";
import React from 'react';
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const ProductsTable = dynamic(() => import("./ProductsTable"), { ssr: false });
const OrdersTable = dynamic(() => import("./OrdersTable"), { ssr: false });
import AdminLogoutButton from "./AdminLogoutButton";
import GroupPhotoUploader from "./GroupPhotoUploader";
const AdminCategories = dynamic(() => import("./AdminCategories.jsx"), { ssr: false });

export default function Admin() {
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

  const [showUploader, setShowUploader] = useState(false);

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Админ-панель</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          onClick={() => setShowUploader(v => !v)}
        >
          {showUploader ? "Скрыть загрузку фото" : "Добавить фото к группам и подгруппам"}
        </button>
        <AdminLogoutButton />
      </div>
      {showUploader && <GroupPhotoUploader />}

      {loading ? (
        <div>Загрузка настроек...</div>
      ) : (
        <div className="space-y-6">
          {/* Логотип */}
          <div className="p-4 bg-gray-800 rounded">
            <h2 className="font-semibold mb-2">Логотип</h2>
            <div className="mb-2 flex flex-col gap-2">
              <label className="flex flex-col">
                <span className="text-sm text-gray-300 mb-1">Текст логотипа</span>
                <input className="border rounded px-2 py-1 text-sm text-white bg-gray-700 placeholder-gray-400" value={settings.logo.text} onChange={e => handleChange(["logo", "text"], e.target.value)} />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-300 mb-1">Цвет текста</span>
                <input type="color" className="w-12 h-8 p-0 border-none" value={settings.logo.color} onChange={e => handleChange(["logo", "color"], e.target.value)} />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-300 mb-1">Размер шрифта (px)</span>
                <input type="number" min={10} max={72} className="border rounded px-2 py-1 text-sm text-white bg-gray-700 placeholder-gray-400" value={settings.logo.fontSize} onChange={e => handleChange(["logo", "fontSize"], Number(e.target.value))} />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-300 mb-1">Цвет кружки</span>
                <input type="color" className="w-12 h-8 p-0 border-none" value={settings.logo.cupColor} onChange={e => handleChange(["logo", "cupColor"], e.target.value)} />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Показывать кружку</span>
                <input type="checkbox" checked={settings.logo.showCup} onChange={e => handleChange(["logo", "showCup"], e.target.checked)} />
              </label>
            </div>
          </div>
          {/* Баннеры */}
          <div className="p-4 bg-gray-800 rounded">
            <h2 className="font-semibold mb-2">Баннеры</h2>
            {settings.banners.map((b, i) => (
              <div key={i} className="flex flex-col gap-2 mb-2">
                <input className="border rounded px-2 py-1 text-sm text-white bg-gray-700 placeholder-gray-400" placeholder="URL картинки или видео" value={b.image} onChange={e => {
                  const arr = [...settings.banners]; arr[i].image = e.target.value; handleChange(["banners"], arr);
                }} />
                <input type="file" accept="image/*,video/*" onChange={async e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('file', file);
                  const res = await fetch('/api/upload', { method: 'POST', body: formData });
                  const data = await res.json();
                  if (data.url) {
                    const arr = [...settings.banners];
                    arr[i].image = data.url;
                    handleChange(["banners"], arr);
                  }
                }} />
                <input className="border rounded px-2 py-1 text-sm text-white bg-gray-700 placeholder-gray-400" placeholder="Заголовок" value={b.text} onChange={e => {
                  const arr = [...settings.banners]; arr[i].text = e.target.value; handleChange(["banners"], arr);
                }} />
                <input className="border rounded px-2 py-1 text-sm text-white bg-gray-700 placeholder-gray-400" placeholder="Подзаголовок" value={b.subtitle} onChange={e => {
                  const arr = [...settings.banners]; arr[i].subtitle = e.target.value; handleChange(["banners"], arr);
                }} />
                <input className="border rounded px-2 py-1 text-sm text-white bg-gray-700 placeholder-gray-400" placeholder="URL перехода" value={b.url} onChange={e => {
                  const arr = [...settings.banners]; arr[i].url = e.target.value; handleChange(["banners"], arr);
                }} />
                <button type="button" className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded" onClick={() => {
                  const arr = [...settings.banners]; arr.splice(i, 1); handleChange(["banners"], arr);
                }}>Удалить</button>
              </div>
            ))}
            <button type="button" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-1 rounded mt-2" onClick={() => {
              const arr = [...settings.banners, { image: '', text: '', subtitle: '', url: '' }]; handleChange(["banners"], arr);
            }}>Добавить баннер</button>
          </div>
          {/* Категории */}
          <div className="p-4 bg-gray-800 rounded">
            <h2 className="font-semibold mb-2">Категории</h2>
            <AdminCategories />
          </div>
          {/* Цвета */}
          <div className="p-4 bg-gray-800 rounded">
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
          {/* Тексты */}
          <div className="p-4 bg-gray-800 rounded">
            <h2 className="font-semibold mb-2">Тексты</h2>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col">
                <span className="text-sm text-gray-300 mb-1">Приветственный текст</span>
                <input className="border rounded px-2 py-1 text-sm text-white bg-gray-700 placeholder-gray-400" value={settings.texts.welcome} onChange={e => handleChange(["texts", "welcome"], e.target.value)} />
                <span className="text-xs text-gray-400">(отображается на главной странице)</span>
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-300 mb-1">Текст футера</span>
                <input className="border rounded px-2 py-1 text-sm text-white bg-gray-700 placeholder-gray-400" value={settings.texts.footer} onChange={e => handleChange(["texts", "footer"], e.target.value)} />
                <span className="text-xs text-gray-400">(отображается внизу сайта)</span>
              </label>
            </div>
          </div>
          <button className="bg-green-600 text-white px-6 py-2 rounded" onClick={saveSettings} disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</button>
        </div>
      )}
      {/* Управление товарами и заказами */}
      <div className="mt-12 space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Товары</h2>
          <ProductsTable />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Заказы</h2>
          <OrdersTable />
        </div>
      </div>
    </main>
  );
}
