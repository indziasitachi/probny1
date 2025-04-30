"use client";
import React, { useEffect, useState } from 'react';
import SearchBar from "./SearchBar";
import BannerCarousel from "./BannerCarousel";
import ProductsList from "./ProductsList";
import CategorySliderMobile from "./CategorySliderMobile";

export default function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts);
  }, []);
  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col" style={{ gap: '8px' }}>
      <SearchBar />
      <BannerCarousel />
      <CategorySliderMobile />
      <ProductsList products={products} />
    </main>
  );
}// ... existing code ...
// dummy change for git

