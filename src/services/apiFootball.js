import axios from 'axios';

const api = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': import.meta.env.VITE_API_FOOTBALL_KEY
  }
});

export async function buscarJogosCopa() {
  try {
    const { data } = await api.get('/fixtures?league=1&season=2026');
    return data.response;
  } catch (error) {
    console.error('Erro Copa:', error);
    return [];
  }
}