function valorNumero(v, padrao = null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : padrao;
}

function textoStatus(short = '', long = '') {
  const s = String(short || '').toUpperCase();
  if (['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(s)) return 'Live';
  if (['FT', 'AET', 'PEN'].includes(s)) return 'Finished';
  if (['NS', 'TBD'].includes(s)) return 'Not Started';
  if (['PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(s)) return long || s;
  return long || s || 'Not Started';
}

function statPorTipo(stats = [], timeIndex = 0, tipos = []) {
  const bloco = Array.isArray(stats) ? stats[timeIndex] : null;
  const arr = bloco?.statistics || [];
  const nomes = tipos.map(t => String(t).toLowerCase());
  const item = arr.find(s => nomes.includes(String(s?.type || '').toLowerCase()));
  if (!item) return null;
  if (typeof item.value === 'string' && item.value.includes('%')) return valorNumero(item.value.replace('%', ''), null);
  return valorNumero(item.value, null);
}

function extrairOddPrincipal(odds = null) {
  const bookmakers = odds?.bookmakers || odds?.[0]?.bookmakers || [];
  for (const book of bookmakers) {
    const bets = book?.bets || [];
    const matchWinner = bets.find(b => /match winner|1x2|winner/i.test(String(b?.name || '')));
    if (!matchWinner) continue;
    const values = matchWinner.values || [];
    const home = values.find(v => /home|1$/i.test(String(v?.value || '')))?.odd;
    const draw = values.find(v => /draw|x/i.test(String(v?.value || '')))?.odd;
    const away = values.find(v => /away|2$/i.test(String(v?.value || '')))?.odd;
    return {
      odd_casa: valorNumero(home, null),
      odd_empate: valorNumero(draw, null),
      odd_fora: valorNumero(away, null),
      odd_principal: valorNumero(home, null) || valorNumero(away, null) || valorNumero(draw, null) || 1.85,
      bookmaker: book?.name || null,
    };
  }
  return { odd_casa: null, odd_empate: null, odd_fora: null, odd_principal: 1.85, bookmaker: null };
}

export function mapApiFootballFixtureToJogo(item = {}) {
  const fixture = item.fixture || {};
  const league = item.league || {};
  const teams = item.teams || {};
  const goals = item.goals || {};
  const status = fixture.status || {};
  const odds = extrairOddPrincipal(item.odds || item.odds_api || null);
  const stats = item.statistics || item.estatisticas_api || [];

  const scoreHome = valorNumero(goals.home, 0);
  const scoreAway = valorNumero(goals.away, 0);
  const statusApp = textoStatus(status.short, status.long);
  const elapsed = valorNumero(status.elapsed, 0);

  return {
    id: `api-football-${fixture.id}`,
    api_football_id: fixture.id,
    fonte_dados: 'api-football',
    league_id: league.id,
    league_name: league.name || 'API-Football',
    league_country: league.country || '',
    league_logo: league.logo || '',
    season: league.season || null,
    round: league.round || '',
    starting_at: fixture.date || null,
    status: statusApp,
    status_short: status.short || '',
    time_elapsed: statusApp === 'Live' ? `${elapsed || 0}'` : '',
    venue: fixture.venue?.name || '',
    city: fixture.venue?.city || '',
    home_team: teams.home?.name || 'Mandante',
    away_team: teams.away?.name || 'Visitante',
    home_id: teams.home?.id || null,
    away_id: teams.away?.id || null,
    home_image: teams.home?.logo || '',
    away_image: teams.away?.logo || '',
    scoreHome,
    scoreAway,
    placar_casa: scoreHome,
    placar_fora: scoreAway,
    confianca_ia: 88,
    odd_principal: odds.odd_principal,
    odd_casa: odds.odd_casa,
    odd_empate: odds.odd_empate,
    odd_fora: odds.odd_fora,
    bookmaker: odds.bookmaker,
    odds: {
      home: odds.odd_casa,
      draw: odds.odd_empate,
      away: odds.odd_fora,
    },
    estatisticas: {
      posseCasa: statPorTipo(stats, 0, ['Ball Possession']),
      posseFora: statPorTipo(stats, 1, ['Ball Possession']),
      chutesCasa: statPorTipo(stats, 0, ['Total Shots', 'Shots total']),
      chutesFora: statPorTipo(stats, 1, ['Total Shots', 'Shots total']),
      chutesGolCasa: statPorTipo(stats, 0, ['Shots on Goal']),
      chutesGolFora: statPorTipo(stats, 1, ['Shots on Goal']),
      escanteiosCasa: statPorTipo(stats, 0, ['Corner Kicks']),
      escanteiosFora: statPorTipo(stats, 1, ['Corner Kicks']),
      cartoesCasa: statPorTipo(stats, 0, ['Yellow Cards']),
      cartoesFora: statPorTipo(stats, 1, ['Yellow Cards']),
      faltasCasa: statPorTipo(stats, 0, ['Fouls']),
      faltasFora: statPorTipo(stats, 1, ['Fouls']),
    },
    raw_api_football: item,
  };
}
