/* BET_ETAPA_32A_MATCH_UTILS */
export function pick(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

export function text(...values) {
  const value = pick(...values);
  if (value === undefined || value === null || typeof value === 'object') return '';
  return String(value);
}

export function numberValue(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(String(value).replace('%', '').replace(',', '.').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function nullableNumber(value) {
  if (value === undefined || value === null || value === '' || value === '-') return null;
  const parsed = Number(String(value).replace('%', '').replace(',', '.').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function homeName(jogo = {}) {
  return text(
    jogo.home_team,
    jogo.time_casa,
    jogo.homeTeam,
    jogo.mandante,
    jogo.casa,
    jogo.teams?.home?.name,
    jogo.teams?.home?.team?.name,
    jogo.equipes?.casa?.nome,
    'Mandante'
  );
}

export function awayName(jogo = {}) {
  return text(
    jogo.away_team,
    jogo.time_fora,
    jogo.awayTeam,
    jogo.visitante,
    jogo.fora,
    jogo.teams?.away?.name,
    jogo.teams?.away?.team?.name,
    jogo.equipes?.fora?.nome,
    'Visitante'
  );
}

export function homeLogo(jogo = {}) {
  return pick(
    jogo.home_image,
    jogo.logo_casa,
    jogo.homeLogo,
    jogo.logoHome,
    jogo.teams?.home?.logo,
    jogo.teams?.home?.team?.logo,
    jogo.equipes?.casa?.logo
  );
}

export function awayLogo(jogo = {}) {
  return pick(
    jogo.away_image,
    jogo.logo_fora,
    jogo.awayLogo,
    jogo.logoAway,
    jogo.teams?.away?.logo,
    jogo.teams?.away?.team?.logo,
    jogo.equipes?.fora?.logo
  );
}

export function leagueName(jogo = {}) {
  return text(
    jogo.league_name,
    jogo.liga,
    jogo.campeonato,
    jogo.league?.name,
    jogo.league?.league?.name,
    jogo.competition?.name,
    'Outros jogos'
  );
}

export function leagueCountry(jogo = {}) {
  return text(
    jogo.league_country,
    jogo.country_name,
    typeof jogo.country === 'string' ? jogo.country : '',
    jogo.country?.name,
    jogo.area?.name,
    'Internacional'
  );
}

export function leagueLogo(jogo = {}) {
  return pick(
    jogo.league_logo,
    jogo.league_image,
    jogo.logo_liga,
    jogo.league?.logo,
    jogo.league?.league?.logo
  );
}

export function matchId(jogo = {}, index = 0) {
  return text(
    jogo.id,
    jogo.id_jogo,
    jogo.fixture?.id,
    `${homeName(jogo)}-${awayName(jogo)}-${index}`
  );
}

export function statusText(jogo = {}) {
  return text(
    jogo.status,
    jogo.status_short,
    jogo.status_jogo,
    jogo.fixture?.status?.short,
    jogo.fixture?.status?.long,
    jogo.situacao
  );
}

export function normalizedStatus(jogo = {}) {
  return statusText(jogo).toLowerCase().trim();
}

export function elapsedText(jogo = {}) {
  const raw = pick(
    jogo.time_elapsed,
    jogo.tempo_jogo,
    jogo.tempo,
    jogo.minuto,
    jogo.fixture?.status?.elapsed
  );

  if (raw === undefined || raw === null || raw === '') return '';
  const value = String(raw).trim();
  const numeric = value.match(/\d{1,3}/)?.[0];
  return numeric ? `${numeric}'` : value.toUpperCase();
}

export function isFinished(jogo = {}) {
  const status = normalizedStatus(jogo);
  return (
    status === 'ft' ||
    status === 'aet' ||
    status === 'pen' ||
    status.includes('finished') ||
    status.includes('finalizado') ||
    status.includes('encerrado') ||
    status.includes('fim de jogo')
  );
}

export function isLive(jogo = {}) {
  if (isFinished(jogo)) return false;

  const status = normalizedStatus(jogo);
  const elapsed = elapsedText(jogo).toLowerCase();

  return (
    status === 'live' ||
    status === '1h' ||
    status === '2h' ||
    status === 'ht' ||
    status.includes('ao vivo') ||
    status.includes('in play') ||
    status.includes('intervalo') ||
    /^\d{1,3}'?$/.test(elapsed)
  );
}

export function isPreMatch(jogo = {}) {
  if (isLive(jogo) || isFinished(jogo)) return false;

  const status = normalizedStatus(jogo);
  const date = matchDate(jogo);

  return (
    status === '' ||
    status === 'ns' ||
    status === 'tbd' ||
    status === 'scheduled' ||
    status.includes('not started') ||
    status.includes('nao iniciado') ||
    status.includes('não iniciado') ||
    status.includes('agendado') ||
    status.includes('pre-game') ||
    status.includes('pré-jogo') ||
    Boolean(date)
  );
}

export function matchDate(jogo = {}) {
  const raw = pick(
    jogo.starting_at,
    jogo.data_hora,
    jogo.dataHora,
    jogo.fixture?.date,
    jogo.date,
    jogo.data,
    jogo.inicio,
    jogo.horario
  );

  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dateKey(jogo = {}) {
  const date = matchDate(jogo);
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function timeLabel(jogo = {}) {
  const date = matchDate(jogo);
  if (date) {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const raw = text(jogo.horario, jogo.time);
  return raw.match(/\b\d{1,2}:\d{2}\b/)?.[0] || '--:--';
}

export function dateTimeLabel(jogo = {}) {
  const date = matchDate(jogo);
  if (!date) return timeLabel(jogo);

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function homeScore(jogo = {}) {
  return pick(
    jogo.scoreHome,
    jogo.home_score,
    jogo.placar_casa,
    jogo.score_home,
    jogo.gols_casa,
    jogo.goals?.home,
    jogo.score?.fulltime?.home
  );
}

export function awayScore(jogo = {}) {
  return pick(
    jogo.scoreAway,
    jogo.away_score,
    jogo.placar_fora,
    jogo.score_away,
    jogo.gols_fora,
    jogo.goals?.away,
    jogo.score?.fulltime?.away
  );
}

export function confidence(jogo = {}) {
  return clamp(numberValue(pick(jogo.confianca_ia, jogo.confiancaIA, jogo.confianca, jogo.ia?.confianca), 0), 0, 100);
}

export function mainOdd(jogo = {}) {
  return nullableNumber(pick(jogo.odd_principal, jogo.odd, jogo.odds?.principal, jogo.odds?.home));
}

export function odds(jogo = {}) {
  return {
    home: nullableNumber(pick(jogo.odds?.home, jogo.odd_casa, jogo.oddHome, jogo.odd_principal, jogo.odd)),
    draw: nullableNumber(pick(jogo.odds?.draw, jogo.odd_empate, jogo.oddDraw)),
    away: nullableNumber(pick(jogo.odds?.away, jogo.odd_fora, jogo.oddAway))
  };
}

export function probabilities(jogo = {}) {
  const source = pick(jogo.probabilidades, jogo.probabilities, jogo.ia?.probabilidades, {});
  return {
    home: clamp(numberValue(pick(source?.casa, source?.home, jogo.prob_casa), 0), 0, 100),
    draw: clamp(numberValue(pick(source?.empate, source?.draw, jogo.prob_empate), 0), 0, 100),
    away: clamp(numberValue(pick(source?.fora, source?.away, jogo.prob_fora), 0), 0, 100)
  };
}

export function normalizeMatch(jogo = {}, index = 0) {
  const home = homeName(jogo);
  const away = awayName(jogo);
  const id = matchId(jogo, index);

  return {
    ...jogo,
    id,
    home_team: home,
    time_casa: text(jogo.time_casa, home),
    homeTeam: text(jogo.homeTeam, home),
    mandante: text(jogo.mandante, home),
    away_team: away,
    time_fora: text(jogo.time_fora, away),
    awayTeam: text(jogo.awayTeam, away),
    visitante: text(jogo.visitante, away),
    home_image: pick(jogo.home_image, homeLogo(jogo)),
    logo_casa: pick(jogo.logo_casa, homeLogo(jogo)),
    away_image: pick(jogo.away_image, awayLogo(jogo)),
    logo_fora: pick(jogo.logo_fora, awayLogo(jogo)),
    scoreHome: homeScore(jogo),
    placar_casa: homeScore(jogo),
    scoreAway: awayScore(jogo),
    placar_fora: awayScore(jogo),
    league_name: leagueName(jogo),
    liga: text(jogo.liga, leagueName(jogo)),
    league_country: leagueCountry(jogo),
    status: text(jogo.status, jogo.fixture?.status?.short),
    time_elapsed: pick(jogo.time_elapsed, elapsedText(jogo)),
    confianca_ia: confidence(jogo),
    odd_principal: mainOdd(jogo)
  };
}

export function groupByLeague(jogos = []) {
  return jogos.reduce((groups, jogo) => {
    const key = leagueName(jogo);
    if (!groups[key]) groups[key] = [];
    groups[key].push(jogo);
    return groups;
  }, {});
}

export function favoriteContains(favoritos = [], id) {
  return favoritos.some((item) => {
    if (item && typeof item === 'object') {
      return String(pick(item.id, item.id_jogo, item.fixture?.id)) === String(id);
    }
    return String(item) === String(id);
  });
}

export function initials(name = '') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function teamPerformance(jogo = {}) {
  const stats = pick(jogo.estatisticas, jogo.stats, jogo.statistics, {}) || {};
  const scoreHome = numberValue(homeScore(jogo), 0);
  const scoreAway = numberValue(awayScore(jogo), 0);

  function share(home, away, fallback = 50) {
    const h = nullableNumber(home);
    const a = nullableNumber(away);

    if (h === null && a === null) return { home: fallback, away: 100 - fallback };
    if (h !== null && a === null) return { home: clamp(h, 0, 100), away: clamp(100 - h, 0, 100) };
    if (h === null && a !== null) return { home: clamp(100 - a, 0, 100), away: clamp(a, 0, 100) };

    const total = Math.max(h + a, 0.001);
    return {
      home: clamp((h / total) * 100, 0, 100),
      away: clamp((a / total) * 100, 0, 100)
    };
  }

  const possession = share(
    pick(stats.posseCasa, stats.posse_casa, stats.home?.possession, stats.casa?.posse, jogo.posse_casa),
    pick(stats.posseFora, stats.posse_fora, stats.away?.possession, stats.fora?.posse, jogo.posse_fora)
  );

  const shots = share(
    pick(stats.chutesCasa, stats.chutes_casa, stats.home?.shots, stats.casa?.chutes, jogo.chutes_casa),
    pick(stats.chutesFora, stats.chutes_fora, stats.away?.shots, stats.fora?.chutes, jogo.chutes_fora)
  );

  const onTarget = share(
    pick(stats.chutesNoAlvoCasa, stats.chutes_no_alvo_casa, stats.home?.shotsOnGoal, jogo.chutes_no_alvo_casa),
    pick(stats.chutesNoAlvoFora, stats.chutes_no_alvo_fora, stats.away?.shotsOnGoal, jogo.chutes_no_alvo_fora),
    shots.home
  );

  const resultHome = scoreHome > scoreAway ? 96 : scoreHome === scoreAway ? 72 : 48;
  const resultAway = scoreAway > scoreHome ? 96 : scoreHome === scoreAway ? 72 : 48;

  return {
    home: clamp(Math.round(resultHome * 0.48 + possession.home * 0.18 + shots.home * 0.17 + onTarget.home * 0.17), 35, 98),
    away: clamp(Math.round(resultAway * 0.48 + possession.away * 0.18 + shots.away * 0.17 + onTarget.away * 0.17), 35, 98),
    possession,
    shots: {
      home: nullableNumber(pick(stats.chutesCasa, stats.chutes_casa, stats.home?.shots, jogo.chutes_casa)),
      away: nullableNumber(pick(stats.chutesFora, stats.chutes_fora, stats.away?.shots, jogo.chutes_fora))
    },
    onTarget: {
      home: nullableNumber(pick(stats.chutesNoAlvoCasa, stats.chutes_no_alvo_casa, stats.home?.shotsOnGoal, jogo.chutes_no_alvo_casa)),
      away: nullableNumber(pick(stats.chutesNoAlvoFora, stats.chutes_no_alvo_fora, stats.away?.shotsOnGoal, jogo.chutes_no_alvo_fora))
    },
    corners: {
      home: nullableNumber(pick(stats.escanteiosCasa, stats.cantos_casa, stats.home?.corners, jogo.cantos_casa)),
      away: nullableNumber(pick(stats.escanteiosFora, stats.cantos_fora, stats.away?.corners, jogo.cantos_fora))
    }
  };
}
