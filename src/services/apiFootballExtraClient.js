const API_BASE = '';

async function requestJson(url, options = {}) {
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
      console.warn('API-Football extra indisponivel:', data?.erro || data?.message || `HTTP ${resp.status}`);

      return {
        ok: false,
        demo: true,
        response: [],
        paises: [],
        temporadas: [],
        h2h: [],
        artilheiros: [],
        treinadores: [],
        transferencias: [],
        trofeus: [],
        sidelined: [],
        lesoes: [],
        oddsLive: [],
        odds: [],
        predictions: null,
        fixture: null,
        statistics: [],
        events: [],
        lineups: [],
        players: [],
        injuries: [],
        erro: data?.erro || data?.message || 'API-Football indisponivel no momento.',
      };
    }

    return data || { ok: true, response: [] };
  } catch (err) {
    console.warn('Falha ao consultar API-Football extra:', err?.message || err);

    return {
      ok: false,
      demo: true,
      response: [],
      paises: [],
      temporadas: [],
      h2h: [],
      artilheiros: [],
      treinadores: [],
      transferencias: [],
      trofeus: [],
      sidelined: [],
      lesoes: [],
      oddsLive: [],
      odds: [],
      predictions: null,
      fixture: null,
      statistics: [],
      events: [],
      lineups: [],
      players: [],
      injuries: [],
      erro: 'Servidor API-Football indisponivel.',
    };
  }
}

function montarQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const texto = query.toString();
  return texto ? `?${texto}` : '';
}

export async function buscarPaisesApiFootball({ signal } = {}) {
  const payload = await requestJson(`${API_BASE}/api/football/paises`, { signal });
  return payload?.paises || payload?.response || [];
}

export async function buscarTemporadasApiFootball({ signal } = {}) {
  const payload = await requestJson(`${API_BASE}/api/football/temporadas`, { signal });
  return payload?.temporadas || payload?.response || [];
}

export async function buscarH2HApiFootball({ home, away, last = 10, signal } = {}) {
  if (!home || !away) return [];

  const query = montarQuery({ home, away, last });
  const payload = await requestJson(`${API_BASE}/api/football/h2h${query}`, { signal });

  return payload?.h2h || payload?.response || [];
}

export async function buscarArtilheirosApiFootball({ league, season, signal } = {}) {
  if (!league) return [];

  const query = montarQuery({ league, season });
  const payload = await requestJson(`${API_BASE}/api/football/artilheiros${query}`, { signal });

  return payload?.artilheiros || payload?.response || [];
}

export async function buscarTreinadoresApiFootball({ team, id, search, signal } = {}) {
  const query = montarQuery({ team, id, search });
  const payload = await requestJson(`${API_BASE}/api/football/treinadores${query}`, { signal });

  return payload?.treinadores || payload?.response || [];
}

export async function buscarTransferenciasApiFootball({ player, team, signal } = {}) {
  if (!player && !team) return [];

  const query = montarQuery({ player, team });
  const payload = await requestJson(`${API_BASE}/api/football/transferencias${query}`, { signal });

  return payload?.transferencias || payload?.response || [];
}

export async function buscarTrofeusApiFootball({ player, coach, signal } = {}) {
  if (!player && !coach) return [];

  const query = montarQuery({ player, coach });
  const payload = await requestJson(`${API_BASE}/api/football/trofeus${query}`, { signal });

  return payload?.trofeus || payload?.response || [];
}

export async function buscarSidelinedApiFootball({ player, coach, signal } = {}) {
  if (!player && !coach) return [];

  const query = montarQuery({ player, coach });
  const payload = await requestJson(`${API_BASE}/api/football/sidelined${query}`, { signal });

  return payload?.sidelined || payload?.response || [];
}

export async function buscarLesoesApiFootball({ fixture, team, league, season, signal } = {}) {
  const query = montarQuery({ fixture, team, league, season });
  const payload = await requestJson(`${API_BASE}/api/football/lesoes${query}`, { signal });

  return payload?.lesoes || payload?.injuries || payload?.response || [];
}

export async function buscarOddsLiveApiFootball({ fixture, league, signal } = {}) {
  const query = montarQuery({ fixture, league });
  const payload = await requestJson(`${API_BASE}/api/football/odds-live${query}`, { signal });

  return payload?.oddsLive || payload?.response || [];
}

export async function buscarOddsPreJogoApiFootball({ fixture, league, season, bookmaker, signal } = {}) {
  const query = montarQuery({ fixture, league, season, bookmaker });
  const payload = await requestJson(`${API_BASE}/api/football/odds-prejogo${query}`, { signal });

  return payload?.odds || payload?.response || [];
}

export async function buscarPrevisoesApiFootball({ fixtureId, signal } = {}) {
  if (!fixtureId) return null;

  const payload = await requestJson(`${API_BASE}/api/football/previsoes/${fixtureId}`, { signal });

  return payload?.predictions || payload?.prediction || payload?.response?.[0] || null;
}

export async function buscarPacoteCompletoApiFootball({
  fixtureId,
  league,
  season,
  home,
  away,
  signal,
} = {}) {
  if (!fixtureId) {
    return {
      ok: false,
      demo: true,
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
    };
  }

  const query = montarQuery({ league, season, home, away });

  const payload = await requestJson(
    `${API_BASE}/api/football/pacote-completo/${fixtureId}${query}`,
    { signal }
  );

  return {
    ok: payload?.ok !== false,
    demo: Boolean(payload?.demo),
    fixture: payload?.fixture || null,
    statistics: payload?.statistics || [],
    events: payload?.events || [],
    lineups: payload?.lineups || [],
    players: payload?.players || [],
    injuries: payload?.injuries || payload?.lesoes || [],
    predictions: payload?.predictions || null,
    odds: payload?.odds || [],
    oddsLive: payload?.oddsLive || [],
    h2h: payload?.h2h || [],
  };
}
