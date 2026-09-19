const STORAGE_KEY = 'golnexa_quality_v1';
const MAX_ERRORS = 30;
const MAX_METRICS = 60;
let initialized = false;
let sessionId = null;

function now() { return new Date().toISOString(); }
function cleanText(value, max = 240) {
  return String(value || '')
    .replace(/https?:\/\/\S+/gi, '[url]')
    .replace(/bearer\s+\S+/gi, '[auth]')
    .replace(/[A-Za-z0-9_-]{32,}/g, '[redacted]')
    .slice(0, max);
}
function emptyState() { return { version: 1, errors: [], metrics: [], last_updated: null }; }
function readState() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return value && typeof value === 'object' ? { ...emptyState(), ...value } : emptyState();
  } catch { return emptyState(); }
}
function writeState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, last_updated: now() })); } catch {}
}
function getSessionId() {
  if (!sessionId) sessionId = globalThis.crypto?.randomUUID?.() || `s-${Date.now().toString(36)}`;
  return sessionId;
}

export function recordClientError(error, context = 'runtime') {
  const state = readState();
  state.errors.push({
    at: now(),
    session: getSessionId(),
    context: cleanText(context, 80),
    name: cleanText(error?.name || 'Error', 80),
    message: cleanText(error?.message || error || 'Unknown error'),
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
  });
  state.errors = state.errors.slice(-MAX_ERRORS);
  writeState(state);
}

function recordMetric(name, value, rating = '') {
  if (!Number.isFinite(Number(value))) return;
  const state = readState();
  state.metrics.push({ at: now(), session: getSessionId(), name, value: Math.round(Number(value) * 100) / 100, rating });
  state.metrics = state.metrics.slice(-MAX_METRICS);
  writeState(state);
}

function observePerformance() {
  if (typeof PerformanceObserver === 'undefined') return;
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) recordMetric('LCP', last.startTime || last.renderTime || last.loadTime || 0);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}
  try {
    let cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) cls += entry.value || 0;
      recordMetric('CLS', cls);
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if ((entry.duration || 0) >= 50) recordMetric('LONG_TASK', entry.duration);
    }).observe({ type: 'longtask', buffered: true });
  } catch {}
}

export function initQualityMonitoring() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  window.addEventListener('error', (event) => recordClientError(event.error || event.message, 'window.error'));
  window.addEventListener('unhandledrejection', (event) => recordClientError(event.reason, 'unhandledrejection'));
  window.addEventListener('online', () => recordMetric('ONLINE', 1));
  window.addEventListener('offline', () => recordMetric('ONLINE', 0));
  observePerformance();
}

export function getQualitySnapshot() {
  const state = readState();
  return {
    ...state,
    privacy: { email: false, ip: false, token: false, query: false, body: false },
  };
}

export function clearQualitySnapshot() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}