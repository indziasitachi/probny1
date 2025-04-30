"use client";
import React from 'react';
export default function AdminLogoutButton() {
  function logout() {
    localStorage.removeItem("admin_auth");
    window.location.href = "/admin/login";
  }
  return (
    <button onClick={logout} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
      Выйти
    </button>
  );
}
