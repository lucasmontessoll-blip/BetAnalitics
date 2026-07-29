import React from 'react';

const COR_CASA = '#2563eb';
const COR_FORA = '#ef4444';

function pick(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function numberValue(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;

  const normalized = String(value)
    .replace('%', '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeKey(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function teamName(team, fallback) {
  return String(pick(team?.name, team?.nome, fallback));
}

function teamLogo(team) {
  return pick(team?.logo, team?.image, team?.escudo, team?.team?.logo);
}

function initials(name = '') {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function TeamBadge({ team, fallback, side }) {
  const name = teamName(team, fallback);
  const logo = teamLogo(team);
  const [failed, setFailed] = React.useState(false);

  return (
    <div className="flex min-w-0 items-center gap-2">
      {logo && !failed ? (
        <img
          src={logo}
          alt={name}
          onError={() => setFailed(true)}
          className="h-7 w-7 shrink-0 object-contain"
        />
      ) : (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[9px] font-black"
          style={{
            borderColor: side === 'home' ? `${COR_CASA}88` : `${COR_FORA}88`,
            background: side === 'home' ? `${COR_CASA}22` : `${COR_FORA}22`,
            color: side === 'home' ? '#93c5fd' : '#fca5a5'
          }}
        >
          {initials(name)}
        </div>
      )}
      <span className="truncate text-[11px] font-black text-white/80">{name}</span>
    </div>
  );
}

function sourceForPeriod(jogo, period) {
  if (period === 'all') return { jogo, available: true };

  const firstKeys = ['first', 'first_half', 'primeiro', '1', '1h'];
  const secondKeys = ['second', 'second_half', 'segundo', '2', '2h'];
  const wanted = period === 'first' ? firstKeys : secondKeys;

  const containers = [
    jogo?.estatisticas_periodos,
    jogo?.statistics_by_period,
    jogo?.stats_by_period,
    jogo?.period_stats,
    jogo?.periodos,
    jogo?.periods
  ].filter(Boolean);

  for (const container of containers) {
    for (const key of wanted) {
      if (container?.[key]) {
        return {
          jogo: {
            ...jogo,
            estatisticas: container[key],
            statistics: container[key],
            stats: container[key]
          },
          available: true
        };
      }
    }
  }

  return { jogo, available: false };
}

function arrayStatsToMap(source, sideIndex) {
  if (!Array.isArray(source)) return {};

  const block = source[sideIndex] || {};
  const list = pick(block.statistics, block.stats, block.estatisticas, []);
  const map = {};

  if (Array.isArray(list)) {
    for (const item of list) {
      const key = normalizeKey(pick(item?.type, item?.name, item?.nome, item?.label));
      if (!key) continue;
      map[key] = pick(item?.value, item?.valor, item?.total);
    }
  }

  return map;
}

function objectStatsToMap(source, side) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return {};

  const nested = pick(
    side === 'home' ? source.home : source.away,
    side === 'home' ? source.casa : source.fora,
    side === 'home' ? source.mandante : source.visitante,
    {}
  );

  const map = {};

  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    for (const [key, value] of Object.entries(nested)) {
      map[normalizeKey(key)] = value;
    }
  }

  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'object') continue;
    map[normalizeKey(key)] = value;
  }

  return map;
}

function findMapValue(map, aliases) {
  for (const alias of aliases) {
    const wanted = normalizeKey(alias);
    if (Object.prototype.hasOwnProperty.call(map, wanted)) return map[wanted];
  }

  for (const [key, value] of Object.entries(map)) {
    if (aliases.some((alias) => key.includes(normalizeKey(alias)))) return value;
  }

  return undefined;
}

function getFlatValue(jogo, side, aliases) {
  const suffixes = side === 'home'
    ? ['casa', 'home', 'mandante', 'local']
    : ['fora', 'away', 'visitante'];

  const prefixes = side === 'home'
    ? ['casa', 'home', 'mandante', 'local']
    : ['fora', 'away', 'visitante'];

  const candidates = [];

  for (const alias of aliases) {
    const base = normalizeKey(alias).replace(/ /g, '_');
    for (const suffix of suffixes) candidates.push(`${base}_${suffix}`);
    for (const prefix of prefixes) candidates.push(`${prefix}_${base}`);
  }

  for (const key of candidates) {
    if (jogo?.[key] !== undefined) return jogo[key];
    if (jogo?.estatisticas?.[key] !== undefined) return jogo.estatisticas[key];
    if (jogo?.stats?.[key] !== undefined) return jogo.stats[key];
  }

  return undefined;
}

