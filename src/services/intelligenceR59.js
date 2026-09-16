import { apiUrl, appRodandoNoCelular } from '../utils/apiBase.js';
import { sessaoAtual } from './authClient.js';

async function request(path, options = {}) {
  const session = await sessaoAtual();
  if (!session?.access_token) throw new Error('Entre na sua conta para usar este recurso.');
  const response = await fetch(apiUrl(path), { ...options, headers: { Accept: 'application/json', Authorization: `Bearer ${session.access_token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) } });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    if (data?.code === 'API_NOT_CONFIGURED') throw new Error('A API esportiva ainda não foi configurada no servidor.');
    throw new Error('Serviço temporariamente indisponível.');
  }
  return data;
}

export const carregarStatusR59 = () => fetch(apiUrl('/api/intelligence/status')).then((r) => r.json());
export const carregarBriefing = (teamIds = []) => request(`/api/intelligence/briefing?teams=${encodeURIComponent(teamIds.join(','))}`);
export const compararTimes = ({ a, b, league, season }) => request(`/api/intelligence/compare?a=${a}&b=${b}&league=${league || ''}&season=${season || new Date().getFullYear()}`);
export const explicarAnalise = (fixtureId) => request(`/api/intelligence/explanation/${encodeURIComponent(fixtureId)}`);
export const enviarFeedbackR59 = (payload) => request('/api/intelligence/feedback', { method: 'POST', body: JSON.stringify({ ...payload, platform: appRodandoNoCelular() ? 'android' : 'web' }) });
export const carregarRetencaoAdmin = () => request('/api/admin/retention');
