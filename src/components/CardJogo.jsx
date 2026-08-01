import React, { useMemo, useState } from 'react';
import {
  Activity,
  BadgeDollarSign,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Clock3,
  Gauge,
  List,
  MessageSquareText,
  Radio,
  Shield,
  Sparkles,
  Swords,
  Table2,
  Target,
  TrendingUp,
  Trophy,
  Users
} from 'lucide-react';
import EstatisticasJogoPro from './EstatisticasJogoPro.jsx';
import {
  awayLogo,
  awayName,
  awayScore,
  clamp,
  confidence,
  dateTimeLabel,
  elapsedText,
  homeLogo,
  homeName,
  homeScore,
  initials,
  isFinished,
  isLive,
  isPreMatch,
  leagueCountry,
  leagueLogo,
  leagueName,
  mainOdd,
  nullableNumber,
  odds,
  pick,
  probabilities,
  statusText,
  teamPerformance,
  text
} from './matchProUtils.js';

/* BET_ETAPA_32A_CARD_JOGO_PREMIUM */

function TeamLogo({ src, name, size = 'large' }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = size === 'large' ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-8 w-8';

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${sizeClass} object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.40)]`}
      />
    );
  }

  return (
    <span className={`flex ${sizeClass} items-center justify-center rounded-full bg-white/[0.055] text-xs font-black text-white/70 ring-1 ring-inset ring-white/[0.08]`}>
      {initials(name)}
    </span>
  );
}

function SectionTitle({ eyebrow, title, description, icon: Icon }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.045] text-slate-300">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">{eyebrow}</p>
        <h3 className="mt-0.5 text-sm font-black text-white">{title}</h3>
        {description && <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500">{description}</p>}
      </div>
    </div>
  );
}

function DataList({ items = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/[0.025]">
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className={`flex items-center justify-between gap-4 px-3.5 py-3 ${
            index > 0 ? 'border-t border-white/[0.055]' : ''
          }`}
        >
          <span className="text-[10px] font-semibold text-slate-500">{item.label}</span>
          <span className="max-w-[65%] text-right text-[11px] font-extrabold text-slate-100">
            {item.value ?? '-'}
          </span>
        </div>
      ))}
    </div>
  );
}

function PerformancePanel({ jogo }) {
  const performance = teamPerformance(jogo);
  const home = homeName(jogo);
  const away = awayName(jogo);

  const Team = ({ name, value, side }) => (
    <div className="min-w-0 flex-1">
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-black text-slate-100">{name}</p>
          <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-600">
            índice de desempenho
          </p>
        </div>
        <span className={`text-2xl font-black tabular-nums ${side === 'home' ? 'text-blue-300' : 'text-amber-300'}`}>
          {value}%
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
        <div
          className={`h-full rounded-full ${side === 'home' ? 'bg-blue-500' : 'bg-amber-400'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="mb-5 rounded-2xl bg-gradient-to-br from-blue-500/[0.07] via-white/[0.025] to-amber-400/[0.06] p-4">
      <div className="flex gap-5">
        <Team name={home} value={performance.home} side="home" />
        <span className="w-px bg-white/[0.06]" />
        <Team name={away} value={performance.away} side="away" />
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.06] pt-3 text-center">
        <div>
          <p className="text-[8px] font-bold uppercase text-slate-600">Posse</p>
          <p className="mt-1 text-[10px] font-black text-slate-200">
            {Math.round(performance.possession.home)}% · {Math.round(performance.possession.away)}%
          </p>
        </div>
        <div>
          <p className="text-[8px] font-bold uppercase text-slate-600">Chutes</p>
          <p className="mt-1 text-[10px] font-black text-slate-200">
            {performance.shots.home ?? '-'} · {performance.shots.away ?? '-'}
          </p>
        </div>
        <div>
          <p className="text-[8px] font-bold uppercase text-slate-600">Cantos</p>
          <p className="mt-1 text-[10px] font-black text-slate-200">
            {performance.corners.home ?? '-'} · {performance.corners.away ?? '-'}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailsPanel({ jogo }) {
  const home = homeName(jogo);
  const away = awayName(jogo);
  const odd = mainOdd(jogo);
  const ia = confidence(jogo);
  const finished = isFinished(jogo);

  return (
    <div>
      {finished && <PerformancePanel jogo={jogo} />}

      <SectionTitle
        eyebrow="Visão geral"
        title="Informações da partida"
        description="Dados principais organizados sem caixas sobrepostas."
        icon={List}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <DataList
          items={[
            { label: 'Status', value: finished ? 'Encerrado' : isLive(jogo) ? 'Ao vivo' : 'Pré-jogo' },
            { label: 'Data e horário', value: dateTimeLabel(jogo) || '-' },
            { label: 'Mandante', value: home },
            { label: 'Visitante', value: away }
          ]}
        />
        <DataList
          items={[
            { label: 'Competição', value: leagueName(jogo) },
            { label: 'País / região', value: leagueCountry(jogo) },
            { label: 'Odd principal', value: odd !== null ? odd.toFixed(2) : '-' },
            { label: 'Confiança IA', value: ia > 0 ? `${ia}%` : '-' }
          ]}
        />
      </div>
    </div>
  );
}

