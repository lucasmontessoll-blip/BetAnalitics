const API_PRODUCAO = String(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://betanalitics-webservice.onrender.com'
).replace(/\/$/, '');

export function appRodandoNoCelular() {
  if (typeof window === 'undefined') return false;

  const protocolo = String(window.location.protocol || '').toLowerCase();
  const origem = String(window.location.origin || '').toLowerCase();

  if (protocolo === 'capacitor:' || protocolo === 'ionic:') return true;
  if (origem === 'http://localhost' || origem === 'https://localhost') return true;

  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function') {
    return window.Capacitor.isNativePlatform();
  }

  return false;
}

export function apiUrl(path) {
  const caminho = String(path || '').startsWith('/') ? String(path || '') : '/' + String(path || '');
  return appRodandoNoCelular() ? API_PRODUCAO + caminho : caminho;
}
