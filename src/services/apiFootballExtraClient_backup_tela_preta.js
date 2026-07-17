async function requestJson(url, options = {}) {
  const resp = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', ...(options.headers || {}) },
  });

  const data = await resp.json().catch(() => null);

  if (!resp.ok || data?.ok === false) {
    throw new Error(data?.erro || `Erro HTTP ${resp.status}`);
  }

  return data;
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

export async function buscarPacoteCompletoApiFootball({ fixture, league, season, home, away, signal } = {}) {
  if (!fixture) throw new Error('Fixture nao informado.');

  const p = new URLSearchParams();
  if (league) p.set('league', league);
  if (season) p.set('season', season);
  if (home) p.set('home', home);
  if (away) p.set('away', away);

  return requestJson(`/api/football/pacote-completo/${fixture}?${p.toString()}`, { signal });
}
