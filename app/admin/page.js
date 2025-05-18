// app/admin/page.js
"use client";
import React from 'react';

const TestNotification = () => {
  const handleTestNotification = async () => {
    try {
      const response = await fetch('/api/send-test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      if (response.ok) {
        alert('Тестовое уведомление отправлено!');
      } else {
        alert(`Ошибка: ${result.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке тестового уведомления:', error);
      alert('Произошла ошибка при отправке уведомления');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Тестирование уведомлений</h2>
      <button
        onClick={handleTestNotification}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Отправить тестовое уведомление
      </button>
    </div>
  );
};

export default function AdminDashboardPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-6">Панель управления</h1>
      <TestNotification />
      <p className="text-gray-300">Добро пожаловать в админ-панель!</p>
      {/* Здесь можно будет добавить виджеты, статистику и т.д. */}
    </main>
  );
}
