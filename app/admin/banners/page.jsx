// app/admin/banners/page.jsx
"use client";
import React from 'react';
import BannersManager from '../BannersManager'; // Мы создадим этот компонент следующим

export default function AdminBannersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Управление Баннерами</h1>
      <BannersManager />
    </div>
  );
}