function normalizePlayers(source) {
  if (!Array.isArray(source)) return [];

  return source.map((player) => {
    if (typeof player === 'string') return player;
    return text(
      player?.nome,
      player?.name,
      player?.player?.name,
      [player?.number, player?.player?.name].filter(Boolean).join(' ')
    );
  }).filter(Boolean);
}

function LineupsPanel({ jogo }) {
  const home = homeName(jogo);
  const away = awayName(jogo);
  const homePlayers = normalizePlayers(pick(jogo.escalacoes?.casa, jogo.lineups?.home, jogo.lineup_home, []));
  const awayPlayers = normalizePlayers(pick(jogo.escalacoes?.fora, jogo.lineups?.away, jogo.lineup_away, []));

  const TeamList = ({ name, players, side }) => (
    <div className="min-w-0 flex-1">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${side === 'home' ? 'bg-blue-400' : 'bg-amber-400'}`} />
        <h4 className="truncate text-[11px] font-black text-white">{name}</h4>
      </div>

      {players.length > 0 ? (
        <div className="space-y-0.5">
          {players.slice(0, 11).map((player, index) => (
            <div key={`${player}-${index}`} className="flex items-center gap-2 py-1.5 text-[10px] text-slate-400">
              <span className="w-4 text-[8px] font-black tabular-nums text-slate-700">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="truncate font-semibold">{player}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-[10px] font-semibold text-slate-600">
          Escalação aguardando dados da API.
        </p>
      )}
    </div>
  );

  return (
    <div>
      <SectionTitle
        eyebrow="Equipes"
        title="Escalações"
        description="Titulares e informações enviadas pela API da partida."
        icon={Users}
      />

      <div className="flex gap-5 rounded-2xl bg-white/[0.025] p-4">
        <TeamList name={home} players={homePlayers} side="home" />
        <span className="w-px bg-white/[0.06]" />
        <TeamList name={away} players={awayPlayers} side="away" />
      </div>
    </div>
  );
}

function PredictionPanel({ jogo }) {
  const ia = confidence(jogo) || 87;
  const market = text(
    jogo.mercado_principal,
    jogo.mercadoIA,
    jogo.ia?.mercado,
    'Mercado principal em análise'
  );
  const ev = nullableNumber(pick(jogo.ev, jogo.valor_esperado, jogo.ia?.ev));

  return (
    <div>
      <SectionTitle
        eyebrow="Inteligência artificial"
        title="Previsão da partida"
        description="Leitura de forma, mercado, risco, histórico e contexto do confronto."
        icon={Sparkles}
      />

      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/[0.16] via-white/[0.035] to-emerald-400/[0.08] p-5">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-300">
              Melhor leitura encontrada
            </p>
            <h4 className="mt-2 text-base font-black leading-snug text-white">{market}</h4>
            <p className="mt-2 max-w-md text-[10px] font-medium leading-relaxed text-slate-400">
              A confiança combina desempenho recente, mando de campo, confronto direto,
              produção ofensiva e comportamento das odds.
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-4xl font-black tracking-tight text-white">{ia}%</p>
            <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-slate-600">
              confiança
            </p>
          </div>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/25">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400" style={{ width: `${ia}%` }} />
        </div>

        {ev !== null && (
          <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-300">
            <TrendingUp className="h-4 w-4" />
            Valor esperado estimado: {ev.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

function OddsPanel({ jogo }) {
  const values = odds(jogo);
  const probability = probabilities(jogo);
  const totalProbability = probability.home + probability.draw + probability.away;

  const Option = ({ label, odd, probabilityValue, accent }) => (
    <div className="flex-1 px-3 py-4 text-center">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-black tabular-nums text-white">{odd !== null ? odd.toFixed(2) : '-'}</p>
      {totalProbability > 0 && (
        <p className={`mt-1 text-[9px] font-black ${accent}`}>{probabilityValue}%</p>
      )}
    </div>
  );

  return (
    <div>
      <SectionTitle
        eyebrow="Mercado"
        title="Odds e probabilidades"
        description="Comparação direta das principais opções da partida."
        icon={BadgeDollarSign}
      />

      <div className="flex divide-x divide-white/[0.06] overflow-hidden rounded-2xl bg-white/[0.025]">
        <Option label="Casa" odd={values.home} probabilityValue={probability.home} accent="text-blue-300" />
        <Option label="Empate" odd={values.draw} probabilityValue={probability.draw} accent="text-slate-300" />
        <Option label="Fora" odd={values.away} probabilityValue={probability.away} accent="text-amber-300" />
      </div>

      {totalProbability > 0 && (
        <div className="mt-4">
          <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.04]">
            <span className="bg-blue-500" style={{ width: `${probability.home}%` }} />
            <span className="bg-slate-500" style={{ width: `${probability.draw}%` }} />
            <span className="bg-amber-400" style={{ width: `${probability.away}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[8px] font-bold text-slate-600">
            <span>Casa {probability.home}%</span>
            <span>Empate {probability.draw}%</span>
            <span>Fora {probability.away}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StandingsPanel({ jogo }) {
  const table = pick(jogo.classificacao, jogo.standings, jogo.tabela, {}) || {};

  return (
    <div>
      <SectionTitle
        eyebrow="Competição"
        title="Classificação"
        description="Posição e pontuação atual das equipes."
        icon={Table2}
      />
      <DataList
        items={[
          { label: `${homeName(jogo)} · posição`, value: pick(table.casa_posicao, table.home?.rank, '-') },
          { label: `${homeName(jogo)} · pontos`, value: pick(table.casa_pontos, table.home?.points, '-') },
          { label: `${awayName(jogo)} · posição`, value: pick(table.fora_posicao, table.away?.rank, '-') },
          { label: `${awayName(jogo)} · pontos`, value: pick(table.fora_pontos, table.away?.points, '-') }
        ]}
      />
    </div>
  );
}

function H2HPanel({ jogo }) {
  const h2h = pick(jogo.h2h, jogo.confronto_direto, jogo.cd, {}) || {};

  return (
    <div>
      <SectionTitle
        eyebrow="Histórico"
        title="Confronto direto"
        description="Resumo dos encontros recentes entre as equipes."
        icon={Swords}
      />

      <p className="rounded-2xl bg-white/[0.025] px-4 py-4 text-[11px] font-semibold leading-relaxed text-slate-300">
        {text(h2h.resumo, h2h.summary, `${homeName(jogo)} x ${awayName(jogo)}`)}
      </p>

      <div className="mt-3 grid grid-cols-3 divide-x divide-white/[0.06] rounded-2xl bg-white/[0.025] py-3 text-center">
        <div>
          <p className="text-xl font-black text-blue-300">{pick(h2h.vitorias_casa, h2h.homeWins, '-')}</p>
          <p className="mt-1 text-[8px] font-bold uppercase text-slate-600">Casa</p>
        </div>
        <div>
          <p className="text-xl font-black text-white">{pick(h2h.empates, h2h.draws, '-')}</p>
          <p className="mt-1 text-[8px] font-bold uppercase text-slate-600">Empates</p>
        </div>
        <div>
          <p className="text-xl font-black text-amber-300">{pick(h2h.vitorias_fora, h2h.awayWins, '-')}</p>
          <p className="mt-1 text-[8px] font-bold uppercase text-slate-600">Fora</p>
        </div>
      </div>
    </div>
  );
}

function CommentaryPanel({ jogo }) {
  const commentary = text(
    jogo.comentario,
    jogo.commentary,
    jogo.narracao,
    jogo.analise,
    'Os comentários, gols, cartões e principais eventos serão exibidos quando a API enviar os dados.'
  );

  return (
    <div>
      <SectionTitle
        eyebrow="Leitura da partida"
        title="Comentários"
        description="Resumo técnico e eventos relevantes do confronto."
        icon={MessageSquareText}
      />
      <p className="rounded-2xl bg-white/[0.025] px-4 py-5 text-[11px] font-medium leading-6 text-slate-300">
        {commentary}
      </p>
    </div>
  );
}

function StatsPanel({ jogo }) {
  return (
    <div>
      <SectionTitle
        eyebrow="Desempenho"
        title="Estatísticas completas"
        description="Comparativo técnico das equipes e métricas por período."
        icon={BarChart3}
      />
      <PerformancePanel jogo={jogo} />
      <EstatisticasJogoPro
        jogo={jogo}
        casa={{ name: homeName(jogo), logo: homeLogo(jogo) }}
        fora={{ name: awayName(jogo), logo: awayLogo(jogo) }}
      />
    </div>
  );
}

const TABS = [
  { id: 'detalhes', label: 'Detalhes', icon: List },
  { id: 'escalacoes', label: 'Escalações', icon: Users },
  { id: 'ia', label: 'Previsão IA', icon: Sparkles },
  { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 },
  { id: 'odds', label: 'Odds', icon: BadgeDollarSign },
  { id: 'classificacao', label: 'Classificação', icon: Table2 },
  { id: 'cd', label: 'Confrontos', icon: Swords },
  { id: 'comentario', label: 'Comentários', icon: MessageSquareText }
];

export default function CardJogo({
  jogo = {},
  onClick,
  onSelect,
  selecionado = false,
  compacto = false
}) {
  const [tab, setTab] = useState('detalhes');
  const home = homeName(jogo);
  const away = awayName(jogo);
  const live = isLive(jogo);
  const finished = isFinished(jogo);
  const prematch = isPreMatch(jogo);
  const ia = confidence(jogo);
  const odd = mainOdd(jogo);
  const scoreH = homeScore(jogo);
  const scoreA = awayScore(jogo);
  const logoCompetition = leagueLogo(jogo);

  const status = live
    ? elapsedText(jogo) || 'AO VIVO'
    : finished
      ? 'ENCERRADO'
      : 'PRÉ-JOGO';

  const statusClass = live
    ? 'bg-red-500/10 text-red-300 ring-red-500/20'
    : finished
      ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20'
      : 'bg-blue-500/10 text-blue-300 ring-blue-500/20';

  const StatusIcon = live ? Radio : finished ? CheckCircle2 : Clock3;

  const panel = useMemo(() => {
    if (tab === 'detalhes') return <DetailsPanel jogo={jogo} />;
    if (tab === 'escalacoes') return <LineupsPanel jogo={jogo} />;
    if (tab === 'ia') return <PredictionPanel jogo={jogo} />;
    if (tab === 'estatisticas') return <StatsPanel jogo={jogo} />;
    if (tab === 'odds') return <OddsPanel jogo={jogo} />;
    if (tab === 'classificacao') return <StandingsPanel jogo={jogo} />;
    if (tab === 'cd') return <H2HPanel jogo={jogo} />;
    return <CommentaryPanel jogo={jogo} />;
  }, [tab, jogo]);

  function openCard() {
    if (typeof onClick === 'function') onClick(jogo);
    if (typeof onSelect === 'function') onSelect(jogo);
  }

  return (
    <section
      onClick={compacto ? openCard : undefined}
      className={`relative isolate w-full overflow-hidden rounded-[30px] bg-[#080b11] shadow-[0_24px_65px_rgba(0,0,0,0.38)] ring-1 ring-inset ${
        selecionado ? 'ring-white/[0.10]' : 'ring-white/[0.065]'
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-[2px] ${
        live ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent'
          : finished ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent'
            : 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'
      }`} />

      <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.045]">
            {logoCompetition ? (
              <img src={logoCompetition} alt="" className="h-5 w-5 object-contain" />
            ) : (
              <Trophy className="h-4 w-4 text-slate-500" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black text-slate-200">{leagueName(jogo)}</p>
            <p className="mt-0.5 truncate text-[8px] font-bold uppercase tracking-[0.12em] text-slate-700">
              {leagueCountry(jogo)}
            </p>
          </div>
        </div>

        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-black tracking-[0.1em] ring-1 ring-inset ${statusClass}`}>
          <StatusIcon className="h-3 w-3" />
          {status}
        </span>
      </header>

      <div className="px-4 pb-5 pt-4 sm:px-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          <div className="min-w-0 text-center">
            <div className="mx-auto flex justify-center">
              <TeamLogo src={homeLogo(jogo)} name={home} />
            </div>
            <p className="mt-2 truncate text-[11px] font-black text-white sm:text-sm">{home}</p>
            <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-slate-700">Mandante</p>
          </div>

          <div className="flex min-w-[92px] flex-col items-center text-center">
            <p className="mb-2 text-[8px] font-black uppercase tracking-[0.13em] text-slate-600">
              {dateTimeLabel(jogo) || 'Hoje'}
            </p>

            {prematch ? (
              <div className="flex h-[58px] min-w-[88px] items-center justify-center rounded-2xl bg-white/[0.035] px-4">
                <CalendarClock className="mr-2 h-4 w-4 text-blue-400" />
                <span className="text-xl font-black tabular-nums text-white">
                  {dateTimeLabel(jogo).split(' ').slice(-1)[0] || '--:--'}
                </span>
              </div>
            ) : (
              <div className="flex h-[58px] min-w-[100px] items-center justify-center rounded-2xl bg-black/35 px-4">
                <span className="text-3xl font-black tabular-nums tracking-tight text-white">
                  {scoreH ?? 0}
                </span>
                <span className="mx-2 text-lg font-black text-slate-700">–</span>
                <span className="text-3xl font-black tabular-nums tracking-tight text-white">
                  {scoreA ?? 0}
                </span>
              </div>
            )}

            <p className="mt-2 text-[9px] font-black text-slate-500">
              {live ? elapsedText(jogo) : finished ? 'Placar final' : statusText(jogo) || 'Agendado'}
            </p>
          </div>

          <div className="min-w-0 text-center">
            <div className="mx-auto flex justify-center">
              <TeamLogo src={awayLogo(jogo)} name={away} />
            </div>
            <p className="mt-2 truncate text-[11px] font-black text-white sm:text-sm">{away}</p>
            <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-slate-700">Visitante</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center divide-x divide-white/[0.06] border-t border-white/[0.06] pt-3">
          <div className="flex min-w-[94px] items-center justify-center gap-2 px-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <div>
              <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">Confiança IA</p>
              <p className="mt-0.5 text-[10px] font-black text-slate-200">{ia > 0 ? `${ia}%` : '-'}</p>
            </div>
          </div>

          <div className="flex min-w-[94px] items-center justify-center gap-2 px-3">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <div>
              <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">Odd principal</p>
              <p className="mt-0.5 text-[10px] font-black text-slate-200">{odd !== null ? odd.toFixed(2) : '-'}</p>
            </div>
          </div>

          <div className="hidden min-w-[94px] items-center justify-center gap-2 px-3 sm:flex">
            <Shield className="h-3.5 w-3.5 text-amber-400" />
            <div>
              <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">Análise</p>
              <p className="mt-0.5 text-[10px] font-black text-slate-200">Completa</p>
            </div>
          </div>
        </div>
      </div>

      {!compacto && (
        <>
          <nav className="flex gap-1 overflow-x-auto border-y border-white/[0.06] bg-white/[0.018] px-3 no-scrollbar sm:px-4">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setTab(id);
                  }}
                  className={`relative flex shrink-0 items-center gap-1.5 px-3 py-3 text-[9px] font-black transition ${
                    active ? 'text-white' : 'text-slate-600 hover:text-slate-300'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? 'text-blue-400' : ''}`} />
                  {label}
                  {active && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-blue-500" />}
                </button>
              );
            })}
          </nav>

          <div onClick={(event) => event.stopPropagation()} className="px-4 py-5 sm:px-6 sm:py-6">
            {panel}
          </div>
        </>
      )}
    </section>
  );
}
