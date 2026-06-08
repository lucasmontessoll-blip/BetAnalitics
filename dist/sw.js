// Motor básico para enganar o navegador e permitir a instalação
self.addEventListener('install', (e) => {
  console.log('[ServiceWorker] Instalado');
});

self.addEventListener('fetch', (e) => {
  // Não faz nada, apenas cumpre a regra do Google Chrome
});