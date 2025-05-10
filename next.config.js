const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // PWA будет отключен в режиме разработки
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
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
  },
};

module.exports = withPWA(nextConfig);