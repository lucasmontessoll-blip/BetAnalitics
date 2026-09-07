import {
  buscarDetalhesJogoApiFootball,
  buscarJogosTemporadaApiFootball,
} from './apiFootballClient.js';

export const buscarOddsJogo = async (jogoId) => {
  if (!jogoId || isNaN(jogoId)) return [];

  try {
    const data = await buscarDetalhesJogoApiFootball(jogoId);
    const resposta = Array.isArray(data?.odds) ? data.odds : [];

    if (!resposta.length) return [];

    const bookmakers = resposta[0]?.bookmakers || [];

    return bookmakers.map((bookmaker) => {
      const mercado = bookmaker?.bets?.[0]?.values || [];
      const oddHome = mercado.find((valor) => valor.value === 'Home');

      return {
        nome: bookmaker?.name || '',
        oddCasa: oddHome ? parseFloat(oddHome.odd) : 1.85,
      };
    });
  } catch (error) {
    console.error('Erro nas Odds:', error?.message || error);
    return [];
  }
};

export const buscarEscalacoes = async (jogoId) => {
  if (!jogoId || isNaN(jogoId)) return null;

  try {
    const data = await buscarDetalhesJogoApiFootball(jogoId);
    const resposta = Array.isArray(data?.lineups) ? data.lineups : [];

    if (!resposta.length) return null;

    const home = resposta[0];
    const away = resposta[1] || resposta[0];

    return {
      casa: {
        formacao: home?.formation || '',
        titulares: (home?.startXI || []).map((p) => p?.player?.name).filter(Boolean),
      },
      fora: {
        formacao: away?.formation || '',
        titulares: (away?.startXI || []).map((p) => p?.player?.name).filter(Boolean),
      },
    };
  } catch (error) {
    console.error('Erro nas Escalacoes:', error?.message || error);
    return null;
  }
};

export const buscarEventos = async (jogoId) => {
  if (!jogoId || isNaN(jogoId)) return [];

  try {
    const data = await buscarDetalhesJogoApiFootball(jogoId);
    const resposta = Array.isArray(data?.events) ? data.events : [];

    return resposta.map((ev) => ({
      tempo: `${ev?.time?.elapsed || 0}'`,
      tipo: ev?.type || '',
      time: ev?.team?.name || '',
      detalhe: ev?.detail || '',
    }));
  } catch (error) {
    console.error('Erro nos Eventos:', error?.message || error);
    return [];
  }
};

export const buscarEstatisticasAvancadas = async (jogoId) => {
  if (!jogoId || isNaN(jogoId)) return null;

  try {
    const data = await buscarDetalhesJogoApiFootball(jogoId);
    const resposta = Array.isArray(data?.statistics) ? data.statistics : [];

    const casa = resposta?.[0]?.statistics || [];
    const fora = resposta?.[1]?.statistics || [];

    const getStat = (stats, nome) =>
      stats.find((s) => s.type === nome)?.value || 0;

    return {
      xgCasa: getStat(casa, 'expected_goals') || getStat(casa, 'Expected Goals'),
      xgFora: getStat(fora, 'expected_goals') || getStat(fora, 'Expected Goals'),
      escanteiosCasa: getStat(casa, 'Corner Kicks'),
      escanteiosFora: getStat(fora, 'Corner Kicks'),
      chutesGolCasa: getStat(casa, 'Shots on Goal'),
      chutesGolFora: getStat(fora, 'Shots on Goal'),
      posseCasa: getStat(casa, 'Ball Possession'),
      posseFora: getStat(fora, 'Ball Possession'),
    };
  } catch (error) {
    console.error('Erro em estatisticas avancadas:', error?.message || error);
    return null;
  }
};

export const buscarJogosCopa = async (leagueId = 1, season = 2026) => {
  try {
    return await buscarJogosTemporadaApiFootball({
      leagueId,
      season,
    });
  } catch (error) {
    console.error('Erro ao buscar jogos da Copa:', error?.message || error);
    return [];
  }
};
