self.addEventListener('install', (event) => {
  console.log('Service Worker BetAnalytics Instalado com Sucesso.');
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Pass-through básico para manter a app online e não dar erro de no-op
  event.respondWith(fetch(event.request));
});