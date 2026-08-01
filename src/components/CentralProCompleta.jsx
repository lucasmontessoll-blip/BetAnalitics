import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  Crown,
  Eye,
  Flame,
  History,
  Lock,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
  Zap
} from 'lucide-react';

import { temAcessoPro } from '../utils/acessoPro.js';
import {
  confidence,
  isFinished,
  isLive,
  leagueName,
  mainOdd,
  normalizeMatch,
  pick
} from './matchProUtils.js';

/* BET_ETAPA_32C_CENTRAL_PRO_PREMIUM */

const JOGOS_DEMO = [
  {
    id: 'radar-demo-1',
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
    ev: 14.2
  },
  {
    id: 'radar-demo-2',
    home_team: 'Liverpool',
    away_team: 'Manchester City',
    league_name: 'Premier League',
    league_country: 'Inglaterra',
    status: 'NS',
    confianca_ia: 89,
    odd_principal: 2.10,
    mercado_principal: 'Ambas marcam',
    risco: 'Médio',
    ev: 11.5
  },
  {
    id: 'radar-demo-3',
    home_team: 'Real Madrid',
    away_team: 'Barcelona',
    league_name: 'La Liga',
    league_country: 'Espanha',
    status: 'Finished',
    scoreHome: 3,
    scoreAway: 1,
    confianca_ia: 88,
    odd_principal: 1.95,
    mercado_principal: 'Mais de 2.5 gols',
    risco: 'Médio',
    ev: 9.8
  }
];

const HISTORICO = [
  {
    id: 'h1',
    jogo: 'Flamengo x Palmeiras',
    mercado: 'Mais de 1.5 gols',
    ia: 92,
    odd: 1.78,
    status: 'GREEN',
    lucro: '+R$ 78,00'
  },
  {
    id: 'h2',
    jogo: 'Liverpool x Manchester City',
    mercado: 'Ambas marcam',
    ia: 89,
    odd: 1.92,
    status: 'GREEN',
    lucro: '+R$ 92,00'
  },
  {
    id: 'h3',
    jogo: 'Real Madrid x Barcelona',
    mercado: 'Mais de 2.5 gols',
    ia: 88,
    odd: 2.05,
    status: 'RED',
    lucro: '-R$ 50,00'
  },
  {
    id: 'h4',
    jogo: 'Corinthians x Grêmio',
    mercado: 'Dupla chance',
    ia: 84,
    odd: 1.65,
    status: 'GREEN',
    lucro: '+R$ 65,00'
  }
];

const ALERTAS = [
  {
    id: 'a1',
    titulo: 'Confiança IA aumentou',
    texto: 'Flamengo chegou a 94% de confiança no motor IA.',
    tipo: 'ia'
  },
  {
    id: 'a2',
    titulo: 'Movimento relevante de odd',
    texto: 'A odd caiu de 1.95 para 1.78 no mercado principal.',
    tipo: 'odd'
  },
  {
    id: 'a3',
    titulo: 'Favorito entrou no radar',
    texto: 'Palmeiras foi identificado em uma oportunidade PRO.',
    tipo: 'fav'
  }
];

const TABS = [
  { id: 'oportunidades', label: 'Oportunidades', icon: Target },
  { id: 'historico', label: 'Histórico', icon: History },
  { id: 'alertas', label: 'Alertas', icon: Bell },
  { id: 'vip', label: 'VIP e banca', icon: Wallet },
  { id: 'admin', label: 'Admin', icon: Shield }
];

function numberValue(value, fallback = 0) {
  const parsed = Number(
    String(value ?? '')
      .replace('%', '')
      .replace(',', '.')
      .replace(/[^0-9.-]/g, '')
  );

  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeRadarMatch(jogo, index) {
  const normalized = normalizeMatch(jogo, index);
  const ia = confidence(normalized) || Math.min(94, 86 + index);
  const odd = mainOdd(normalized) ?? Number((1.76 + index * 0.12).toFixed(2));
  const calculatedEv = ((ia / 100) * odd - 1) * 100;
  const ev = numberValue(
    pick(jogo?.ev, jogo?.valor_esperado, jogo?.ia?.ev),
    calculatedEv
  );

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
    risco: pick(
      jogo?.risco,
      jogo?.risk,
      ia >= 90 ? 'Baixo' : ia >= 82 ? 'Médio' : 'Controlado'
    ),
    ev: Number(ev.toFixed(1))
  };
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4 px-1">
      <div>
        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-base font-black tracking-tight text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-600">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function Metric({ icon: Icon, label, value, accent }) {
  return (
    <div className="min-w-0 px-3 py-3.5 text-center">
      <Icon className={`mx-auto h-3.5 w-3.5 ${accent}`} />
      <p className="mt-2 truncate text-lg font-black tabular-nums text-white">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[7px] font-black uppercase tracking-[0.12em] text-slate-700">
        {label}
      </p>
    </div>
  );
}

