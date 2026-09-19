import { supabase, supabaseConfigurado } from './supabaseClient.js';
import { apiUrl } from '../utils/apiBase.js';

const LOCAL_KEY = 'bet_personalizacao_r53_v1';

export const preferenciasPadrao = {
  seguidos: [],
  alertas: { inicio: true, gol: true, intervalo: false, fim: true, escalacao: true, cartoes: false, odds: false },
  responsavel: { limiteMinutosDia: 60, lembreteMinutos: 30, pausaAte: null, ocultarOdds: false },
  onboarding: { completed: false, completedAt: null },
  accessibility: { textScale: 100, reduceMotion: false, highContrast: false },
};

function seguro(value) {
  const base = value && typeof value === 'object' ? value : {};
  return {
    seguidos: Array.isArray(base.seguidos) ? base.seguidos.slice(0, 100) : [],
    alertas: { ...preferenciasPadrao.alertas, ...(base.alertas || {}) },
    responsavel: { ...preferenciasPadrao.responsavel, ...(base.responsavel || {}) },
    onboarding: { ...preferenciasPadrao.onboarding, ...(base.onboarding || {}) },
    accessibility: { ...preferenciasPadrao.accessibility, ...(base.accessibility || {}) },
  };
}

export function lerPreferenciasLocais() {
  try { return seguro(JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')); }
  catch { return seguro({}); }
}

export function salvarPreferenciasLocais(value) {
  const clean = seguro(value);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(clean));
  return clean;
}

export async function carregarPreferencias(userId) {
  const local = lerPreferenciasLocais();
  if (!supabaseConfigurado || !supabase || !userId) return local;
  const { data, error } = await supabase.from('user_product_preferences').select('preferences').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  const merged = seguro(data?.preferences || local);
  salvarPreferenciasLocais(merged);
  return merged;
}

export async function salvarPreferencias(userId, value) {
  const clean = salvarPreferenciasLocais(value);
  if (!supabaseConfigurado || !supabase || !userId) return clean;
  const { error } = await supabase.from('user_product_preferences').upsert({ user_id: userId, preferences: clean, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw error;
  return clean;
}

export async function pesquisarFutebol(term, signal) {
  const q = String(term || '').trim();
  if (q.length < 3) return { teams: [], players: [], leagues: [], coaches: [] };
  const response = await fetch(apiUrl(`/api/football/pesquisa?q=${encodeURIComponent(q)}`), { signal, headers: { Accept: 'application/json' } });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) throw new Error(data?.erro || 'Pesquisa indisponível.');
  return { teams: data.teams || [], players: data.players || [], leagues: data.leagues || [], coaches: data.coaches || [] };
}

export function filtrarParaVoce(jogos, seguidos) {
  const ids = new Set((seguidos || []).map((item) => `${item.type}:${item.id}`));
  return (jogos || []).filter((jogo) =>
    ids.has(`team:${jogo.home_id}`) || ids.has(`team:${jogo.away_id}`) || ids.has(`league:${jogo.league_id}`)
  );
}
