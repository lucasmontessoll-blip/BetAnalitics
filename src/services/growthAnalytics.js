import { apiUrl, appRodandoNoCelular } from '../utils/apiBase.js';
import { sessaoAtual } from './authClient.js';

const ANON_KEY = 'bet_analytics_anonymous_id_v1';
const SESSION_KEY = 'bet_analytics_session_id_v1';

function id(storage, key) {
  try {
    let atual = storage.getItem(key);
    if (!atual) {
      atual = crypto.randomUUID();
      storage.setItem(key, atual);
    }
    return atual;
  } catch {
    return crypto.randomUUID();
  }
}

function campanhas() {
  const params = new URLSearchParams(window.location.search);
  const valor = (nome, maximo) => String(params.get(nome) || '').slice(0, maximo) || null;
  return {
    utm_source: valor('utm_source', 80),
    utm_medium: valor('utm_medium', 80),
    utm_campaign: valor('utm_campaign', 100),
    utm_content: valor('utm_content', 100),
    utm_term: valor('utm_term', 100)
  };
}

export async function registrarEvento(eventName, properties = {}, autenticado = false) {
  try {
    const session = autenticado ? await sessaoAtual() : null;
    const token = session?.access_token;
    if (autenticado && !token) return false;
    const resp = await fetch(apiUrl(autenticado ? '/api/analytics/event/auth' : '/api/analytics/event'), {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        event_name: eventName,
        anonymous_id: id(localStorage, ANON_KEY),
        session_id: id(sessionStorage, SESSION_KEY),
        platform: appRodandoNoCelular() ? 'android' : 'web',
        ...campanhas(),
        properties
      })
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function adminFetch(path, options = {}) {
  const session = await sessaoAtual();
  if (!session?.access_token) throw new Error('Sessão administrativa ausente.');
  const resp = await fetch(apiUrl(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers
    }
  });
  const data = await resp.json().catch(() => null);
  if (!resp.ok || !data?.ok) throw new Error(data?.erro || 'Não foi possível carregar as métricas.');
  return data;
}

export async function carregarDashboard(from, to) {
  const params = new URLSearchParams({ from, to });
  return (await adminFetch(`/api/admin/analytics?${params}`)).dashboard;
}

export async function salvarCusto(custo) {
  return (await adminFetch('/api/admin/analytics/costs', {
    method: 'POST', body: JSON.stringify(custo)
  })).cost;
}
