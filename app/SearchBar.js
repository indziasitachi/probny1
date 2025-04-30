import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    <form className="w-full flex justify-center my-4" style={{ minHeight: '48px' }}>
      <div className="w-full max-w-md flex items-center bg-white rounded-2xl shadow px-4 py-2" style={{ boxShadow: '0 2px 12px 0 #4AC6B733' }}>
        <svg width="22" height="22" fill="none" stroke="#4AC6B7" strokeWidth="2" viewBox="0 0 24 24" className="mr-2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={onChange}
          placeholder="Поиск товаров..."
          className="flex-1 outline-none bg-transparent text-base text-gray-900 placeholder-gray-400 font-medium"
          style={{ minWidth: 0 }}
        />
        <button type="button" className="ml-2">
          <svg width="18" height="18" fill="none" stroke="#B99A7C" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="4" />
            <path d="M8 10h8M8 14h5" />
          </svg>
        </button>
      </div>
    </form>
  );
}
