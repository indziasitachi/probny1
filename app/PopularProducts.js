import React from 'react';

const products = [
  { id: 1, name: "Кофе Американо", price: 150, image: "/logo.svg" },
  { id: 2, name: "Круассан", price: 90, image: "/logo.svg" },
];

export default function PopularProducts() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((p) => (
        <div key={p.id} className="border rounded p-4 flex flex-col items-center">
          <img src={p.image} alt={p.name} className="w-16 h-16 mb-2" />
          <div className="font-semibold mb-1">{p.name}</div>
          <div className="text-gray-500 mb-2">{p.price} ₽</div>
        </div>
      ))}
    </div>
  );
}
