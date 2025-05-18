const withPWA = require('next-pwa');

// Определяем окружение
const isProd = process.env.NODE_ENV === 'production';

// Конфигурация PWA
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: !isProd, // PWA будет отключен в режиме разработки
  runtimeCaching: [
    // Кэширование статических ассетов Next.js (_next/static)
    {
      urlPattern: /^https?:\/\/[^/]+\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-assets',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 дней
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Кэширование изображений
    {
      urlPattern: /\.(?:png|gif|jpg|jpeg|svg|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 дней
        },
      },
    },
    // Кэширование шрифтов (Google Fonts)
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets',
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 год
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Кэширование API запросов MoySklad
    {
      urlPattern: /\/api\/(ms-products|ms-groups)/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-moy-sklad-data',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 1 * 24 * 60 * 60, // 1 день
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Общий обработчик для других API запросов
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-calls',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60, // 1 день
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Кэширование страниц (HTML навигация)
    {
      urlPattern: ({ request, url }) => request.destination === 'document' || url.pathname === '/',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-html',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1 день
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
  },
  // Явно указываем, какие переменные окружения должны быть доступны на клиенте
  env: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    // Другие публичные переменные окружения
  },
  // Для API роутов используем serverRuntimeConfig
  serverRuntimeConfig: {
    // Переменные, доступные только на сервере
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  },
};

// Применяем конфигурацию PWA к nextConfig
module.exports = withPWA({
  ...nextConfig,
  pwa: pwaConfig,
});