"use client";
import React from 'react';
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const scrollRef = useRef(null);
  let touchStartX = 0;
  let scrollStartX = 0;
  const router = useRouter();

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  function onTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    scrollStartX = scrollRef.current.scrollLeft;
  }
  function onTouchMove(e) {
    if (!touchStartX) return;
    const dx = touchStartX - e.touches[0].clientX;
    scrollRef.current.scrollLeft = scrollStartX + dx;
  }
  function onTouchEnd() {
    touchStartX = 0;
  }
  function scrollByDir(dir) {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir * 120,
        behavior: "smooth"
      });
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-10">
      {/* Left arrow (desktop only) */}
      <button
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-900 text-white rounded-full p-2 shadow"
        style={{ pointerEvents: 'auto' }}
        onClick={() => scrollByDir(-1)}
        aria-label="Прокрутить влево"
      >
        &#8592;
      </button>
      {/* Categories scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto no-scrollbar px-2 md:px-8 py-4 snap-x snap-mandatory"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        tabIndex={0}
        style={{ scrollBehavior: "smooth" }}
      >
        {categories.map((cat, idx) => (
          <div
            key={cat.name}
            className="flex flex-col items-center min-w-[80px] snap-center select-none cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              if (idx === 0) {
                router.push("/catalog"); // Исправлено: всегда переход на /catalog
              } else if (idx === 1) {
                // router.push("/new");
              } else if (idx === 2) {
                // router.push("/sales");
              } else if (idx === 3) {
                // router.push("/about");
              } else if (idx === 4) {
                // router.push("/reviews");
              } else if (idx === 5) {
                // router.push("/ads");
              }
            }}
          >
            <span className="text-4xl mb-2">{cat.icon}</span>
            <span className="text-base font-medium text-gray-100 mt-1">{cat.name}</span>
          </div>
        ))}
      </div>
      {/* Right arrow (desktop only) */}
      <button
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-900 text-white rounded-full p-2 shadow"
        style={{ pointerEvents: 'auto' }}
        onClick={() => scrollByDir(1)}
        aria-label="Прокрутить вправо"
      >
        &#8594;
      </button>
    </div>
  );
}
