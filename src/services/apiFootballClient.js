async function requestJson(url, options = {}) {
  const resp = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', ...(options.headers || {}) },
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok || data?.ok === false) throw new Error(data?.erro || `Erro HTTP ${resp.status}`);
  return data;
}

export async function buscarPaisesApiFootball({ search, signal } = {}) {
  const p = new URLSearchParams();
  if (search) p.set('search', search);
  const data = await requestJson(`/api/football/paises?${p.toString()}`, { signal });
  return data?.paises || [];
}

export async function buscarTemporadasApiFootball({ signal } = {}) {
  const data = await requestJson('/api/football/temporadas', { signal });
  return data?.temporadas || [];
}

export async function buscarH2HApiFootball({ home, away, league, season, signal } = {}) {
  const p = new URLSearchParams();
  if (home && away) p.set('h2h', `${home}-${away}`);
  if (league) p.set('league', league);
  if (season) p.set('season', season);
  const data = await requestJson(`/api/football/h2h?${p.toString()}`, { signal });
  return data?.h2h || [];
}

export async function buscarArtilheirosApiFootball({ league, season, signal } = {}) {
  const p = new URLSearchParams();
  if (league) p.set('league', league);
  if (season) p.set('season', season);
  return requestJson(`/api/football/artilheiros?${p.toString()}`, { signal });
}

export async function buscarTreinadoresApiFootball({ team, search, signal } = {}) {
  const p = new URLSearchParams();
  if (team) p.set('team', team);
  if (search) p.set('search', search);
  const data = await requestJson(`/api/football/treinadores?${p.toString()}`, { signal });
  return data?.treinadores || [];
}

export async function buscarTransferenciasApiFootball({ player, team, signal } = {}) {
  const p = new URLSearchParams();
  if (player) p.set('player', player);
  if (team) p.set('team', team);
  const data = await requestJson(`/api/football/transferencias?${p.toString()}`, { signal });
  return data?.transferencias || [];
}

export async function buscarTrofeusApiFootball({ player, coach, signal } = {}) {
  const p = new URLSearchParams();
  if (player) p.set('player', player);
  if (coach) p.set('coach', coach);
  const data = await requestJson(`/api/football/trofeus?${p.toString()}`, { signal });
  return data?.trofeus || [];
}

export async function buscarSidelinedApiFootball({ player, coach, signal } = {}) {
  const p = new URLSearchParams();
  if (player) p.set('player', player);
  if (coach) p.set('coach', coach);
  const data = await requestJson(`/api/football/sidelined?${p.toString()}`, { signal });
  return data?.sidelined || [];
}

export async function buscarLesoesApiFootball({ league, season, fixture, team, player, date, signal } = {}) {
  const p = new URLSearchParams();
  if (league) p.set('league', league);
  if (season) p.set('season', season);
  if (fixture) p.set('fixture', fixture);
  if (team) p.set('team', team);
  if (player) p.set('player', player);
  if (date) p.set('date', date);
  const data = await requestJson(`/api/football/lesoes?${p.toString()}`, { signal });
  return data?.lesoes || [];
}

export async function buscarOddsLiveApiFootball({ fixture, league, bet, signal } = {}) {
  const p = new URLSearchParams();
  if (fixture) p.set('fixture', fixture);
  if (league) p.set('league', league);
  if (bet) p.set('bet', bet);
  const data = await requestJson(`/api/football/odds-live?${p.toString()}`, { signal });
  return data?.oddsLive || [];
}

export async function buscarOddsPreJogoApiFootball({ fixture, league, season, date, bookmaker, bet, signal } = {}) {
  const p = new URLSearchParams();
  if (fixture) p.set('fixture', fixture);
  if (league) p.set('league', league);
  if (season) p.set('season', season);
  if (date) p.set('date', date);
  if (bookmaker) p.set('bookmaker', bookmaker);
  if (bet) p.set('bet', bet);
  const data = await requestJson(`/api/football/odds-prejogo?${p.toString()}`, { signal });
  return data?.odds || [];
}

export async function buscarPrevisoesApiFootball({ fixture, signal } = {}) {
  if (!fixture) return null;
  const data = await requestJson(`/api/football/previsoes/${fixture}`, { signal });
  return data?.previsao || null;
}

export async function buscarPacoteCompletoApiFootball({ fixture, league, season, home, away, signal } = {}) {
  if (!fixture) throw new Error('Fixture não informado.');
  const p = new URLSearchParams();
  if (league) p.set('league', league);
  if (season) p.set('season', season);
  if (home) p.set('home', home);
  if (away) p.set('away', away);
  return requestJson(`/api/football/pacote-completo/${fixture}?${p.toString()}`, { signal });
}