function OpportunityCard({ jogo, rank, vipAtivo, onOpen }) {
  const ia = confidence(jogo);
  const odd = mainOdd(jogo);
  const ev = numberValue(jogo.ev, 0);
  const live = isLive(jogo);
  const finished = isFinished(jogo);
  const state = live ? 'AO VIVO' : finished ? 'ENCERRADO' : 'PRÉ-JOGO';

  return (
    <article className="relative isolate overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
      <div
        className={`absolute inset-y-4 left-0 w-[3px] rounded-r-full ${
          live ? 'bg-red-500' : finished ? 'bg-emerald-400' : 'bg-blue-500'
        }`}
      />

      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
              rank === 1
                ? 'bg-yellow-400/12 text-yellow-300'
                : rank === 2
                  ? 'bg-slate-300/10 text-slate-300'
                  : 'bg-amber-700/10 text-amber-500'
            }`}
          >
            {String(rank).padStart(2, '0')}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-black text-white">
              {jogo.home_team}
              <span className="mx-1.5 text-slate-700">x</span>
              {jogo.away_team}
            </p>
            <p className="mt-1 truncate text-[9px] font-semibold text-slate-600">
              {leagueName(jogo)} · {state}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-2xl font-black tabular-nums text-white">{ia}%</p>
            <p className="text-[7px] font-black uppercase tracking-wider text-blue-400">
              confiança IA
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.06] rounded-2xl bg-white/[0.025] py-3">
          <div className="min-w-0 px-2 text-center">
            <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">
              Mercado
            </p>
            <p className="mt-1 truncate text-[9px] font-black text-slate-300">
              {jogo.mercado_principal}
            </p>
          </div>

          <div className="px-2 text-center">
            <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">
              Odd
            </p>
            <p className="mt-1 text-sm font-black tabular-nums text-yellow-300">
              {odd !== null ? odd.toFixed(2) : '-'}
            </p>
          </div>

          <div className="px-2 text-center">
            <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">
              EV
            </p>
            <p
              className={`mt-1 text-sm font-black tabular-nums ${
                ev >= 0 ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {ev >= 0 ? '+' : ''}
              {ev.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-slate-700">
            <span>Consenso do motor</span>
            <span className="text-slate-400">{jogo.risco} risco</span>
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
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[9px] font-black uppercase tracking-wide transition active:scale-[0.99] ${
            vipAtivo
              ? 'bg-white text-slate-950 hover:bg-blue-50'
              : 'bg-yellow-400/10 text-yellow-300 ring-1 ring-inset ring-yellow-400/20 hover:bg-yellow-400/15'
          }`}
        >
          {vipAtivo ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {vipAtivo ? 'Abrir análise completa' : 'Desbloquear análise PRO'}
        </button>
      </div>
    </article>
  );
}

function RadarHero({ vipAtivo, mediaIA, totalJogos, alertasPendentes }) {
  return (
    <section className="relative isolate overflow-hidden rounded-[30px] bg-[#080c16] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] ring-1 ring-inset ring-blue-500/15 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(37,99,235,0.22),transparent_38%),radial-gradient(circle_at_90%_100%,rgba(16,185,129,0.10),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-blue-300">
            <Bot className="h-3.5 w-3.5" />
            Central de inteligência
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-black ring-1 ring-inset ${
              vipAtivo
                ? 'bg-yellow-400/10 text-yellow-300 ring-yellow-400/20'
                : 'bg-white/[0.04] text-slate-500 ring-white/[0.06]'
            }`}
          >
            <Crown className="h-3 w-3" />
            {vipAtivo ? 'VIP ATIVO' : 'MODO DEMO'}
          </span>
        </div>

        <h1 className="mt-5 text-[27px] font-black leading-[1.08] tracking-[-0.035em] text-white sm:text-3xl">
          Radar IA de oportunidades
        </h1>
        <p className="mt-3 max-w-xl text-[11px] font-medium leading-5 text-slate-400">
          Ranking, histórico, alertas, risco e valor esperado em uma central única.
        </p>

        <div className="mt-6 grid grid-cols-3 divide-x divide-white/[0.06] overflow-hidden rounded-2xl bg-white/[0.035] py-3 ring-1 ring-inset ring-white/[0.055]">
          <Metric icon={Target} label="Precisão" value={`${mediaIA}%`} accent="text-blue-300" />
          <Metric icon={BarChart3} label="Jogos" value={totalJogos} accent="text-violet-300" />
          <Metric icon={Bell} label="Alertas" value={alertasPendentes} accent="text-red-300" />
        </div>
      </div>
    </section>
  );
}

