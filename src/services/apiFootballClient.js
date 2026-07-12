import { mapApiFootballFixtureToJogo } from './apiFootballMapper.js';

export async function buscarJogosApiFootball({ data, ligaId = null, aoVivo = false, signal } = {}) {
  const params = new URLSearchParams();

  if (aoVivo) {
    params.set('live', 'all');
  } else if (data) {
    params.set('date', data);
  }

  if (ligaId) params.set('league', String(ligaId));

  const resp = await fetch(`/api/football/jogos?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  let payload = null;
  try {
    payload = await resp.json();
  } catch (e) {
    payload = null;
  }

  if (!resp.ok) {
    throw new Error(payload?.erro || payload?.message || 'Erro ao consultar API-Football.');
  }

  const lista = Array.isArray(payload?.jogos)
    ? payload.jogos
    : Array.isArray(payload?.response)
      ? payload.response.map(mapApiFootballFixtureToJogo)
      : [];

  return lista.map((jogo) => ({
    ...jogo,
    fonte_dados: 'api-football',
  }));
}
