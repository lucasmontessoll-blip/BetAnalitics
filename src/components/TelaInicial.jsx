import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Crown,
  Flame,
  Lock,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap
} from 'lucide-react';

import JogosPorPaisContinente from './JogosPorPaisContinente.jsx';
import LegalCompliance from './LegalCompliance.jsx';
import {
  confidence,
  isFinished,
  isLive,
  leagueName,
  mainOdd,
  normalizeMatch,
  pick
} from './matchProUtils.js';

/* BET_ETAPA_32B_TELA_INICIAL_PREMIUM */

const JOGOS_DEMO_HOME = [
  {
    id: 'demo-home-premium-1',
    demo: true,
    home_team: 'Flamengo',
    away_team: 'Palmeiras',
    league_name: 'Brasileirão Série A',
    league_country: 'Brasil',
    status: 'Live',
    time_elapsed: 62,
    scoreHome: 2,
    scoreAway: 1,
    confianca_ia: 92,
    odd_principal: 1.78,
    mercado_principal: 'Vitória Flamengo',
    risco: 'Baixo',
    ev: 14.2,
    estatisticas: {
      posseCasa: 58,
      posseFora: 42,
      chutesCasa: 15,
      chutesFora: 8,
      chutesNoAlvoCasa: 7,
      chutesNoAlvoFora: 3,
      escanteiosCasa: 7,
      escanteiosFora: 3
    }
  },
  {
    id: 'demo-home-premium-2',
    demo: true,
    home_team: 'Corinthians',
    away_team: 'São Paulo',
    league_name: 'Brasileirão Série A',
    league_country: 'Brasil',
    status: 'NS',
    starting_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    confianca_ia: 86,
    odd_principal: 2.02,
    mercado_principal: 'Mais de 1.5 gols',
    risco: 'Médio',
    ev: 11.8
  },
  {
    id: 'demo-home-premium-3',
    demo: true,
    home_team: 'Liverpool',
    away_team: 'Manchester City',
    league_name: 'Premier League',
    league_country: 'Inglaterra',
    status: 'Not Started',
    starting_at: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
    confianca_ia: 89,
    odd_principal: 2.10,
    mercado_principal: 'Ambas marcam',
    risco: 'Médio',
    ev: 12.4
  }
];