function metricValue(jogo, side, aliases, fallback) {
  const source = pick(jogo?.estatisticas, jogo?.stats, jogo?.statistics, {});
  const sideIndex = side === 'home' ? 0 : 1;
  const arrayMap = arrayStatsToMap(source, sideIndex);
  const objectMap = objectStatsToMap(source, side);

  const direct = getFlatValue(jogo, side, aliases);
  const fromArray = findMapValue(arrayMap, aliases);
  const fromObject = findMapValue(objectMap, aliases);

  return numberValue(pick(direct, fromArray, fromObject), fallback);
}

function hasRealStatistics(jogo) {
  const source = pick(jogo?.estatisticas, jogo?.stats, jogo?.statistics);
  if (Array.isArray(source)) return source.length > 0;
  if (source && typeof source === 'object') return Object.keys(source).length > 0;
  return false;
}

function demoStats(jogo) {
  const confidence = clamp(numberValue(pick(jogo?.confianca_ia, jogo?.confiancaIA), 86), 30, 98);
  const homeScore = numberValue(pick(jogo?.placar_casa, jogo?.scoreHome, jogo?.goals?.home), 1);
  const awayScore = numberValue(pick(jogo?.placar_fora, jogo?.scoreAway, jogo?.goals?.away), 0);
  const tilt = clamp(Math.round((confidence - 50) / 10) + (homeScore - awayScore), -4, 6);

  return {
    home: {
      possession: clamp(50 + tilt, 38, 67),
      xg: clamp(1.05 + tilt * 0.09 + homeScore * 0.18, 0.3, 3.6),
      bigChances: clamp(2 + Math.max(0, tilt > 1 ? 1 : 0), 0, 7),
      shots: clamp(11 + tilt, 4, 25),
      shotsOnGoal: clamp(4 + Math.round(tilt / 2), 1, 13),
      blockedShots: clamp(3 + Math.max(0, tilt < 0 ? 1 : 0), 0, 9),
      shotsInside: clamp(7 + tilt, 2, 18),
      shotsOutside: clamp(4, 1, 10),
      corners: clamp(4 + Math.round(tilt / 2), 0, 12),
      fouls: 13,
      saves: 3,
      offsides: 2,
      passes: clamp(385 + tilt * 18, 220, 690),
      accuratePasses: clamp(326 + tilt * 16, 160, 610),
      passAccuracy: clamp(83 + Math.round(tilt / 2), 65, 94),
      yellowCards: 2,
      redCards: 0,
      attacks: clamp(96 + tilt * 4, 55, 145),
      dangerousAttacks: clamp(42 + tilt * 3, 20, 85),
      touchesBox: clamp(18 + tilt, 6, 36),
      finalThird: clamp(56 + tilt * 2, 25, 100),
      longBallsMade: 27,
      longBallsAttempted: 54,
      crossesMade: 5,
      crossesAttempted: 18,
      duelsWon: clamp(48 + tilt, 28, 78),
      duelsTotal: 92,
      aerialWon: 13,
      aerialTotal: 25,
      groundWon: 35,
      groundTotal: 67,
      dribblesMade: 8,
      dribblesAttempted: 14,
      possessionLost: 91,
      tackles: 13,
      interceptions: 8,
      recoveries: 43,
      clearances: 22,
      errorsShot: 0,
      goalKicks: 7,
      punches: 1,
      highClaims: 2
    },
    away: {
      possession: clamp(50 - tilt, 33, 62),
      xg: clamp(0.88 - tilt * 0.05 + awayScore * 0.2, 0.2, 3.3),
      bigChances: 1,
      shots: clamp(10 - Math.round(tilt / 2), 3, 22),
      shotsOnGoal: clamp(3 - Math.round(tilt / 3), 1, 11),
      blockedShots: 4,
      shotsInside: 6,
      shotsOutside: 4,
      corners: 4,
      fouls: 15,
      saves: 4,
      offsides: 3,
      passes: clamp(355 - tilt * 12, 190, 620),
      accuratePasses: clamp(286 - tilt * 10, 130, 540),
      passAccuracy: clamp(79 - Math.round(tilt / 3), 62, 92),
      yellowCards: 3,
      redCards: 0,
      attacks: clamp(88 - tilt * 2, 48, 135),
      dangerousAttacks: clamp(38 - tilt, 18, 75),
      touchesBox: clamp(14 - Math.round(tilt / 2), 5, 31),
      finalThird: clamp(49 - tilt, 20, 90),
      longBallsMade: 22,
      longBallsAttempted: 52,
      crossesMade: 6,
      crossesAttempted: 21,
      duelsWon: clamp(44 - tilt, 25, 72),
      duelsTotal: 92,
      aerialWon: 12,
      aerialTotal: 25,
      groundWon: 32,
      groundTotal: 67,
      dribblesMade: 5,
      dribblesAttempted: 13,
      possessionLost: 96,
      tackles: 15,
      interceptions: 7,
      recoveries: 39,
      clearances: 25,
      errorsShot: 1,
      goalKicks: 9,
      punches: 0,
      highClaims: 1
    }
  };
}

