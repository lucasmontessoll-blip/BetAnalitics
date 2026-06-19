import axios from 'axios';

const api = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': import.meta.env.VITE_APISPORTS_KEY
  }
});

// Jogos da Copa
export async function buscarJogosCopa() {
  const { data } = await api.get('/fixtures?league=1&season=2026');
  return data.response;
}

// Odds
export async function buscarOddsJogo(fixtureId) {
  const { data } = await api.get(`/odds?fixture=${fixtureId}`);
  return data.response;
}

// Escalações
export async function buscarEscalacoes(fixtureId) {
  const { data } = await api.get(`/fixtures/lineups?fixture=${fixtureId}`);
  return data.response;
}

// Eventos
export async function buscarEventos(fixtureId) {
  const { data } = await api.get(`/fixtures/events?fixture=${fixtureId}`);
  return data.response;
}