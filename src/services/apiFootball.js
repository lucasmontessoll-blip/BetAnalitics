import axios from 'axios';

// Proteção total: puxando da variável de ambiente com o nome atualizado
const API_KEY = import.meta.env.VITE_APISPORTS_KEY;

const api = axios.create({
    baseURL: 'https://v3.football.api-sports.io',
    headers: {
        'x-apisports-key': API_KEY || ''
    }
});

export const buscarOddsJogo = async (jogoId) => {
    if (!jogoId || isNaN(jogoId)) return [];
    try {
        const response = await api.get(`/odds?fixture=${jogoId}`);
        if (response.data?.response?.length > 0) {
            const bookmakers = response.data.response[0].bookmakers;
            return bookmakers.map(b => {
                const oddHome = b.bets[0].values.find(v => v.value === 'Home');
                return { nome: b.name, oddCasa: oddHome ? parseFloat(oddHome.odd) : 1.85 };
            });
        }
        return [];
    } catch (error) {
        console.error("Erro nas Odds:", error.message);
        return [];
    }
};

export const buscarEscalacoes = async (jogoId) => {
    if (!jogoId || isNaN(jogoId)) return null;
    try {
        const response = await api.get(`/fixtures/lineups?fixture=${jogoId}`);
        if (response.data?.response?.length > 0) {
            const home = response.data.response[0];
            const away = response.data.response[1] || response.data.response[0];
            return {
                casa: { formacao: home.formation, titulares: home.startXI.map(p => p.player.name) },
                fora: { formacao: away.formation, titulares: away.startXI.map(p => p.player.name) }
            };
        }
        return null;
    } catch (error) {
        console.error("Erro nas Escalações:", error.message);
        return null;
    }
};

export const buscarEventos = async (jogoId) => {
    if (!jogoId || isNaN(jogoId)) return [];
    try {
        const response = await api.get(`/fixtures/events?fixture=${jogoId}`);
        if (response.data?.response?.length > 0) {
            return response.data.response.map(ev => ({
                tempo: ev.time.elapsed + "'",
                tipo: ev.type,
                time: ev.team.name,
                detalhe: ev.detail
            }));
        }
        return [];
    } catch (error) {
        console.error("Erro nos Eventos:", error.message);
        return [];
    }
};

// 🔥 NOVO: Motor de Estatísticas Avançadas (xG, Escanteios, Posse)
export const buscarEstatisticasAvancadas = async (jogoId) => {
  if (!jogoId || isNaN(jogoId)) return null;

  try {
    const { data } = await api.get(`/fixtures/statistics?fixture=${jogoId}`);
    const casa = data.response?.[0]?.statistics || [];
    const fora = data.response?.[1]?.statistics || [];

    const getStat = (stats, nome) => stats.find(s => s.type === nome)?.value || 0;

    return {
      xgCasa: getStat(casa, "expected_goals") || getStat(casa, "Expected Goals"),
      xgFora: getStat(fora, "expected_goals") || getStat(fora, "Expected Goals"),
      escanteiosCasa: getStat(casa, "Corner Kicks"),
      escanteiosFora: getStat(fora, "Corner Kicks"),
      chutesGolCasa: getStat(casa, "Shots on Goal"),
      chutesGolFora: getStat(fora, "Shots on Goal"),
      posseCasa: getStat(casa, "Ball Possession"),
      posseFora: getStat(fora, "Ball Possession"),
    };
  } catch (error) {
    console.error("Erro em estatísticas avançadas:", error.message);
    return null;
  }
};

// 🔥 Restauração da função da Copa do Mundo para o useCopa.js
export const buscarJogosCopa = async (leagueId = 1, season = 2026) => {
    try {
        const response = await api.get(`/fixtures?league=${leagueId}&season=${season}`);
        if (response.data && response.data.response) {
            return response.data.response;
        }
        return [];
    } catch (error) {
        console.error("Erro ao buscar jogos da Copa:", error.message);
        return [];
    }
};