function HistoryPanel({ precision }) {
  return (
    <div>
      <SectionHeading
        eyebrow="Resultados recentes"
        title="Histórico de acertos IA"
        description="Desempenho demonstrativo das últimas leituras registradas."
        action={(
          <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[8px] font-black text-emerald-300">
            {precision}% precisão
          </span>
        )}
      />

      <div className="overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
        {HISTORICO.map((item, index) => {
          const green = item.status === 'GREEN';

          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-4 py-4 ${
                index > 0 ? 'border-t border-white/[0.055]' : ''
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  green
                    ? 'bg-emerald-400/10 text-emerald-300'
                    : 'bg-red-500/10 text-red-300'
                }`}
              >
                {green ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-black text-white">{item.jogo}</p>
                <p className="mt-1 truncate text-[8px] font-semibold text-slate-600">
                  {item.mercado} · IA {item.ia}% · Odd {item.odd}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className={`text-[11px] font-black ${green ? 'text-emerald-300' : 'text-red-300'}`}>
                  {item.lucro}
                </p>
                <p className="mt-0.5 text-[7px] font-black uppercase tracking-wider text-slate-700">
                  {item.status}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertsPanel({ read, onRead }) {
  return (
    <div>
      <SectionHeading
        eyebrow="Monitoramento"
        title="Alertas inteligentes"
        description="Mudanças relevantes de confiança, odds e favoritos."
        action={(
          <button
            type="button"
            onClick={onRead}
            className="rounded-full bg-white/[0.04] px-3 py-1.5 text-[8px] font-black uppercase tracking-wide text-slate-400 ring-1 ring-inset ring-white/[0.06]"
          >
            Marcar como lidos
          </button>
        )}
      />

      <div className="overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
        {ALERTAS.map((alerta, index) => {
          const Icon = alerta.tipo === 'ia' ? Zap : alerta.tipo === 'odd' ? TrendingUp : Star;
          const accent = alerta.tipo === 'ia'
            ? 'text-yellow-300 bg-yellow-400/10'
            : alerta.tipo === 'odd'
              ? 'text-blue-300 bg-blue-500/10'
              : 'text-violet-300 bg-violet-500/10';

          return (
            <div
              key={alerta.id}
              className={`flex items-start gap-3 px-4 py-4 ${
                index > 0 ? 'border-t border-white/[0.055]' : ''
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[11px] font-black text-white">{alerta.titulo}</p>
                  {!read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />}
                </div>
                <p className="mt-1 text-[9px] font-medium leading-relaxed text-slate-600">
                  {alerta.texto}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VipPanel({ vipAtivo, userData, onSubscribe }) {
  const plan = pick(userData?.plano, userData?.plan, vipAtivo ? 'PRO' : 'Demo');

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-yellow-400/[0.10] via-[#0b0e14] to-emerald-400/[0.06] p-5 ring-1 ring-inset ring-yellow-400/15">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-yellow-300">
              Perfil premium
            </p>
            <h2 className="mt-1 text-xl font-black text-white">
              {vipAtivo ? 'Recursos PRO liberados' : 'Desbloqueie a central completa'}
            </h2>
            <p className="mt-2 text-[10px] font-medium leading-relaxed text-slate-500">
              Radar, histórico, gestão de banca e análises avançadas em um único plano.
            </p>
          </div>

          <Crown className="h-7 w-7 shrink-0 text-yellow-300" />
        </div>

        <div className="mt-5 grid grid-cols-2 divide-x divide-white/[0.06] rounded-2xl bg-black/20 py-3">
          <div className="text-center">
            <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">Status</p>
            <p className={`mt-1 text-sm font-black ${vipAtivo ? 'text-emerald-300' : 'text-slate-300'}`}>
              {vipAtivo ? 'Ativo' : 'Demo'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">Plano</p>
            <p className="mt-1 text-sm font-black text-yellow-300">{plan}</p>
          </div>
        </div>

        {!vipAtivo && (
          <button
            type="button"
            onClick={onSubscribe}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 text-[9px] font-black uppercase tracking-wide text-black"
          >
            Assinar PRO
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </section>

      <section>
        <SectionHeading
          eyebrow="Gestão responsável"
          title="Resumo de banca"
          description="Indicadores demonstrativos de controle e exposição."
        />

        <div className="grid grid-cols-2 gap-2.5">
          {[
            ['Banca atual', 'R$ 1.280', 'text-white'],
            ['ROI', '+14.2%', 'text-emerald-300'],
            ['Unidade', 'R$ 25', 'text-yellow-300'],
            ['Limite diário', '3 entradas', 'text-blue-300']
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="rounded-[20px] bg-[#0b0e14] px-4 py-4 ring-1 ring-inset ring-white/[0.06]"
            >
              <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">{label}</p>
              <p className={`mt-2 text-lg font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminPanel() {
  return (
    <div>
      <SectionHeading
        eyebrow="Operação"
        title="Resumo administrativo"
        description="Visão demonstrativa do produto e da infraestrutura."
      />

      <div className="grid grid-cols-2 gap-2.5">
        {[
          ['Usuários', '128', 'text-white'],
          ['Assinantes PRO', '37', 'text-yellow-300'],
          ['Receita mensal', 'R$ 1.106', 'text-emerald-300'],
          ['API', 'Online', 'text-emerald-300']
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-[20px] bg-[#0b0e14] px-4 py-4 ring-1 ring-inset ring-white/[0.06]"
          >
            <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">{label}</p>
            <p className={`mt-2 text-lg font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-emerald-400/[0.06] px-4 py-3 text-[9px] font-bold text-emerald-300 ring-1 ring-inset ring-emerald-400/10">
        <CheckCircle2 className="h-4 w-4" />
        Serviços principais operando normalmente.
      </div>
    </div>
  );
}

export default function CentralProCompleta({
  jogos = [],
  userData = {},
  setMenuAtivo,
  setJogoSelecionado,
  onAbrirJogo
}) {
  const [tab, setTab] = useState('oportunidades');
  const [alertsRead, setAlertsRead] = useState(false);
  const vipAtivo = temAcessoPro(userData);

  const listaJogos = useMemo(() => {
    const source = Array.isArray(jogos) && jogos.length > 0 ? jogos : JOGOS_DEMO;

    return source
      .map(normalizeRadarMatch)
      .sort((a, b) => confidence(b) - confidence(a))
      .slice(0, 12);
  }, [jogos]);

  const mediaIA = Math.round(
    listaJogos.reduce((sum, jogo) => sum + confidence(jogo), 0) /
      Math.max(1, listaJogos.length)
  );

  const greens = HISTORICO.filter((item) => item.status === 'GREEN').length;
  const precision = Math.round((greens / HISTORICO.length) * 100);
  const alertsPending = alertsRead ? 0 : ALERTAS.length;

  function openMatch(jogo) {
    if (!vipAtivo) {
      if (typeof setMenuAtivo === 'function') setMenuAtivo('assinar pro');
      return;
    }

    if (typeof onAbrirJogo === 'function') {
      onAbrirJogo(jogo);
      return;
    }

    if (typeof setJogoSelecionado === 'function') {
      setJogoSelecionado(jogo);
    }
  }

  function subscribe() {
    if (typeof setMenuAtivo === 'function') setMenuAtivo('assinar pro');
  }

  return (
    <main className="w-full animate-fade-in px-3 pb-28 pt-3 text-white sm:px-4">
      <RadarHero
        vipAtivo={vipAtivo}
        mediaIA={mediaIA}
        totalJogos={listaJogos.length}
        alertasPendentes={alertsPending}
      />

      <nav className="no-scrollbar mt-5 flex gap-1 overflow-x-auto border-b border-white/[0.055] px-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative flex shrink-0 items-center gap-1.5 px-3 py-3 text-[9px] font-black transition ${
                active ? 'text-white' : 'text-slate-600 hover:text-slate-300'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? 'text-blue-400' : ''}`} />
              {label}
              {active && (
                <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-6">
        {tab === 'oportunidades' && (
          <div>
            <SectionHeading
              eyebrow="Ranking do motor"
              title="Oportunidades do dia"
              description="Ordenadas por confiança, valor esperado e risco."
              action={(
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-2.5 py-1 text-[8px] font-black text-yellow-300">
                  <Flame className="h-3 w-3" />
                  TOP {listaJogos.length}
                </span>
              )}
            />

            <div className="space-y-2.5">
              {listaJogos.map((jogo, index) => (
                <OpportunityCard
                  key={jogo.id}
                  jogo={jogo}
                  rank={index + 1}
                  vipAtivo={vipAtivo}
                  onOpen={openMatch}
                />
              ))}
            </div>
          </div>
        )}

        {tab === 'historico' && <HistoryPanel precision={precision} />}

        {tab === 'alertas' && (
          <AlertsPanel
            read={alertsRead}
            onRead={() => setAlertsRead(true)}
          />
        )}

        {tab === 'vip' && (
          <VipPanel
            vipAtivo={vipAtivo}
            userData={userData}
            onSubscribe={subscribe}
          />
        )}

        {tab === 'admin' && <AdminPanel />}
      </div>
    </main>
  );
}
