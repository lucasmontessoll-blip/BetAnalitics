function valorNumero(v, padrao = null) {
  if (v === undefined || v === null || v === '') return padrao;
  if (typeof v === 'string' && v.includes('%')) {
    const n = Number(v.replace('%', '').replace(',', '.'));
    return Number.isFinite(n) ? n : padrao;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : padrao;
}

function textoStatus(short = '', long = '') {
  const s = String(short || '').toUpperCase();
  if (['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(s)) return 'Live';
  if (['FT', 'AET', 'PEN'].includes(s)) return 'Finished';
  if (['NS', 'TBD'].includes(s)) return 'Not Started';
  if (['PST', 'CANC', 'ABD', 'AWD', 'WO', 'SUSP'].includes(s)) return long || s;
  return long || s || 'Not Started';
}

export function statValor(stats = [], teamIndex = 0, nomes = []) {
  const bloco = Array.isArray(stats) ? stats[teamIndex] : null;
  const arr = bloco?.statistics || [];
  const alvos = nomes.map(t => String(t).toLowerCase());
  const item = arr.find(s => alvos.includes(String(s?.type || '').toLowerCase()));
  return item ? valorNumero(item.value, null) : null;
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
    league_flag: league.flag || '',
    season: league.season || null,
    round: league.round || '',
    starting_at: fixture.date || null,
    status: statusApp,
    status_short: status.short || '',
    status_long: status.long || '',
    time_elapsed: statusApp === 'Live' ? `${elapsed || 0}'` : '',
    venue: fixture.venue?.name || '',
    city: fixture.venue?.city || '',
    referee: fixture.referee || '',
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
    estatisticas: normalizarEstatisticas(stats),
    raw_api_football: item,
  };
}

export function normalizarEstatisticas(stats = []) {
  return {
    posseCasa: statValor(stats, 0, ['Ball Possession']),
    posseFora: statValor(stats, 1, ['Ball Possession']),
    chutesCasa: statValor(stats, 0, ['Total Shots', 'Shots total']),
    chutesFora: statValor(stats, 1, ['Total Shots', 'Shots total']),
    chutesGolCasa: statValor(stats, 0, ['Shots on Goal']),
    chutesGolFora: statValor(stats, 1, ['Shots on Goal']),
    chutesForaGolCasa: statValor(stats, 0, ['Shots off Goal']),
    chutesForaGolFora: statValor(stats, 1, ['Shots off Goal']),
    chutesBloqueadosCasa: statValor(stats, 0, ['Blocked Shots']),
    chutesBloqueadosFora: statValor(stats, 1, ['Blocked Shots']),
    chutesAreaCasa: statValor(stats, 0, ['Shots insidebox']),
    chutesAreaFora: statValor(stats, 1, ['Shots insidebox']),
    chutesForaAreaCasa: statValor(stats, 0, ['Shots outsidebox']),
    chutesForaAreaFora: statValor(stats, 1, ['Shots outsidebox']),
    escanteiosCasa: statValor(stats, 0, ['Corner Kicks']),
    escanteiosFora: statValor(stats, 1, ['Corner Kicks']),
    impedimentosCasa: statValor(stats, 0, ['Offsides']),
    impedimentosFora: statValor(stats, 1, ['Offsides']),
    faltasCasa: statValor(stats, 0, ['Fouls']),
    faltasFora: statValor(stats, 1, ['Fouls']),
    cartoesCasa: statValor(stats, 0, ['Yellow Cards']),
    cartoesFora: statValor(stats, 1, ['Yellow Cards']),
    vermelhosCasa: statValor(stats, 0, ['Red Cards']),
    vermelhosFora: statValor(stats, 1, ['Red Cards']),
    defesasCasa: statValor(stats, 0, ['Goalkeeper Saves']),
    defesasFora: statValor(stats, 1, ['Goalkeeper Saves']),
    passesCasa: statValor(stats, 0, ['Total passes']),
    passesFora: statValor(stats, 1, ['Total passes']),
    passesCertosCasa: statValor(stats, 0, ['Passes accurate']),
    passesCertosFora: statValor(stats, 1, ['Passes accurate']),
    passesPctCasa: statValor(stats, 0, ['Passes %']),
    passesPctFora: statValor(stats, 1, ['Passes %']),
  };
}

export function listaEstatisticasComparativas(stats = []) {
  const pares = [
    ['Shots on Goal', 'Chutes no gol'],
    ['Shots off Goal', 'Chutes para fora'],
    ['Total Shots', 'Total de chutes'],
    ['Blocked Shots', 'Chutes bloqueados'],
    ['Shots insidebox', 'Chutes dentro da area'],
    ['Shots outsidebox', 'Chutes fora da area'],
    ['Fouls', 'Faltas'],
    ['Corner Kicks', 'Escanteios'],
    ['Offsides', 'Impedimentos'],
    ['Ball Possession', 'Posse de bola'],
    ['Yellow Cards', 'Cartoes amarelos'],
    ['Red Cards', 'Cartoes vermelhos'],
    ['Goalkeeper Saves', 'Defesas do goleiro'],
    ['Total passes', 'Total de passes'],
    ['Passes accurate', 'Passes certos'],
    ['Passes %', 'Precisao dos passes'],
  ];

  return pares.map(([tipo, label]) => ({
    id: tipo,
    label,
    casa: statValor(stats, 0, [tipo]),
    fora: statValor(stats, 1, [tipo]),
  })).filter(s => s.casa !== null || s.fora !== null);
}

export function normalizarEvento(ev = {}) {
  return {
    id: `${ev?.time?.elapsed || 0}-${ev?.team?.id || ''}-${ev?.type || ''}-${ev?.player?.id || ''}-${ev?.detail || ''}`,
    minuto: ev?.time?.elapsed,
    extra: ev?.time?.extra,
    time: ev?.team?.name || '',
    timeLogo: ev?.team?.logo || '',
    player: ev?.player?.name || '',
    assist: ev?.assist?.name || '',
    tipo: ev?.type || '',
    detalhe: ev?.detail || '',
    comentarios: ev?.comments || '',
  };
}

export function eventoIcone(tipo = '', detalhe = '') {
  const t = `${tipo} ${detalhe}`.toLowerCase();
  if (t.includes('goal')) return '';
  if (t.includes('yellow')) return '';
  if (t.includes('red')) return '';
  if (t.includes('subst')) return '';
  if (t.includes('var')) return '';
  if (t.includes('penalty')) return '';
  return '•';
}