const METRICS = {
  possession: ['Ball Possession', 'Possession', 'Posse de bola', 'Posse'],
  xg: ['Expected Goals', 'expected_goals', 'Gols esperados', 'xG'],
  bigChances: ['Big Chances', 'Grandes chances'],
  shots: ['Total Shots', 'Shots', 'Total de chutes', 'Chutes'],
  shotsOnGoal: ['Shots on Goal', 'Shots on Target', 'Chutes no alvo'],
  blockedShots: ['Blocked Shots', 'Chutes bloqueados'],
  shotsInside: ['Shots insidebox', 'Shots inside box', 'Chutes dentro da área'],
  shotsOutside: ['Shots outsidebox', 'Shots outside box', 'Chutes fora da área'],
  corners: ['Corner Kicks', 'Corners', 'Escanteios'],
  fouls: ['Fouls', 'Faltas'],
  saves: ['Goalkeeper Saves', 'Saves', 'Defesas do goleiro', 'Defesas'],
  offsides: ['Offsides', 'Impedimentos'],
  passes: ['Total passes', 'Passes', 'Total de passes'],
  accuratePasses: ['Passes accurate', 'Accurate passes', 'Passes certos'],
  passAccuracy: ['Passes %', 'Pass accuracy', 'Precisão de passes'],
  yellowCards: ['Yellow Cards', 'Cartões amarelos', 'Amarelos'],
  redCards: ['Red Cards', 'Cartões vermelhos', 'Vermelhos'],
  attacks: ['Attacks', 'Ataques'],
  dangerousAttacks: ['Dangerous Attacks', 'Ataques perigosos'],
  touchesBox: ['Touches in opposition box', 'Touches in box', 'Toques na área'],
  finalThird: ['Final third entries', 'Entradas no último terço'],
  longBallsMade: ['Accurate long balls', 'Lançamentos longos certos'],
  longBallsAttempted: ['Long balls', 'Lançamentos longos'],
  crossesMade: ['Accurate crosses', 'Cruzamentos certos'],
  crossesAttempted: ['Crosses', 'Cruzamentos'],
  duelsWon: ['Duels won', 'Duelos vencidos'],
  duelsTotal: ['Duels', 'Duelos'],
  aerialWon: ['Aerial duels won', 'Duelos aéreos vencidos'],
  aerialTotal: ['Aerial duels', 'Duelos aéreos'],
  groundWon: ['Ground duels won', 'Duelos no chão vencidos'],
  groundTotal: ['Ground duels', 'Duelos no chão'],
  dribblesMade: ['Dribbles successful', 'Dribles certos'],
  dribblesAttempted: ['Dribbles attempted', 'Dribles tentados'],
  possessionLost: ['Possession lost', 'Posse perdida'],
  tackles: ['Tackles', 'Desarmes'],
  interceptions: ['Interceptions', 'Interceptações'],
  recoveries: ['Ball recoveries', 'Recoveries', 'Recuperações'],
  clearances: ['Clearances', 'Cortes', 'Rebotes'],
  errorsShot: ['Errors leading to shot', 'Erros que levaram a chute'],
  goalKicks: ['Goal Kicks', 'Tiros de meta'],
  punches: ['Punches', 'Socos'],
  highClaims: ['High Claims', 'Saídas pelo alto']
};

function buildStats(jogo) {
  const demo = demoStats(jogo);
  const real = hasRealStatistics(jogo);
  const result = { home: {}, away: {} };

  for (const [key, aliases] of Object.entries(METRICS)) {
    result.home[key] = metricValue(jogo, 'home', aliases, demo.home[key]);
    result.away[key] = metricValue(jogo, 'away', aliases, demo.away[key]);
  }

  if (!result.home.passAccuracy && result.home.passes) {
    result.home.passAccuracy = Math.round((result.home.accuratePasses / result.home.passes) * 100);
  }
  if (!result.away.passAccuracy && result.away.passes) {
    result.away.passAccuracy = Math.round((result.away.accuratePasses / result.away.passes) * 100);
  }

  return { ...result, real };
}

