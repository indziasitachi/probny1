
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from "next/navigation";
import Link from 'next/link';
import AdminLogoutButton from "./AdminLogoutButton"; // Убедитесь, что путь корректен

// Иконки можно заменить на реальные SVG или компоненты иконок
const DashboardIcon = () => <span>📊</span>;
const ProductsIcon = () => <span>📦</span>;
const OrdersIcon = () => <span>🛒</span>;
const CategoriesIcon = () => <span>🏷️</span>;
const MediaIcon = () => <span>🖼️</span>;
const SettingsIcon = () => <span>⚙️</span>;

const NavLink = ({ href, icon, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
  return (
    <Link href={href} className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
      ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
      {icon}
      <span>{children}</span>
    </Link>
  );
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Устанавливаем, что компонент смонтирован на клиенте
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("admin_auth") === "1";
      if (!isAuth && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
    }
  }, [router, pathname]);

  // Не рендерим админ-панель на сервере или если пользователь не авторизован и это не страница логина
  // Также ждем монтирования на клиенте, чтобы избежать проблем с localStorage
  if (!isClient || (typeof window !== "undefined" && localStorage.getItem("admin_auth") !== "1" && pathname !== "/admin/login")) {
     // Если это страница логина, и пользователь не авторизован, то ее нужно показать
    if (pathname === "/admin/login" && (typeof window !== "undefined" && localStorage.getItem("admin_auth") !== "1")) {
       return <main className="min-h-screen bg-gray-900 text-white">{children}</main>;
    }
    return null; // Или можно вернуть какой-то лоадер/пустую страницу
  }
  
  // Если это страница логина и пользователь уже авторизован, редиректим на /admin
  if (pathname === "/admin/login" && (typeof window !== "undefined" && localStorage.getItem("admin_auth") === "1")) {
    router.replace("/admin");
    return null; // или лоадер
  }


  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4 space-y-4 flex flex-col">
        <div className="text-2xl font-semibold text-center mb-6">Админ-панель</div>
        <nav className="flex-grow">
          <NavLink href="/admin" icon={<DashboardIcon />}>Дашборд</NavLink>
          <NavLink href="/admin/products" icon={<ProductsIcon />}>Товары</NavLink>
          <NavLink href="/admin/orders" icon={<OrdersIcon />}>Заказы</NavLink>
          <NavLink href="/admin/categories" icon={<CategoriesIcon />}>Категории</NavLink>
          <NavLink href="/admin/media" icon={<MediaIcon />}>Медиа</NavLink>
          <NavLink href="/admin/settings" icon={<SettingsIcon />}>Настройки</NavLink>
        </nav>
        <div className="mt-auto">
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
