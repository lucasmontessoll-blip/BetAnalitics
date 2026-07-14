import { mapApiFootballFixtureToJogo } from './apiFootballMapper.js';

const API_BASE = '';

async function requestJson(url, options = {}) {
  const resp = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await resp.json().catch(() => null);

  if (!resp.ok || data?.ok === false) {
    throw new Error(data?.erro || data?.message || `Erro HTTP ${resp.status}`);
  }

  return data;
}

export async function buscarJogosApiFootball({ data, ligaId = null, aoVivo = false, signal } = {}) {
  const params = new URLSearchParams();

  if (aoVivo) {
    params.set('live', 'all');
  } else if (data) {
    params.set('date', data);
  }

  if (ligaId) {
    params.set('league', ligaId);
  }

  const payload = await requestJson(`${API_BASE}/api/football/jogos?${params.toString()}`, { signal });
  const lista = payload?.jogos || payload?.response || [];

  return Array.isArray(lista)
    ? lista.map(mapApiFootballFixtureToJogo)
    : [];
}

export async function buscarDetalhesJogoApiFootball(fixtureId, { signal } = {}) {
  if (!fixtureId) {
    throw new Error('FixtureId não informado.');
  }

  return requestJson(`${API_BASE}/api/football/jogo/${fixtureId}`, { signal });
}

export async function buscarClassificacaoApiFootball({ league, season, signal } = {}) {
  if (!league) return [];

  const params = new URLSearchParams();
  params.set('league', league);

  if (season) {
    params.set('season', season);
  }

  const payload = await requestJson(`${API_BASE}/api/football/classificacao?${params.toString()}`, { signal });

  return payload?.standings || [];
}

export async function buscarTimeApiFootball({ teamId, league, season, signal } = {}) {
  if (!teamId) return null;

  const params = new URLSearchParams();

  if (league) {
    params.set('league', league);
  }

  if (season) {
    params.set('season', season);
  }

  return requestJson(`${API_BASE}/api/football/time/${teamId}?${params.toString()}`, { signal });
}

export async function buscarJogadorApiFootball({ playerId, team, league, season, signal } = {}) {
  if (!playerId) return null;

  const params = new URLSearchParams();

  if (team) {
    params.set('team', team);
  }

  if (league) {
    params.set('league', league);
  }

  if (season) {
    params.set('season', season);
  }

  const payload = await requestJson(`${API_BASE}/api/football/jogador/${playerId}?${params.toString()}`, { signal });

  return payload?.player || null;
}

export async function buscarLigasApiFootball({ season, country, search, id, signal } = {}) {
  const params = new URLSearchParams();

  if (season) {
    params.set('season', season);
  }

  if (country) {
    params.set('country', country);
  }

  if (search) {
    params.set('search', search);
  }

  if (id) {
    params.set('id', id);
  }

  const payload = await requestJson(`${API_BASE}/api/football/ligas?${params.toString()}`, { signal });

  return payload?.ligas || [];
}
