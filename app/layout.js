import React from 'react';
import './globals.css';
// import TopIconsBar from "./TopIconsBar"; 
import BottomNav from "./BottomNav"; // {{Раскомментируем импорт}}
import { CartProvider } from "./CartContext";
import { FavoritesProvider } from "./FavoritesContext";
import InstallPWAButton from './InstallPWAButton'; 
import dynamic from 'next/dynamic';
// import MinimalCartTest from './MinimalCartTest'; // {{Закомментируем импорт MinimalCartTest}}

const TopIconsBar = dynamic(() => import('./TopIconsBar'), {
  ssr: false,
});

export const metadata = {
  title: 'Shop — Современный интернет-магазин',
  description: 'Лучший магазин с безупречным дизайном и потрясающей логикой',
};

export default function RootLayout({ children }) { // {{Теперь children снова будет использоваться}}
  return (
    <html lang="ru" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" /><link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-gray-50 min-h-screen text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <FavoritesProvider>
          <CartProvider>
            <TopIconsBar />
            {children} {/* {{Возвращаем {children} }} */}
            <BottomNav /> 
          </CartProvider>
        </FavoritesProvider>
        <InstallPWAButton /> 
      </body>
    </html>
  );
}
