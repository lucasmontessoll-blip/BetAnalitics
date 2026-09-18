import { apiUrl, appRodandoNoCelular } from '../utils/apiBase.js';
import { sessaoAtual } from './authClient.js';

const NEWS_CACHE = 'bet_r58_news_cache_v1';

function safeJson(value, fallback) { try { return JSON.parse(value); } catch { return fallback; } }

export async function buscarNoticiasFutebol(query = 'futebol brasileiro', signal) {
  const q = String(query || '').trim().slice(0, 60) || 'futebol brasileiro';
  const cache = safeJson(localStorage.getItem(NEWS_CACHE), null);
  try {
    const response = await fetch(apiUrl(`/api/content/football-news?q=${encodeURIComponent(q)}`), { signal, headers: { Accept: 'application/json' } });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) throw new Error('Notícias temporariamente indisponíveis.');
    const result = { items: data.items || [], stale: Boolean(data.stale), offline: false };
    localStorage.setItem(NEWS_CACHE, JSON.stringify({ ...result, saved_at: Date.now() }));
    return result;
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    if (cache?.items?.length) return { items: cache.items, stale: true, offline: true };
    throw error;
  }
}

function icsText(value) { return String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
function icsDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') : null;
}

export function gerarCalendarioIcs(jogos = []) {
  const events = jogos.slice(0, 100).map((jogo, index) => {
    const start = icsDate(jogo.starting_at || jogo.date || jogo.fixture?.date);
    if (!start) return '';
    const end = icsDate(new Date(new Date(jogo.starting_at || jogo.date || jogo.fixture?.date).getTime() + 2 * 3600000));
    const id = jogo.id || jogo.api_football_id || `local-${index}`;
    const home = jogo.home_team || jogo.time_casa || jogo.homeTeam || 'Casa';
    const away = jogo.away_team || jogo.time_fora || jogo.awayTeam || 'Fora';
    const league = jogo.league_name || jogo.liga || jogo.campeonato || 'Futebol';
    return ['BEGIN:VEVENT', `UID:Golnexa-${icsText(id)}@Golnexa`, `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${icsText(`${home} x ${away}`)}`, `DESCRIPTION:${icsText(`${league} — acompanhe no Golnexa PRO`)}`, 'END:VEVENT'].join('\r\n');
  }).filter(Boolean);
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Golnexa PRO//R58//PT-BR', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n');
}

export function baixarCalendario(jogos, filename = 'Golnexa-jogos.ics') {
  const blob = new Blob([gerarCalendarioIcs(jogos)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function aplicarAcessibilidade(settings = {}) {
  const root = document.documentElement;
  root.style.fontSize = `${Math.min(115, Math.max(90, Number(settings.textScale) || 100))}%`;
  root.classList.toggle('bet-reduce-motion', Boolean(settings.reduceMotion));
  root.classList.toggle('bet-high-contrast', Boolean(settings.highContrast));
}

export async function relatarProblema(payload) {
  const session = await sessaoAtual();
  if (!session?.access_token) throw new Error('Entre na conta para enviar o relato.');
  const response = await fetch(apiUrl('/api/product/data-quality-report'), {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ ...payload, platform: appRodandoNoCelular() ? 'android' : 'web', app_version: 'R58' }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) throw new Error('Não foi possível enviar agora.');
  return data.report;
}

export async function carregarRelatosAdmin() {
  const session = await sessaoAtual();
  if (!session?.access_token) throw new Error('Sessão administrativa ausente.');
  const response = await fetch(apiUrl('/api/admin/data-quality-reports'), { headers: { Accept: 'application/json', Authorization: `Bearer ${session.access_token}` } });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) throw new Error('Relatos indisponíveis.');
  return data.reports || [];
}
