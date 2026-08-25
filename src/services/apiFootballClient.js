import { mapApiFootballFixtureToJogo } from './apiFootballMapper.js';
import { apiUrl } from '../utils/apiBase.js';
import { lerCacheJson, salvarCacheJson } from '../utils/cacheJson.js';

const CACHE_FRESCO_MS = 15 * 1000;
const CACHE_OFFLINE_MAX_MS = 6 * 60 * 60 * 1000;

function resultadoVazio(erro = 'API-Football indisponivel no momento.') {
  return {
    ok: false,
    demo: false,
    cache: false,
    stale: false,
    response: [],
    jogos: [],
    standings: [],
    ligas: [],
    player: null,
    team: null,
    fixture: null,
    statistics: [],
    events: [],
    lineups: [],
    players: [],
    injuries: [],
    predictions: null,
    odds: [],
    oddsLive: [],
    h2h: [],
    erro,
  };
}

function aplicarInfoCache(dados, { stale = false, idadeMs = 0 } = {}) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    return dados;
  }

  return {
    ...dados,
    cache: true,
    stale,
    cacheAgeMs: idadeMs,
  };
}

async function requestJson(path, options = {}) {
  const url = apiUrl(path);

  const metodo = String(options.method || 'GET').toUpperCase();
  const usaCache = metodo === 'GET';

  const cacheKey = `football:${url}`;
  const cache = usaCache ? lerCacheJson(cacheKey) : null;

  // Cache muito recente: evita requisicoes duplicadas,
  // especialmente quando React StrictMode executa efeitos novamente.
  if (cache && cache.idadeMs <= CACHE_FRESCO_MS) {
    return aplicarInfoCache(cache.dados, {
      stale: false,
      idadeMs: cache.idadeMs,
    });
  }

  try {
    const resp = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok || data?.ok === false) {
      const mensagem =
        data?.erro ||
        data?.message ||
        `HTTP ${resp.status}`;

      console.warn('API-Football indisponivel:', mensagem);

      // Em falha temporaria, usa a ultima resposta real conhecida.
      if (cache && cache.idadeMs <= CACHE_OFFLINE_MAX_MS) {
        return aplicarInfoCache(cache.dados, {
          stale: true,
          idadeMs: cache.idadeMs,
        });
      }

      return resultadoVazio(mensagem);
    }

    const resultado = data || {
      ok: true,
      response: [],
    };

    if (usaCache) {
      salvarCacheJson(cacheKey, resultado);
    }

    return resultado;
  } catch (err) {
    // Abort nao deve ser transformado em erro nem em fallback.
    if (err?.name === 'AbortError') {
      throw err;
    }

    console.warn(
      'Falha ao consultar API-Football:',
      err?.message || err
    );

    if (cache && cache.idadeMs <= CACHE_OFFLINE_MAX_MS) {
      return aplicarInfoCache(cache.dados, {
        stale: true,
        idadeMs: cache.idadeMs,
      });
    }

    return resultadoVazio(
      'Servidor API-Football indisponivel.'
    );
  }
}

export async function buscarJogosApiFootball({
  data,
  ligaId = null,
  aoVivo = false,
  signal,
} = {}) {
  const params = new URLSearchParams();

  if (aoVivo) {
    params.set('live', 'all');
  } else if (data) {
    params.set('date', data);
  }

  if (ligaId) {
    params.set('league', ligaId);
  }

  const payload = await requestJson(
    `/api/football/jogos?${params.toString()}`,
    { signal }
  );

  const lista = payload?.jogos || payload?.response || [];

  return Array.isArray(lista)
    ? lista.map(mapApiFootballFixtureToJogo)
    : [];
}

export async function buscarDetalhesJogoApiFootball(
  fixtureId,
  { signal } = {}
) {
  if (!fixtureId) {
    return {
      ok: false,
      fixture: null,
      statistics: [],
      events: [],
      lineups: [],
      players: [],
      odds: [],
      oddsLive: [],
      injuries: [],
      h2h: [],
      predictions: null,
    };
  }

  return requestJson(
    `/api/football/jogo/${fixtureId}`,
    { signal }
  );
}

export async function buscarClassificacaoApiFootball({
  league,
  season,
  signal,
} = {}) {
  if (!league) return [];

  const params = new URLSearchParams();

  params.set('league', league);

  if (season) {
    params.set('season', season);
  }

  const payload = await requestJson(
    `/api/football/classificacao?${params.toString()}`,
    { signal }
  );

  return payload?.standings || [];
}

export async function buscarTimeApiFootball({
  teamId,
  league,
  season,
  signal,
} = {}) {
  if (!teamId) return null;

  const params = new URLSearchParams();

  if (league) {
    params.set('league', league);
  }

  if (season) {
    params.set('season', season);
  }

  return requestJson(
    `/api/football/time/${teamId}?${params.toString()}`,
    { signal }
  );
}

export async function buscarJogadorApiFootball({
  playerId,
  team,
  league,
  season,
  signal,
} = {}) {
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

  const payload = await requestJson(
    `/api/football/jogador/${playerId}?${params.toString()}`,
    { signal }
  );

  return payload?.player || null;
}

export async function buscarLigasApiFootball({
  season,
  country,
  search,
  id,
  signal,
} = {}) {
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

  const payload = await requestJson(
    `/api/football/ligas?${params.toString()}`,
    { signal }
  );

  return payload?.ligas || [];
}
