"use client";
import React from 'react';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    // mock: admin/1899
    if (login === "admin" && password === "1899") {
      localStorage.setItem("admin_auth", "1");
      router.push("/admin");
    } else {
      setError("Неверный логин или пароль");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded p-8 flex flex-col w-full max-w-xs">
        <h2 className="text-2xl font-bold mb-6 text-center">Вход в админку</h2>
        <input
          type="text"
          placeholder="Логин"
          className="mb-4 px-3 py-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          value={login}
          onChange={e => setLogin(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Пароль"
          className="mb-4 px-3 py-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Войти</button>
      </form>
    </main>
  );
}
