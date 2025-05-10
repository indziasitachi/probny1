// Триггерный комментарий для запуска билда на Vercel
"use client";
import React from "react";
import ProductCard from "./ProductCard";

export default function ProductsList({ products }) {
  if (!products || products.length === 0) {
    return <div>Нет товаров</div>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-1 p-1">
      {products.map(product => (
        <div key={product.id} className="block rounded-lg p-3 shadow hover:shadow-lg transition w-full">
          <ProductCard product={product} allProducts={products} />
        </div>
      ))}
    </div>
  );
}