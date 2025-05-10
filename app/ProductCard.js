"use client";
import React, { useState, useEffect } from 'react'; // Добавляем useEffect
import { useCart } from "./CartContext";
import { useFavorites } from "./FavoritesContext";
import Link from "next/link";

export default function ProductCard({ product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { addToCart, cart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [isMounted, setIsMounted] = useState(false); // Состояние для отслеживания монтирования
  
  // Значения по умолчанию, которые будут использоваться на сервере и до монтирования на клиенте
  let currentIsFav = false;
  let currentIsInCart = false;

  if (isMounted) {
    // После монтирования используем реальные значения
    currentIsFav = isFavorite(product.id);
    currentIsInCart = cart && cart.some(item => item.id === product.id);
  }

  useEffect(() => {
    setIsMounted(true); // Устанавливаем после монтирования на клиенте
  }, []);

  let images = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    images = product.images;
  } else if (product.imageUrl) {
    images = [product.imageUrl];
  } else if (typeof product.image === 'string') {
    images = [product.image];
  } else if (typeof product.picture === 'string') {
    images = [product.picture];
  }
  const validImages = images.length > 0
    ? images.filter(img => typeof img === 'string' && (img.startsWith('https://apsnypack.s3.cloud.ru/') || img.startsWith('/images/') || img.startsWith('http')))
    : [];

  const showPrev = () => setActiveIndex(i => (i - 1 + validImages.length) % validImages.length);
  const showNext = () => setActiveIndex(i => (i + 1) % validImages.length);

  // --- Свайп для мобильных устройств ---
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const minSwipeDistance = 40; // Минимальная длина свайпа в px

  const onTouchStart = (e) => {
    setTouchEndX(null); // Сброс
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      // свайп влево
      showNext();
    } else if (distance < -minSwipeDistance) {
      // свайп вправо
      showPrev();
    }
  };

  const mainImage = validImages[0] || null;

  // --- Модальное окно ---
  const [showModal, setShowModal] = useState(false);
  // const [modalIndex, setModalIndex] = useState(0); // Закомментировано - no-unused-vars
  const openModal = (/*idx = 0*/) => { // Параметр idx удален/закомментирован, так как modalIndex закомментирован
    // setModalIndex(idx); // Закомментировано
    setShowModal(true);
  };
  // const closeModal = () => setShowModal(false); // Закомментировано - no-unused-vars
  // const showPrevModal = (e) => { e.stopPropagation(); setModalIndex(i => (i - 1 + validImages.length) % validImages.length); }; // Закомментировано - no-unused-vars
  // const showNextModal = (e) => { e.stopPropagation(); setModalIndex(i => (i + 1) % validImages.length); }; // Закомментировано - no-unused-vars

  // --- Похожие товары ---
  /* // Закомментировано - 'similar' is no-unused-vars
  let similar = [];
  if (allProducts && product.productFolder && product.productFolder.id) {
    similar = allProducts.filter(
      p => p.id !== product.id && p.productFolder && p.productFolder.id === product.productFolder.id
    ).slice(0, 4);
  }
  */

  // --- Зум для фото в модалке ---
  // const [zoomed, setZoomed] = useState(false); // Связано с закомментированной логикой
  // const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 }); // Связано с закомментированной логикой
  // const imgRef = useRef(null); // Закомментировано - no-unused-vars
  // const dragStart = useRef(null); // Связано с закомментированной логикой

  // const handleImgClick = (e) => { // Закомментировано - no-unused-vars
  //   e.stopPropagation();
  //   setZoomed(z => !z);
  //   setZoomPos({ x: 0, y: 0 });
  // };
  // const handleImgMouseDown = (e) => { // Закомментировано - no-unused-vars
  //   if (!zoomed) return;
  //   dragStart.current = { x: e.clientX, y: e.clientY, ...zoomPos };
  //   document.addEventListener('mousemove', handleImgMouseMove);
  //   document.addEventListener('mouseup', handleImgMouseUp);
  // };
  // const handleImgMouseMove = (e) => { // Связано с закомментированной логикой
  //   if (!dragStart.current) return;
  //   const dx = e.clientX - dragStart.current.x;
  //   const dy = e.clientY - dragStart.current.y;
  //   setZoomPos({ x: dragStart.current.x + dx - dragStart.current.x, y: dragStart.current.y + dy - dragStart.current.y });
  // };
  // const handleImgMouseUp = () => { // Связано с закомментированной логикой
  //   dragStart.current = null;
  //   document.removeEventListener('mousemove', handleImgMouseMove);
  //   document.removeEventListener('mouseup', handleImgMouseUp);
  // };
  // // Touch events для мобильных
  // const handleImgTouchStart = (e) => { // Закомментировано - no-unused-vars
  //   if (!zoomed) return;
  //   const touch = e.touches[0];
  //   dragStart.current = { x: touch.clientX, y: touch.clientY, ...zoomPos };
  //   document.addEventListener('touchmove', handleImgTouchMove);
  //   document.addEventListener('touchend', handleImgTouchEnd);
  // };
  // const handleImgTouchMove = (e) => { // Связано с закомментированной логикой
  //   if (!dragStart.current) return;
  //   const touch = e.touches[0];
  //   const dx = touch.clientX - dragStart.current.x;
  //   const dy = touch.clientY - dragStart.current.y;
  //   setZoomPos({ x: dragStart.current.x + dx - dragStart.current.x, y: dragStart.current.y + dy - dragStart.current.y });
  // };
  // const handleImgTouchEnd = () => { // Связано с закомментированной логикой
  //   dragStart.current = null;
  //   document.removeEventListener('touchmove', handleImgTouchMove);
  //   document.removeEventListener('touchend', handleImgTouchEnd);
  // };
  // Блокировка прокрутки body при открытии модалки
  React.useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="relative bg-white rounded-2xl shadow-lg flex flex-col items-stretch max-w-xs w-full mx-auto transition-transform hover:-translate-y-1 hover:shadow-2xl duration-200 cursor-pointer">
        <button
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 shadow-md hover:scale-110 transition-transform"
          onClick={e => { 
            e.preventDefault(); 
            if (isMounted) toggleFavorite({ ...product, image: mainImage }); // Действие только если смонтировано
          }}
          aria-label="В избранное"
          style={{ zIndex: 10 }}
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill={currentIsFav ? "#e53935" : "none"}> {/* Используем currentIsFav */}
              <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke={currentIsFav ? "#e53935" : "#222"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> {/* Используем currentIsFav */}
            </svg>
          </span>
        </button>
        <button
          className="absolute bottom-3 right-3 w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Добавить в корзину"
          onClick={e => { 
            e.preventDefault(); 
            if (isMounted) addToCart({ ...product, image: mainImage }); // Действие только если смонтировано
          }}
          style={{ zIndex: 10 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M11.5 8H20.196C20.8208 8 21.1332 8 21.3619 8.10084C22.3736 8.5469 21.9213 9.67075 21.7511 10.4784C21.7205 10.6235 21.621 10.747 21.4816 10.8132C20.9033 11.0876 20.4982 11.6081 20.3919 12.2134L19.7993 15.5878C19.5386 17.0725 19.4495 19.1943 18.1484 20.2402C17.1938 21 15.8184 21 13.0675 21H10.9325C8.18162 21 6.8062 21 5.8516 20.2402C4.55052 19.1942 4.46138 17.0725 4.20066 15.5878L3.60807 12.2134C3.50177 11.6081 3.09673 11.0876 2.51841 10.8132C2.37896 10.747 2.27952 10.6235 2.24894 10.4784C2.07874 9.67075 1.6264 8.5469 2.63812 8.10084C2.86684 8 3.17922 8 3.80397 8H7.5" stroke={currentIsInCart ? "#e53935" : "#222"} strokeWidth="1.5" strokeLinecap="round"></path> {/* Используем currentIsInCart */}
            <path d="M14 12L10 12" stroke={currentIsInCart ? "#e53935" : "#222"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> {/* Используем currentIsInCart */}
            <path d="M6.5 11L10 3M15 3L17.5 8" stroke={currentIsInCart ? "#e53935" : "#222"} strokeWidth="1.5" strokeLinecap="round"></path> {/* Используем currentIsInCart */}
          </svg>
        </button>
        <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2 flex items-center justify-center group"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ cursor: 'pointer' }}
          onClick={() => openModal()}
        >
          {validImages[activeIndex] && (
            <img
              src={validImages[activeIndex]}
              alt={product.name}
              className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              onError={e => (e.target.style.display = 'none')}
            />
          )}
          {validImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {validImages.map((_, idx) => (
                <span key={idx} className={`inline-block w-2 h-2 rounded-full ${idx === activeIndex ? 'bg-red-500' : 'bg-gray-300'}`}></span>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-end px-2 pb-3">
          <div className="font-semibold text-base text-gray-900 text-center mb-1 line-clamp-2 min-h-[40px]">{product.name}</div>
          <div className="text-green-600 font-bold text-base text-center">
            {typeof product.price === 'number' && product.price > 0
              ? product.price.toLocaleString('ru-RU', { minimumFractionDigits: 0 }) + ' ₽' // Убрал minimumFractionDigits: 2
              : "Нет цены"}
          </div>
        </div>
      </div>
    </Link>
  );
}
