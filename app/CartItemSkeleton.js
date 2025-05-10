import React from 'react';

export default function CartItemSkeleton() {
  return (
    <div className="flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 gap-3 sm:gap-6 transition-all animate-pulse">
      {/* Изображение-заглушка */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
      
      {/* Информация о товаре - заглушки */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div> {/* Название */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div> {/* Цена за шт. */}
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div> {/* Итоговая цена */}
      </div>
      
      {/* Управление количеством - заглушки */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-full bg-gray-300 dark:bg-gray-700"></div> {/* Кнопка - */}
          <div className="w-20 h-11 rounded-lg bg-gray-300 dark:bg-gray-700"></div>   {/* Инпут */}
          <div className="w-11 h-11 rounded-full bg-gray-300 dark:bg-gray-700"></div> {/* Кнопка + */}
        </div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16 mt-1"></div> {/* Кнопка удалить */}
      </div>
    </div>
  );
}