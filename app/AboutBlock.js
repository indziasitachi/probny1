import React from 'react';

export default function AboutBlock() {
  return (
    <div className="max-w-2xl mx-auto text-center my-12">
      <h3 className="text-xl font-bold mb-2">Почему выбирают нас?</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-2">Свежий кофе, вкусная выпечка и быстрая доставка прямо к вам!</p>
      <div className="flex justify-center gap-8 mt-4 flex-wrap">
        <div className="text-center">
          <div className="text-3xl">🚚</div>
          <div className="text-sm">Быстрая доставка</div>
        </div>
        <div className="text-center">
          <div className="text-3xl">🌱</div>
          <div className="text-sm">Свежие продукты</div>
        </div>
        <div className="text-center">
          <div className="text-3xl">⭐</div>
          <div className="text-sm">Высокий рейтинг</div>
        </div>
      </div>
    </div>
  );
}