function numberValue(value, fallback = 0) {
  const parsed = Number(String(value ?? '').replace('%', '').replace(',', '.').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeHomeMatch(jogo, index) {
  const normalized = normalizeMatch(jogo, index);
  const ia = confidence(normalized) || Math.min(94, 86 + index);
  const odd = mainOdd(normalized) ?? Number((1.76 + index * 0.12).toFixed(2));
  const calculatedEv = ((ia / 100) * odd - 1) * 100;
  const ev = numberValue(pick(jogo?.ev, jogo?.valor_esperado, jogo?.ia?.ev), calculatedEv);

  return {
    ...normalized,
    confianca_ia: Math.max(60, Math.min(99, Math.round(ia))),
    odd_principal: Number(odd),
    mercado_principal: pick(
      jogo?.mercado_principal,
      jogo?.mercado,
      jogo?.market,
      jogo?.ia?.mercado,
      'Mercado principal em análise'
    ),
    risco: pick(jogo?.risco, jogo?.risk, ia >= 90 ? 'Baixo' : ia >= 82 ? 'Médio' : 'Controlado'),
    ev: Number(ev.toFixed(1))
  };
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4 px-1">
      <div>
        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">{eyebrow}</p>
        <h2 className="mt-1 text-base font-black tracking-tight text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-600">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function Metric({ icon: Icon, label, value, accent = 'text-blue-300' }) {
  return (
    <div className="min-w-0 px-3 py-3.5 text-center">
      <Icon className={`mx-auto h-3.5 w-3.5 ${accent}`} />
      <p className="mt-2 truncate text-lg font-black tabular-nums text-white">{value}</p>
      <p className="mt-0.5 truncate text-[7px] font-black uppercase tracking-[0.12em] text-slate-700">
        {label}
      </p>
    </div>
  );
}

function OpportunityHero({ jogo, onOpen, onRadar, onPro }) {
  const ia = confidence(jogo);
  const odd = mainOdd(jogo);
  const ev = numberValue(jogo.ev, 0);
  const live = isLive(jogo);
  const finished = isFinished(jogo);

  const stateLabel = live ? 'AO VIVO' : finished ? 'ENCERRADO' : 'PRÉ-JOGO';
  const stateClass = live
    ? 'bg-red-500/10 text-red-300 ring-red-500/20'
    : finished
      ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20'
      : 'bg-blue-500/10 text-blue-300 ring-blue-500/20';

  return (
    <section className="relative isolate mt-3 overflow-hidden rounded-[30px] bg-[#080c16] shadow-[0_24px_70px_rgba(0,0,0,0.38)] ring-1 ring-inset ring-blue-500/15">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(37,99,235,0.22),transparent_38%),radial-gradient(circle_at_90%_100%,rgba(16,185,129,0.10),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            BetAnalytics Intelligence
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-2.5 py-1 text-[8px] font-black text-yellow-300 ring-1 ring-inset ring-yellow-400/20">
            <Crown className="h-3 w-3" />
            PRO
          </span>
        </div>

        <div className="mt-5 max-w-xl">
          <h1 className="text-[27px] font-black leading-[1.08] tracking-[-0.035em] text-white sm:text-3xl">
            Decisões melhores antes de cada partida
          </h1>
          <p className="mt-3 text-[11px] font-medium leading-5 text-slate-400">
            IA, odds, risco e desempenho organizados para mostrar onde existe maior valor no mercado.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] bg-white/[0.035] ring-1 ring-inset ring-white/[0.065]">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.055] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-300">
                <Flame className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-yellow-300">
                  Melhor oportunidade
                </p>
                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-700">
                  Selecionada pelo motor IA
                </p>
              </div>
            </div>

            <span className={`rounded-full px-2.5 py-1 text-[8px] font-black tracking-[0.1em] ring-1 ring-inset ${stateClass}`}>
              {stateLabel}
            </span>
          </div>

          <div className="px-4 py-4 sm:px-5">
            <p className="truncate text-lg font-black tracking-tight text-white">
              {jogo.home_team} <span className="mx-1 text-slate-700">x</span> {jogo.away_team}
            </p>
            <p className="mt-1 truncate text-[10px] font-semibold text-slate-600">
              {leagueName(jogo)} · {jogo.mercado_principal}
            </p>

            <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.06] rounded-2xl bg-black/20 py-3">
              <div className="text-center">
                <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">Confiança</p>
                <p className="mt-1 text-xl font-black tabular-nums text-white">{ia}%</p>
              </div>
              <div className="text-center">
                <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">Odd</p>
                <p className="mt-1 text-xl font-black tabular-nums text-yellow-300">
                  {odd !== null ? odd.toFixed(2) : '-'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">Valor esperado</p>
                <p className={`mt-1 text-xl font-black tabular-nums ${ev >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {ev >= 0 ? '+' : ''}{ev.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-slate-700">
                <span>Consenso IA</span>
                <span className="text-slate-400">{ia}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                  style={{ width: `${Math.max(5, Math.min(100, ia))}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpen?.(jogo)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-[10px] font-black uppercase tracking-wide text-slate-950 transition hover:bg-blue-50 active:scale-[0.99]"
            >
              Ver análise completa
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onRadar}
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-[9px] font-black uppercase tracking-wide text-white transition hover:bg-blue-500 active:scale-[0.99]"
          >
            <Zap className="h-4 w-4" />
            Abrir Radar IA
          </button>

          <button
            type="button"
            onClick={onPro}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.035] px-4 py-3 text-[9px] font-black uppercase tracking-wide text-yellow-300 ring-1 ring-inset ring-yellow-400/15 transition hover:bg-yellow-400/[0.07] active:scale-[0.99]"
          >
            <Lock className="h-4 w-4" />
            Área PRO
          </button>
        </div>
      </div>
    </section>
  );
}

function RankingIA({ jogos, onOpen }) {
  return (
    <section className="mt-7">
      <SectionHeading
        eyebrow="Motor de oportunidades"
        title="Ranking IA do dia"
        description="As melhores leituras ordenadas por confiança."
        action={(
          <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[8px] font-black text-blue-300">
            TOP {jogos.length}
          </span>
        )}
      />

      <div className="overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
        {jogos.map((jogo, index) => {
          const ia = confidence(jogo);
          const odd = mainOdd(jogo);
          const ev = numberValue(jogo.ev, 0);

          return (
            <button
              key={jogo.id}
              type="button"
              onClick={() => onOpen?.(jogo)}
              className={`group flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.025] ${
                index > 0 ? 'border-t border-white/[0.055]' : ''
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                index === 0
                  ? 'bg-yellow-400/12 text-yellow-300'
                  : index === 1
                    ? 'bg-slate-300/10 text-slate-300'
                    : 'bg-amber-700/10 text-amber-500'
              }`}>
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-black text-white">
                  {jogo.home_team} <span className="text-slate-700">x</span> {jogo.away_team}
                </p>
                <p className="mt-1 truncate text-[8px] font-semibold text-slate-600">
                  {jogo.mercado_principal} · Odd {odd !== null ? odd.toFixed(2) : '-'} · EV {ev >= 0 ? '+' : ''}{ev.toFixed(1)}%
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-lg font-black tabular-nums text-white">{ia}%</p>
                <p className="text-[7px] font-black uppercase tracking-wider text-blue-400">IA</p>
              </div>

              <ArrowRight className="h-4 w-4 shrink-0 text-slate-800 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function TelaInicial({
  jogos = [],
  favoritos = [],
  onToggleFavorito,
  onAbrirJogo,
  renderizarListaJogos
}) {
  const navigate = useNavigate();

  const origem = useMemo(() => {
    const reais = Array.isArray(jogos) && jogos.length > 0 ? jogos : JOGOS_DEMO_HOME;
    return reais.map(normalizeHomeMatch);
  }, [jogos]);

  const listaIA = useMemo(() => (
    [...origem]
      .sort((a, b) => confidence(b) - confidence(a))
      .slice(0, 3)
  ), [origem]);

  const oportunidade = listaIA[0] || normalizeHomeMatch(JOGOS_DEMO_HOME[0], 0);
  const jogosAoVivo = origem.filter(isLive).length;
  const mediaIA = Math.round(
    listaIA.reduce((sum, jogo) => sum + confidence(jogo), 0) / Math.max(1, listaIA.length)
  );
  const melhorOdd = origem.reduce((best, jogo) => {
    const odd = mainOdd(jogo);
    return odd !== null && odd > best ? odd : best;
  }, 0);
  const totalAnalisado = origem.length;

  return (
    <main className="w-full px-3 pb-28 sm:px-4">
      <OpportunityHero
        jogo={oportunidade}
        onOpen={onAbrirJogo}
        onRadar={() => navigate('/radar')}
        onPro={() => navigate('/pro')}
      />

      <section className="mt-4 grid grid-cols-2 divide-x divide-y divide-white/[0.055] overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_14px_36px_rgba(0,0,0,0.22)] ring-1 ring-inset ring-white/[0.06] sm:grid-cols-4 sm:divide-y-0">
        <Metric icon={Target} label="Precisão IA" value={`${mediaIA}%`} accent="text-blue-300" />
        <Metric icon={Radio} label="Ao vivo" value={jogosAoVivo} accent="text-red-300" />
        <Metric icon={BarChart3} label="Analisados" value={totalAnalisado} accent="text-violet-300" />
        <Metric icon={TrendingUp} label="Melhor odd" value={melhorOdd ? melhorOdd.toFixed(2) : '-'} accent="text-emerald-300" />
      </section>

      <RankingIA jogos={listaIA} onOpen={onAbrirJogo} />

      <section className="mt-7">
        <SectionHeading
          eyebrow="Cobertura global"
          title="Partidas por país e região"
          description="Abra uma região para acessar todos os jogos disponíveis."
          action={(
            <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Dados ativos
            </span>
          )}
        />

        <JogosPorPaisContinente
          jogos={origem}
          favoritos={favoritos}
          onToggleFavorito={onToggleFavorito}
          onAbrirJogo={onAbrirJogo}
        />
      </section>

      {/*
        A lista antiga não é exibida junto com a nova para evitar jogos duplicados
        e manter a tela inicial limpa. A prop continua aceita para compatibilidade.
      */}
      {false && typeof renderizarListaJogos === 'function' ? renderizarListaJogos() : null}

      <div className="mt-10 px-4 text-center">
        <LegalCompliance modo="botao" />
      </div>
    </main>
  );
}
