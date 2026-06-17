import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': import.meta.env.VITE_API_FOOTBALL_KEY
  }
});

// ============================================================================
// 🏆 JOGOS DA COPA
// ============================================================================
export async function buscarJogosCopa() {
  try {
    const { data } = await api.get('/fixtures?league=1&season=2026');
    return data.response;
  } catch (error) {
    console.error('Erro Copa:', error);
    return [];
  }
}

// ============================================================================
// 📊 ODDS DO JOGO (Para calcular Value Bets reais)
// ============================================================================
export async function buscarOddsJogo(fixtureId) {
  try {
    const { data } = await api.get(`/odds?fixture=${fixtureId}`);
    return data.response;
  } catch (error) {
    console.error('Erro Odds:', error);
    return [];
  }
}

// ============================================================================
// 👕 ESCALAÇÕES (Para a IA saber se as estrelas estão em campo)
// ============================================================================
export async function buscarEscalacoes(fixtureId) {
  try {
    const { data } = await api.get(`/fixtures/lineups?fixture=${fixtureId}`);
    return data.response;
  } catch (error) {
    console.error('Erro Escalações:', error);
    return [];
  }
}

// ============================================================================
// ⚡ EVENTOS AO VIVO (Golos, Cartões, Substituições)
// ============================================================================
export async function buscarEventos(fixtureId) {
  try {
    const { data } = await api.get(`/fixtures/events?fixture=${fixtureId}`);
    return data.response;
  } catch (error) {
    console.error('Erro Eventos:', error);
    return [];
  }
}