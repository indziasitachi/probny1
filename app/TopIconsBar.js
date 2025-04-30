"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { useFavorites } from "./FavoritesContext";

// Фирменные цвета по фото
const MINT = "#7ED9C4"; // Мятный/бирюзовый (основной)
const KRAFT = "#F5E9DA"; // Светло-бежевый/крафт
const ACCENT_GREEN = "#2CA88C"; // Акцент зелёный

export default function TopIconsBar() {
  const router = useRouter();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  return (
    <div className="hidden lg:flex fixed top-4 right-4 z-50 gap-3 items-center bg-transparent">
      {/* Избранное */}
      <button
        className="group border rounded-full p-2 shadow-sm transition-all flex items-center justify-center relative"
        style={{ borderColor: MINT, background: KRAFT }}
        aria-label="Избранное"
        onClick={() => router.push('/favorites')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
          <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {favoritesCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#e53935] text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow-lg border-2 border-white select-none">
            {favoritesCount}
          </span>
        )}
      </button>
      {/* Корзина */}
      <button
        className="group border rounded-full p-2 shadow-sm transition-all flex items-center justify-center relative"
        style={{ borderColor: MINT, background: KRAFT }}
        aria-label="Корзина"
        onClick={() => router.push('/cart')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
          <path d="M8 16H15.2632C19.7508 16 20.4333 13.1808 21.261 9.06908C21.4998 7.88311 21.6192 7.29013 21.3321 6.89507C21.045 6.5 20.4947 6.5 19.3941 6.5H6" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"></path>
          <path d="M8 16L5.37873 3.51493C5.15615 2.62459 4.35618 2 3.43845 2H2.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"></path>
          <path d="M8.88 16H8.46857C7.10522 16 6 17.1513 6 18.5714C6 18.8081 6.1842 19 6.41143 19H17.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <circle cx="10.5" cy="20.5" r="1.5" stroke="#000000" strokeWidth="1.5"></circle>
          <circle cx="17.5" cy="20.5" r="1.5" stroke="#000000" strokeWidth="1.5"></circle>
        </svg>
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#e53935] text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow-lg border-2 border-white select-none">
            {cartCount}
          </span>
        )}
      </button>
      {/* Профиль */}
      <button
        className="group border rounded-full p-2 shadow-sm transition-all flex items-center justify-center"
        style={{ borderColor: ACCENT_GREEN, background: KRAFT }}
        aria-label="Профиль пользователя"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
          <path d="M15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13C13.6569 13 15 11.6569 15 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 18C17 15.2386 14.7614 13 12 13C9.23858 13 7 15.2386 7 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 13V11C21 7.22876 21 5.34315 19.8284 4.17157C18.6569 3 16.7712 3 13 3H11C7.22876 3 5.34315 3 4.17157 4.17157C3 5.34315 3 7.22876 3 11V13C3 16.7712 3 18.6569 4.17157 19.8284C5.34315 21 7.22876 21 11 21H13C16.7712 21 18.6569 21 19.8284 19.8284C21 18.6569 21 16.7712 21 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
