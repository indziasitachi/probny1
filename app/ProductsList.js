// Триггерный комментарий для запуска билда на Vercel
"use client";
import React from "react";
import ProductCard from "./ProductCard";

export default function ProductsList({ products }) {
  if (!products || products.length === 0) {
    return <div>Нет товаров</div>;
  }
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 p-2">
      {products.map(product => (
        <div key={product.id} className="max-w-[120px] w-full mx-auto">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}