"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import { useFavorites } from "./FavoritesContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount = 0 } = useCart() || {}; // Деструктуризация с дефолтными значениями на случай, если контекст еще не полностью готов
  const { favoritesCount = 0 } = useFavorites() || {};
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tabs = [
    {
      href: "/",
      label: "Главная",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.06165 4.82633L3.23911 9.92134C2.7398 10.3583 3.07458 11.1343 3.76238 11.1343C4.18259 11.1343 4.52324 11.4489 4.52324 11.8371V15.0806C4.52324 17.871 4.52324 19.2662 5.46176 20.1331C6.40029 21 7.91082 21 10.9319 21H13.0681C16.0892 21 17.5997 21 18.5382 20.1331C19.4768 19.2662 19.4768 17.871 19.4768 15.0806V11.8371C19.4768 11.4489 19.8174 11.1343 20.2376 11.1343C20.9254 11.1343 21.2602 10.3583 20.7609 9.92134L14.9383 4.82633C13.5469 3.60878 12.8512 3 12 3C11.1488 3 10.4531 3.60878 9.06165 4.82633Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 16H12.009" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/catalog",
      label: "Каталог",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 9.5H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.5 14.5H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.5 19.5H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.5355 13.0355L21.5 16M20 9.5C20 6.73858 17.7614 4.5 15 4.5C12.2386 4.5 10 6.73858 10 9.5C10 12.2614 12.2386 14.5 15 14.5C17.7614 14.5 20 12.2614 20 9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/cart",
      label: "Корзина",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="7" width="12" height="13" rx="2" /><path d="M9 7V4a3 3 0 0 1 6 0v3" /></svg>
      ),
      badge: isMounted && cartCount > 0 ? cartCount : null
    },
    {
      href: "/favorites",
      label: "Избранное",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
      ),
      badge: isMounted && favoritesCount > 0 ? favoritesCount : null
    },
    {
      href: "/profile",
      label: "Профиль",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 17.25V17A3.75 3.75 0 0 0 12 13.25h0A3.75 3.75 0 0 0 8.25 17v.25M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></svg>
      )
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full max-w-[430px] mx-auto bg-[#232629] z-50 flex flex-col items-center px-0 pb-2 pt-1 shadow-lg rounded-t-2xl md:hidden" style={{ height: '84px' }}>
      <div className="w-full flex justify-between px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
          return (
            <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center justify-center relative group select-none min-w-0">
              <span className={`mb-0.5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}>{tab.icon}</span>
              <span className={`text-xs mt-0.5 ${isActive ? "text-white font-bold" : "text-gray-400"}`}>{tab.label}</span>
              {tab.badge && (
                <span className="absolute -top-1 right-2 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow border-2 border-[#232629]" style={{ minWidth: '22px', textAlign: 'center', lineHeight: '16px' }}>{tab.badge}</span>
              )}
            </Link>
          );
        })}
      </div>
      {/* Home indicator */}
      <div className="w-24 h-2 mt-1 bg-white/90 rounded-full mx-auto" style={{ marginBottom: '2px' }} />
    </nav>
  );
}
