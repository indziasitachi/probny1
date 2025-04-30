'use client';

import React, { useEffect, useState } from "react";

export default function CategorySliderMobile() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(setCategories);
  }, []);

  // Функция перехода на страницу каталога
  const goToCatalog = () => {
    window.location.href = '/catalog';
  };

  return (
    <nav className="block md:hidden w-full my-1">
      <div
        className="flex overflow-x-auto no-scrollbar gap-3 px-2 py-3 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center flex-shrink-0 snap-center${idx === 0 ? ' cursor-pointer' : ''}`}
            style={{ width: 64 }}
            {...(idx === 0 ? { onClick: goToCatalog } : {})}
          >
            <div
              className="bg-[#23242A] flex items-center justify-center shadow-md"
              style={{ width: 48, height: 48, borderRadius: 16 }}
            >
              {cat.icon && (
                <img
                  src={cat.icon}
                  alt={cat.label}
                  style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 12, background: '#fff' }}
                />
              )}
            </div>
            <span
              className="text-[13px] text-center mt-2 font-medium leading-tight w-full shadow break-words whitespace-normal"
              style={{
                maxWidth: 56,
                fontFamily: 'Inter, OzonText, Ozon Sans, Segoe UI, Arial, sans-serif',
                color: '#fff',
                display: 'inline-block',
                wordBreak: 'break-word'
              }}
              title={cat.label}
            >
              {cat.label}
            </span>
          </div>
        ))}
      </div>
    </nav>
  );
}
