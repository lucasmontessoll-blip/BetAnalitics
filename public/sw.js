self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Não intercepta localhost/Vite dev
  const url = new URL(event.request.url);

  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline', {
        status: 503,
        statusText: 'Offline',
      });
    })
  );
});