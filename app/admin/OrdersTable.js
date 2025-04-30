"use client";
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { useState } from "react";

const initialOrders = [
  { id: 1, date: "2025-04-20", customer: "Иван Иванов", items: 2, total: 2500, status: "В обработке" },
  { id: 2, date: "2025-04-19", customer: "Анна Петрова", items: 1, total: 1500, status: "Завершён" },
];

export default function OrdersTable() {
  return (
    <section>
      <h3 className="text-xl font-bold mb-4">Заказы</h3>
      <table className="w-full bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">Дата</th>
            <th className="p-2">Покупатель</th>
            <th className="p-2">Кол-во товаров</th>
            <th className="p-2">Сумма</th>
            <th className="p-2">Статус</th>
          </tr>
        </thead>
        <tbody>
          {initialOrders.map(o => (
            <tr key={o.id}>
              <td className="p-2">{o.id}</td>
              <td className="p-2">{o.date}</td>
              <td className="p-2">{o.customer}</td>
              <td className="p-2">{o.items}</td>
              <td className="p-2">{o.total} ₽</td>
              <td className="p-2">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
