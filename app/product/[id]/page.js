'use client';
import React, { useState } from "react";
import { notFound } from "next/navigation";
import productsData from "../../../public/products-frontend.json";
import { useCart } from "../../CartContext";
import { useFavorites } from "../../FavoritesContext";

export default function ProductPage({ params }) {
    const { id } = params;
    // Новый поиск товара: ищем во всех группах
    let product = null;
    let productGroup = null;
    for (const group of productsData) {
        if (Array.isArray(group.products)) {
            const found = group.products.find(p => p.id === id);
            if (found) {
                product = found;
                productGroup = group;
                break;
            }
        }
    }
    const { addToCart } = useCart(); // Удалена переменная cart
    const { toggleFavorite, isFavorite } = useFavorites();
    const [activeIndex, setActiveIndex] = useState(0);
    if (!product) return notFound();

    let images = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
        images = product.images;
    } else if (product.imageUrl) {
        images = [product.imageUrl];
    } else if (typeof product.image === 'string') {
        images = [product.image];
    }
    const validImages = images.filter(img => typeof img === 'string' && (img.startsWith('https://apsnypack.s3.cloud.ru/') || img.startsWith('/images/') || img.startsWith('http')));
    const mainImage = validImages[activeIndex] || null;

    // Похожие товары из той же группы
    let similar = [];
    if (productGroup && Array.isArray(productGroup.products)) {
        similar = productGroup.products.filter(p => p.id !== product.id).slice(0, 4);
    }

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Галерея фото */}
                <div className="flex flex-col items-center md:w-1/2 w-full">
                    {mainImage && (
                        <img src={mainImage} alt={product.name} className="object-contain w-full h-72 rounded-xl bg-gray-100 mb-2" />
                    )}
                    {validImages.length > 1 && (
                        <div className="flex gap-2 mt-2 flex-wrap justify-center">
                            {validImages.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`Фото товара ${idx + 1}`}
                                    className={`w-16 h-16 object-contain rounded border border-gray-200 bg-white shadow cursor-pointer ${activeIndex === idx ? 'ring-2 ring-blue-500' : ''}`}
                                    onClick={() => setActiveIndex(idx)}
                                />
                            ))}
                        </div>
                    )}
                </div>
                {/* Информация о товаре */}
                <div className="flex-1 flex flex-col gap-4">
                    <div>
                        <div className="font-bold text-2xl mb-2">{product.name}</div>
                        <div className="text-green-600 font-bold text-xl mb-2">{typeof product.price === 'number' && product.price > 0 ? product.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) + ' ₽' : "Нет цены"}</div>
                    </div>
                    {/* Описание */}
                    {product.description && (
                        <div className="mb-4">
                            <h3 className="font-semibold mb-1 text-lg">Описание</h3>
                            <div className="text-gray-700 dark:text-gray-300 text-base whitespace-pre-line">{product.description}</div>
                        </div>
                    )}
                    {/* Характеристики */}
                    {(Array.isArray(product.specs) && product.specs.length > 0) || (Array.isArray(product.properties) && product.properties.length > 0) ? (
                        <div className="mb-4">
                            <h3 className="font-semibold mb-1 text-lg">Характеристики</h3>
                            <table className="w-full text-left border-separate border-spacing-y-1">
                                <tbody>
                                    {(product.specs || product.properties).map((prop, idx) => (
                                        <tr key={idx}>
                                            <td className="pr-4 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{prop.label || prop.name}</td>
                                            <td className="text-gray-900 dark:text-white">{prop.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : null}
                    <div className="flex gap-3 items-center">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold text-base shadow hover:bg-blue-700 transition" onClick={() => addToCart({ ...product, image: mainImage })}>В корзину</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 shadow-md transition-transform" onClick={() => toggleFavorite({ ...product, image: mainImage })} aria-label="В избранное">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill={isFavorite(product.id) ? "#e53935" : "none"}>
                                <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke={isFavorite(product.id) ? "#e53935" : "#222"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            {/* Похожие товары */}
            {similar.length > 0 && (
                <div className="w-full max-w-2xl mx-auto mt-10 px-2 sm:px-8">
                    <div className="font-bold text-lg mb-4 text-center">Похожие товары</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {similar.map(sim => (
                            <a key={sim.id} href={`/product/${sim.id}`} className="bg-white dark:bg-gray-800 rounded-xl shadow p-2 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                                <img src={sim.images && sim.images[0] ? sim.images[0] : sim.imageUrl || sim.image || ''} alt={sim.name} className="w-20 h-20 object-contain rounded mb-2 bg-gray-100" />
                                <div className="font-semibold text-sm text-center line-clamp-2 mb-1">{sim.name}</div>
                                <div className="text-green-600 font-bold text-sm">{typeof sim.price === 'number' && sim.price > 0 ? sim.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) + ' ₽' : "Нет цены"}</div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 