function valueText(value, format) {
  if (value === null || value === undefined) return '—';
  if (format === 'percent') return `${Math.round(value)}%`;
  if (format === 'decimal') return Number(value).toFixed(2);
  return Number.isInteger(value) ? String(value) : Number(value).toFixed(1);
}

function CompareBar({ home, away, format = 'number' }) {
  const h = numberValue(home, 0);
  const a = numberValue(away, 0);
  const total = h + a;
  const hPct = total > 0 ? (h / total) * 100 : 50;
  const aPct = total > 0 ? (a / total) * 100 : 50;

  return (
    <div className="grid grid-cols-[1fr_2px_1fr] gap-0 overflow-hidden rounded-full bg-white/[0.06]">
      <div className="flex h-1.5 justify-end bg-white/[0.03]">
        <div className="h-full rounded-l-full" style={{ width: `${hPct}%`, background: COR_CASA }} />
      </div>
      <div className="bg-white/30" />
      <div className="h-1.5 bg-white/[0.03]">
        <div className="h-full rounded-r-full" style={{ width: `${aPct}%`, background: COR_FORA }} />
      </div>
    </div>
  );
}

function MetricRow({ label, home, away, format = 'number', hint }) {
  const homeWins = numberValue(home, 0) > numberValue(away, 0);
  const awayWins = numberValue(away, 0) > numberValue(home, 0);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-3">
      <div className="grid grid-cols-[60px_1fr_60px] items-center gap-2">
        <span
          className={`justify-self-start rounded-full border px-2.5 py-1 text-xs font-black ${homeWins ? 'text-white' : 'text-white/75'}`}
          style={{ borderColor: `${COR_CASA}99`, background: homeWins ? `${COR_CASA}55` : `${COR_CASA}22` }}
        >
          {valueText(home, format)}
        </span>

        <div className="min-w-0 text-center">
          <p className="truncate text-[11px] font-black text-white/90">{label}</p>
          {hint ? <p className="mt-0.5 truncate text-[9px] font-semibold text-white/35">{hint}</p> : null}
        </div>

        <span
          className={`justify-self-end rounded-full border px-2.5 py-1 text-xs font-black ${awayWins ? 'text-white' : 'text-white/75'}`}
          style={{ borderColor: `${COR_FORA}99`, background: awayWins ? `${COR_FORA}55` : `${COR_FORA}22` }}
        >
          {valueText(away, format)}
        </span>
      </div>

      <div className="mt-2.5">
        <CompareBar home={home} away={away} />
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, badge }) {
  return (
    <section className="rounded-[24px] border border-white/[0.07] bg-gradient-to-b from-white/[0.055] to-white/[0.025] p-3 shadow-[0_16px_50px_rgba(0,0,0,.22)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.12em] text-white/90">{title}</h4>
          {subtitle ? <p className="mt-1 text-[10px] font-semibold text-white/35">{subtitle}</p> : null}
        </div>
        {badge ? (
          <span className="shrink-0 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white/55">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Ring({ value, color, label }) {
  const safe = clamp(numberValue(value, 0), 0, 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(${color} ${safe * 3.6}deg, rgba(255,255,255,.07) 0deg)` }}
      >
        <div className="absolute inset-[7px] rounded-full bg-[#10131b]" />
        <span className="relative text-sm font-black text-white">{Math.round(safe)}%</span>
      </div>
      <span className="text-center text-[10px] font-bold text-white/45">{label}</span>
    </div>
  );
}

function RatioMetric({ label, homeMade, homeTotal, awayMade, awayTotal }) {
  const homePct = homeTotal ? (homeMade / homeTotal) * 100 : 0;
  const awayPct = awayTotal ? (awayMade / awayTotal) * 100 : 0;

  return (
    <div className="grid grid-cols-[86px_1fr_86px] items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="flex items-center gap-2">
        <span className="rounded-full border px-2 py-1 text-[10px] font-black text-white" style={{ borderColor: `${COR_CASA}99`, background: `${COR_CASA}33` }}>
          {Math.round(homeMade)}/{Math.round(homeTotal)}
        </span>
        <span className="text-[10px] font-black" style={{ color: '#91a5ff' }}>{Math.round(homePct)}%</span>
      </div>

      <p className="text-center text-[10px] font-black leading-tight text-white/80">{label}</p>

      <div className="flex items-center justify-end gap-2">
        <span className="text-[10px] font-black" style={{ color: '#ffc95d' }}>{Math.round(awayPct)}%</span>
        <span className="rounded-full border px-2 py-1 text-[10px] font-black text-white" style={{ borderColor: `${COR_FORA}99`, background: `${COR_FORA}33` }}>
          {Math.round(awayMade)}/{Math.round(awayTotal)}
        </span>
      </div>
    </div>
  );
}

function normalizeShots(jogo) {
  const source = pick(jogo?.shotmap, jogo?.shots_map, jogo?.mapa_chutes, jogo?.shots, []);
  if (!Array.isArray(source)) return [];

  return source
    .map((shot, index) => {
      const sideRaw = normalizeKey(pick(shot?.side, shot?.team, shot?.time, shot?.equipe));
      const side = sideRaw.includes('away') || sideRaw.includes('fora') || sideRaw.includes('visit') ? 'away' : 'home';
      const x = clamp(numberValue(pick(shot?.x, shot?.position?.x, shot?.coordinates?.x), 50), 2, 98);
      const y = clamp(numberValue(pick(shot?.y, shot?.position?.y, shot?.coordinates?.y), 50), 2, 98);
      return {
        id: pick(shot?.id, index),
        side,
        x,
        y,
        goal: Boolean(shot?.goal || normalizeKey(pick(shot?.result, shot?.resultado)).includes('gol')),
        onTarget: Boolean(shot?.onTarget || normalizeKey(pick(shot?.result, shot?.resultado)).includes('alvo')),
        player: pick(shot?.player?.name, shot?.player, shot?.jogador, 'Jogador'),
        minute: pick(shot?.minute, shot?.minuto, ''),
        xg: numberValue(pick(shot?.xg, shot?.expected_goals), null)
      };
    })
    .slice(0, 60);
}

function ShotMap({ jogo }) {
  const shots = normalizeShots(jogo);

  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-[#0d1119] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-white">Mapa de chutes</p>
          <p className="mt-1 text-[9px] font-semibold text-white/35">Coordenadas reais quando fornecidas pela API</p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[9px] font-black text-white/45">
          {shots.length} eventos
        </span>
      </div>

      <div className="relative aspect-[1.65/1] overflow-hidden rounded-2xl border-2 border-white/10 bg-[#101721]">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10" />
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15" />
        <div className="absolute inset-y-[20%] left-0 w-[15%] border border-l-0 border-white/10" />
        <div className="absolute inset-y-[20%] right-0 w-[15%] border border-r-0 border-white/10" />
        <div className="absolute inset-y-[34%] left-0 w-[6%] border border-l-0 border-white/10" />
        <div className="absolute inset-y-[34%] right-0 w-[6%] border border-r-0 border-white/10" />

        {shots.map((shot) => (
          <span
            key={shot.id}
            title={`${shot.player}${shot.minute ? ` • ${shot.minute}'` : ''}${shot.xg !== null ? ` • xG ${shot.xg.toFixed(2)}` : ''}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-[0_0_14px_rgba(0,0,0,.45)]"
            style={{
              left: `${shot.x}%`,
              top: `${shot.y}%`,
              width: shot.goal ? 17 : shot.onTarget ? 13 : 10,
              height: shot.goal ? 17 : shot.onTarget ? 13 : 10,
              borderColor: shot.goal ? '#ffffff' : shot.side === 'home' ? COR_CASA : COR_FORA,
              background: shot.side === 'home' ? `${COR_CASA}dd` : `${COR_FORA}dd`
            }}
          />
        ))}

        {shots.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xl">◎</div>
              <p className="text-xs font-black text-white/65">Mapa aguardando coordenadas</p>
              <p className="mt-1 text-[10px] font-semibold leading-relaxed text-white/30">
                O campo será preenchido quando a API retornar posição, resultado, jogador, minuto e xG de cada chute.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[9px] font-bold text-white/40">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: COR_CASA }} /> Casa</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: COR_FORA }} /> Fora</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full border-2 border-white bg-transparent" /> Gol</span>
      </div>
    </div>
  );
}

function normalizePlayers(jogo) {
  const source = pick(
    jogo?.player_statistics,
    jogo?.estatisticas_jogadores,
    jogo?.players_statistics,
    jogo?.players,
    jogo?.jogadores,
    []
  );

  const flattened = [];

  if (Array.isArray(source)) {
    for (const block of source) {
      if (Array.isArray(block?.players)) {
        for (const player of block.players) flattened.push({ ...player, team: block.team });
      } else {
        flattened.push(block);
      }
    }
  }

  return flattened.map((item, index) => {
    const stats = Array.isArray(item?.statistics) ? item.statistics[0] || {} : pick(item?.statistics, item?.stats, {});
    return {
      id: pick(item?.id, item?.player?.id, index),
      name: pick(item?.name, item?.nome, item?.player?.name, 'Jogador'),
      photo: pick(item?.photo, item?.foto, item?.player?.photo),
      teamLogo: pick(item?.team?.logo, item?.team_logo, stats?.team?.logo),
      number: pick(item?.number, item?.numero, stats?.games?.number, ''),
      xg: numberValue(pick(item?.xg, item?.expected_goals, stats?.xg, stats?.expected_goals), 0),
      xa: numberValue(pick(item?.xa, item?.expected_assists, stats?.xa, stats?.expected_assists), 0),
      shots: numberValue(pick(item?.shots, item?.finalizacoes, stats?.shots?.total), 0),
      passes: numberValue(pick(item?.passes, item?.passes_certos, stats?.passes?.total, stats?.passes?.key), 0),
      tackles: numberValue(pick(item?.tackles, item?.desarmes, stats?.tackles?.total), 0)
    };
  });
}

function Leaderboard({ title, players, metric, format = 'number' }) {
  const sorted = [...players]
    .filter((player) => numberValue(player?.[metric], 0) > 0)
    .sort((a, b) => numberValue(b?.[metric], 0) - numberValue(a?.[metric], 0))
    .slice(0, 5);

  return (
    <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.03] p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-black text-white/85">{title}</p>
        <span className="text-[9px] font-black uppercase tracking-wider text-white/25">Top 5</span>
      </div>

      {sorted.length > 0 ? (
        <div className="space-y-2">
          {sorted.map((player, index) => (
            <div key={player.id} className="grid grid-cols-[18px_34px_1fr_auto] items-center gap-2 rounded-2xl bg-black/20 px-2.5 py-2">
              <span className="text-center text-[10px] font-black text-white/30">{index + 1}</span>
              {player.photo ? (
                <img src={player.photo} alt={player.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[9px] font-black text-white/55">
                  {initials(player.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-[11px] font-black text-white/80">{player.name}</p>
                <p className="mt-0.5 text-[9px] font-semibold text-white/25">{player.number ? `#${player.number}` : 'Jogador'}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-black text-white">
                {format === 'decimal' ? numberValue(player[metric], 0).toFixed(2) : Math.round(numberValue(player[metric], 0))}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 px-3 py-5 text-center">
          <p className="text-[10px] font-black text-white/40">Aguardando dados individuais da API</p>
        </div>
      )}
    </div>
  );
}

function OverviewView({ stats }) {
  return (
    <div className="space-y-3">
      <SectionCard title="Domínio da partida" subtitle="Volume, criação e controle territorial">
        <MetricRow label="Posse de bola" home={stats.home.possession} away={stats.away.possession} format="percent" />
        <MetricRow label="Gols esperados (xG)" home={stats.home.xg} away={stats.away.xg} format="decimal" />
        <MetricRow label="Grandes chances" home={stats.home.bigChances} away={stats.away.bigChances} />
        <MetricRow label="Total de chutes" home={stats.home.shots} away={stats.away.shots} />
        <MetricRow label="Chutes no alvo" home={stats.home.shotsOnGoal} away={stats.away.shotsOnGoal} />
        <MetricRow label="Chutes bloqueados" home={stats.home.blockedShots} away={stats.away.blockedShots} />
      </SectionCard>

      <SectionCard title="Bola parada e disciplina" subtitle="Ritmo, interrupções e cartões">
        <MetricRow label="Escanteios" home={stats.home.corners} away={stats.away.corners} />
        <MetricRow label="Cobranças de falta" home={stats.home.fouls} away={stats.away.fouls} />
        <MetricRow label="Defesas do goleiro" home={stats.home.saves} away={stats.away.saves} />
        <MetricRow label="Impedimentos" home={stats.home.offsides} away={stats.away.offsides} />
        <MetricRow label="Cartões amarelos" home={stats.home.yellowCards} away={stats.away.yellowCards} />
        <MetricRow label="Cartões vermelhos" home={stats.home.redCards} away={stats.away.redCards} />
      </SectionCard>

      <SectionCard title="Circulação da bola" subtitle="Quantidade e eficiência dos passes">
        <MetricRow label="Total de passes" home={stats.home.passes} away={stats.away.passes} />
        <MetricRow label="Passes certos" home={stats.home.accuratePasses} away={stats.away.accuratePasses} />
        <MetricRow label="Precisão de passes" home={stats.home.passAccuracy} away={stats.away.passAccuracy} format="percent" />
      </SectionCard>
    </div>
  );
}

function ShotsView({ jogo, stats }) {
  return (
    <div className="space-y-3">
      <ShotMap jogo={jogo} />

      <SectionCard title="Perfil das finalizações" subtitle="Origem e qualidade dos chutes">
        <MetricRow label="Total de chutes" home={stats.home.shots} away={stats.away.shots} />
        <MetricRow label="Chutes no alvo" home={stats.home.shotsOnGoal} away={stats.away.shotsOnGoal} />
        <MetricRow label="Chutes bloqueados" home={stats.home.blockedShots} away={stats.away.blockedShots} />
        <MetricRow label="Dentro da área" home={stats.home.shotsInside} away={stats.away.shotsInside} />
        <MetricRow label="Fora da área" home={stats.home.shotsOutside} away={stats.away.shotsOutside} />
      </SectionCard>
    </div>
  );
}

function PerformanceView({ stats }) {
  const homeTacklePct = stats.home.tackles + stats.home.interceptions > 0
    ? (stats.home.tackles / (stats.home.tackles + stats.home.interceptions)) * 100
    : 0;
  const awayTacklePct = stats.away.tackles + stats.away.interceptions > 0
    ? (stats.away.tackles / (stats.away.tackles + stats.away.interceptions)) * 100
    : 0;

  return (
    <div className="space-y-3">
      <SectionCard title="Ataque" subtitle="Profundidade e presença ofensiva">
        <MetricRow label="Ataques" home={stats.home.attacks} away={stats.away.attacks} />
        <MetricRow label="Ataques perigosos" home={stats.home.dangerousAttacks} away={stats.away.dangerousAttacks} />
        <MetricRow label="Toques na área" home={stats.home.touchesBox} away={stats.away.touchesBox} />
        <MetricRow label="Entradas no último terço" home={stats.home.finalThird} away={stats.away.finalThird} />
      </SectionCard>

      <SectionCard title="Passes avançados" subtitle="Progressão e criação por bola longa">
        <RatioMetric label="Lançamentos longos certos" homeMade={stats.home.longBallsMade} homeTotal={stats.home.longBallsAttempted} awayMade={stats.away.longBallsMade} awayTotal={stats.away.longBallsAttempted} />
        <RatioMetric label="Cruzamentos certos" homeMade={stats.home.crossesMade} homeTotal={stats.home.crossesAttempted} awayMade={stats.away.crossesMade} awayTotal={stats.away.crossesAttempted} />
      </SectionCard>

      <SectionCard title="Duelos e dribles" subtitle="Eficiência no confronto individual">
        <RatioMetric label="Duelos vencidos" homeMade={stats.home.duelsWon} homeTotal={stats.home.duelsTotal} awayMade={stats.away.duelsWon} awayTotal={stats.away.duelsTotal} />
        <RatioMetric label="Duelos aéreos" homeMade={stats.home.aerialWon} homeTotal={stats.home.aerialTotal} awayMade={stats.away.aerialWon} awayTotal={stats.away.aerialTotal} />
        <RatioMetric label="Duelos no chão" homeMade={stats.home.groundWon} homeTotal={stats.home.groundTotal} awayMade={stats.away.groundWon} awayTotal={stats.away.groundTotal} />
        <RatioMetric label="Dribles certos" homeMade={stats.home.dribblesMade} homeTotal={stats.home.dribblesAttempted} awayMade={stats.away.dribblesMade} awayTotal={stats.away.dribblesAttempted} />
        <MetricRow label="Perdas de posse" home={stats.home.possessionLost} away={stats.away.possessionLost} />
      </SectionCard>

      <SectionCard title="Defesa e goleiros" subtitle="Recuperação, proteção e ações defensivas">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.06] bg-black/15 p-3">
          <Ring value={homeTacklePct} color={COR_CASA} label="Índice defensivo casa" />
          <Ring value={awayTacklePct} color={COR_FORA} label="Índice defensivo fora" />
        </div>
        <MetricRow label="Desarmes" home={stats.home.tackles} away={stats.away.tackles} />
        <MetricRow label="Interceptações" home={stats.home.interceptions} away={stats.away.interceptions} />
        <MetricRow label="Recuperações" home={stats.home.recoveries} away={stats.away.recoveries} />
        <MetricRow label="Cortes e rebatidas" home={stats.home.clearances} away={stats.away.clearances} />
        <MetricRow label="Erros que levaram a chute" home={stats.home.errorsShot} away={stats.away.errorsShot} />
        <MetricRow label="Tiros de meta" home={stats.home.goalKicks} away={stats.away.goalKicks} />
        <MetricRow label="Socos do goleiro" home={stats.home.punches} away={stats.away.punches} />
        <MetricRow label="Saídas pelo alto" home={stats.home.highClaims} away={stats.away.highClaims} />
      </SectionCard>
    </div>
  );
}

function PlayersView({ jogo }) {
  const players = normalizePlayers(jogo);

  return (
    <div className="space-y-3">
      <Leaderboard title="Gols esperados (xG)" players={players} metric="xg" format="decimal" />
      <Leaderboard title="Assistências esperadas (xA)" players={players} metric="xa" format="decimal" />
      <Leaderboard title="Finalizações totais" players={players} metric="shots" />
      <Leaderboard title="Passes e criação" players={players} metric="passes" />
      <Leaderboard title="Desarmes bem-sucedidos" players={players} metric="tackles" />
    </div>
  );
}

function SegmentedButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 flex-1 rounded-xl px-2 py-2.5 text-[10px] font-black transition-all ${
        active
          ? 'bg-white text-black shadow-lg shadow-black/25'
          : 'text-white/45 hover:bg-white/[0.04] hover:text-white/70'
      }`}
    >
      {children}
    </button>
  );
}

export default function EstatisticasJogoPro({ jogo = {}, casa = {}, fora = {} }) {
  const [period, setPeriod] = React.useState('all');
  const [view, setView] = React.useState('overview');

  const periodSource = React.useMemo(() => sourceForPeriod(jogo, period), [jogo, period]);
  const stats = React.useMemo(() => buildStats(periodSource.jogo), [periodSource.jogo]);

  return (
    <div className="space-y-3 text-white">
      <div className="rounded-[24px] border border-white/[0.08] bg-gradient-to-br from-[#111827] via-[#0d1119] to-[#080b11] p-3 shadow-[0_18px_60px_rgba(0,0,0,.32)]">
        <div className="flex items-center justify-between gap-3">
          <TeamBadge team={casa} fallback="Casa" side="home" />
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Central de estatísticas</p>
            <span
              className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                stats.real
                  ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                  : 'border-yellow-400/25 bg-yellow-400/10 text-yellow-200'
              }`}
            >
              {stats.real ? 'Dados da API' : 'Prévia demonstrativa'}
            </span>
          </div>
          <TeamBadge team={fora} fallback="Fora" side="away" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl border border-white/[0.06] bg-black/25 p-1">
          <SegmentedButton active={period === 'all'} onClick={() => setPeriod('all')}>Todos</SegmentedButton>
          <SegmentedButton active={period === 'first'} onClick={() => setPeriod('first')}>1º tempo</SegmentedButton>
          <SegmentedButton active={period === 'second'} onClick={() => setPeriod('second')}>2º tempo</SegmentedButton>
        </div>

        {period !== 'all' && !periodSource.available ? (
          <p className="mt-2 rounded-xl border border-yellow-400/15 bg-yellow-400/[0.06] px-3 py-2 text-center text-[9px] font-bold text-yellow-100/55">
            A API ainda não retornou estatísticas separadas deste período; exibindo o consolidado disponível.
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-4 gap-1 rounded-2xl border border-white/[0.06] bg-[#0c1017] p-1">
        <SegmentedButton active={view === 'overview'} onClick={() => setView('overview')}>Resumo</SegmentedButton>
        <SegmentedButton active={view === 'shots'} onClick={() => setView('shots')}>Chutes</SegmentedButton>
        <SegmentedButton active={view === 'performance'} onClick={() => setView('performance')}>Desempenho</SegmentedButton>
        <SegmentedButton active={view === 'players'} onClick={() => setView('players')}>Jogadores</SegmentedButton>
      </div>

      {view === 'overview' ? <OverviewView stats={stats} /> : null}
      {view === 'shots' ? <ShotsView jogo={periodSource.jogo} stats={stats} /> : null}
      {view === 'performance' ? <PerformanceView stats={stats} /> : null}
      {view === 'players' ? <PlayersView jogo={periodSource.jogo} /> : null}

      <div className="rounded-2xl border border-blue-400/10 bg-blue-400/[0.05] px-3 py-3">
        <p className="text-[9px] font-semibold leading-relaxed text-white/35">
          Estrutura preparada para API-Football, Sportradar ou outro provedor. Valores demonstrativos são substituídos automaticamente quando o jogo recebe estatísticas reais.
        </p>
      </div>
    </div>
  );
}
