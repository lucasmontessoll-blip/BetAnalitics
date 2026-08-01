import React, { useMemo } from 'react';
import {
  BarChart3,
  Bell,
  Brain,
  ChevronRight,
  Crown,
  Landmark,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Wallet
} from 'lucide-react';

import { temAcessoPro } from '../utils/acessoPro.js';

/* BET_ETAPA_32D_PERFIL_PREMIUM */

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function countFavorites() {
  try {
    const value = JSON.parse(
      localStorage.getItem('bet_favoritos_pro_v1') || '{}'
    );

    if (!value || typeof value !== 'object') return 0;

    return Object.values(value).reduce(
      (total, items) => total + (Array.isArray(items) ? items.length : 0),
      0
    );
  } catch {
    return 0;
  }
}

function getInitials(name = '') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'BA';
}

function Metric({ value, label, accent }) {
  return (
    <div className="min-w-0 px-3 py-3.5 text-center">
      <p className={`truncate text-xl font-black tabular-nums ${accent}`}>
        {value}
      </p>
      <p className="mt-0.5 truncate text-[7px] font-black uppercase tracking-[0.12em] text-slate-700">
        {label}
      </p>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  accent,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group min-w-0 rounded-[22px] bg-[#0b0e14] p-4 text-left shadow-[0_12px_32px_rgba(0,0,0,0.20)] ring-1 ring-inset ring-white/[0.06] transition hover:-translate-y-0.5 hover:bg-[#0d1119] active:scale-[0.99]"
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 truncate text-[11px] font-black text-white">{title}</p>
      <p className="mt-1 line-clamp-2 text-[9px] font-medium leading-relaxed text-slate-600">
        {description}
      </p>
    </button>
  );
}

function AccountRow({
  icon: Icon,
  title,
  description,
  accent = 'text-blue-300',
  onClick,
  danger = false
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.025]"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          danger ? 'bg-red-500/10' : 'bg-white/[0.035]'
        }`}
      >
        <Icon className={`h-4 w-4 ${danger ? 'text-red-300' : accent}`} />
      </span>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-[11px] font-black ${danger ? 'text-red-200' : 'text-white'}`}>
          {title}
        </p>
        <p className="mt-1 truncate text-[8px] font-semibold text-slate-600">
          {description}
        </p>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-slate-800 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
    </button>
  );
}

export default function PerfilProCompleto({
  userData = {},
  setViewMode,
  setAiOpen,
  setAiQuery
}) {
  const stats = useMemo(() => {
    const history = readArray('betanalytics_historico_ia_v1');
    const bank = readArray('bet_banca_historico_v2');

    return {
      analyses: history.length || 3,
      favorites: countFavorites() || 5,
      bankEntries: bank.length || 3
    };
  }, []);

  const name =
    userData?.nome ||
    userData?.name ||
    localStorage.getItem('bet_user_nome') ||
    'Usuário BetAnalytics';

  const email =
    userData?.email ||
    localStorage.getItem('bet_user_email') ||
    'demo@betanalytics.pro';

  const vipActive = temAcessoPro(userData);
  const plan = userData?.plano || userData?.plan || (vipActive ? 'PRO' : 'Free');
  const expiration =
    userData?.vip_expira ||
    userData?.vip_expira_em ||
    userData?.vencimento ||
    '';

  function logout() {
    localStorage.removeItem('bet_sessao_ativa');
    localStorage.removeItem('bet_user_nome');
    localStorage.removeItem('bet_user_email');
    window.location.reload();
  }

  function askAI() {
    if (typeof setAiQuery === 'function') {
      setAiQuery(
        'Analise meu perfil e diga quais recursos do aplicativo devo usar primeiro.'
      );
    }

    if (typeof setAiOpen === 'function') {
      setAiOpen(true);
    }
  }

  return (
    <main className="w-full animate-fade-in px-3 pb-28 pt-3 sm:px-4">
      <section className="relative isolate overflow-hidden rounded-[30px] bg-[#080c16] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] ring-1 ring-inset ring-blue-500/15 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(37,99,235,0.22),transparent_38%),radial-gradient(circle_at_90%_100%,rgba(234,179,8,0.10),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-blue-300">
              <User className="h-3.5 w-3.5" />
              Conta BetAnalytics
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-black ring-1 ring-inset ${
                vipActive
                  ? 'bg-yellow-400/10 text-yellow-300 ring-yellow-400/20'
                  : 'bg-white/[0.04] text-slate-500 ring-white/[0.06]'
              }`}
            >
              <Crown className="h-3 w-3" />
              {vipActive ? 'VIP PRO' : 'PLANO FREE'}
            </span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-blue-500/10 text-lg font-black text-blue-200 ring-1 ring-inset ring-blue-400/20">
              {getInitials(name)}
            </span>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-black tracking-tight text-white">
                {name}
              </h1>
              <p className="mt-1 truncate text-[10px] font-semibold text-slate-500">
                {email}
              </p>
              <p className="mt-2 text-[8px] font-black uppercase tracking-[0.14em] text-slate-700">
                Plano {plan}
                {expiration ? ` · válido até ${expiration}` : ''}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 divide-x divide-white/[0.06] overflow-hidden rounded-2xl bg-white/[0.035] py-3 ring-1 ring-inset ring-white/[0.055]">
            <Metric
              value={stats.analyses}
              label="Análises"
              accent="text-blue-300"
            />
            <Metric
              value={stats.favorites}
              label="Favoritos"
              accent="text-yellow-300"
            />
            <Metric
              value={stats.bankEntries}
              label="Entradas"
              accent="text-emerald-300"
            />
          </div>
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 px-1">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
            Acesso rápido
          </p>
          <h2 className="mt-1 text-base font-black tracking-tight text-white">
            Central do usuário
          </h2>
          <p className="mt-1 text-[10px] font-medium text-slate-600">
            Recursos principais organizados para acesso imediato.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <QuickAction
            icon={Crown}
            title="Área VIP"
            description="Plano, benefícios e assinatura."
            accent="bg-yellow-400/10 text-yellow-300"
            onClick={() => setViewMode?.('vip-pro')}
          />
          <QuickAction
            icon={Brain}
            title="Central IA"
            description="Radar, alertas e oportunidades."
            accent="bg-blue-500/10 text-blue-300"
            onClick={() => setViewMode?.('radar')}
          />
          <QuickAction
            icon={BarChart3}
            title="Performance"
            description="Assertividade e mercados fortes."
            accent="bg-emerald-400/10 text-emerald-300"
            onClick={() => setViewMode?.('performance-ia')}
          />
          <QuickAction
            icon={Landmark}
            title="Parceiros"
            description="Casas e integrações disponíveis."
            accent="bg-violet-500/10 text-violet-300"
            onClick={() => setViewMode?.('casas-parceiras')}
          />
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 px-1">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
            Minha conta
          </p>
          <h2 className="mt-1 text-base font-black tracking-tight text-white">
            Dados e ferramentas
          </h2>
        </div>

        <div className="overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
          <AccountRow
            icon={Star}
            title="Favoritos PRO"
            description="Times, ligas, jogos e alertas salvos"
            accent="text-yellow-300"
            onClick={() => setViewMode?.('favoritos')}
          />
          <div className="border-t border-white/[0.055]" />
          <AccountRow
            icon={Bell}
            title="Alertas IA"
            description="Odds, banca e oportunidades monitoradas"
            accent="text-amber-300"
            onClick={() => setViewMode?.('alertas-ia')}
          />
          <div className="border-t border-white/[0.055]" />
          <AccountRow
            icon={Wallet}
            title="Gestão de banca"
            description="Stake, ROI, lucro e controle de risco"
            accent="text-emerald-300"
            onClick={() => setViewMode?.('banca-pro')}
          />
          <div className="border-t border-white/[0.055]" />
          <AccountRow
            icon={BarChart3}
            title="Histórico IA PRO"
            description="Análises, resultados, lucro e ROI"
            accent="text-blue-300"
            onClick={() => setViewMode?.('historico')}
          />
          <div className="border-t border-white/[0.055]" />
          <AccountRow
            icon={Settings}
            title="Configurações"
            description="Conta, notificações e preferências"
            accent="text-slate-300"
            onClick={() => setViewMode?.('config')}
          />
          <div className="border-t border-white/[0.055]" />
          <AccountRow
            icon={ShieldCheck}
            title="Jogo responsável"
            description="+18, avisos legais e proteção"
            accent="text-cyan-300"
            onClick={() => setViewMode?.('termos')}
          />
        </div>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={askAI}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 text-[9px] font-black uppercase tracking-wide text-white transition hover:bg-blue-500 active:scale-[0.99]"
        >
          <Sparkles className="h-4 w-4" />
          Perguntar à IA
        </button>

        <button
          type="button"
          onClick={logout}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-500/[0.07] px-3 text-[9px] font-black uppercase tracking-wide text-red-300 ring-1 ring-inset ring-red-500/15 active:scale-[0.99]"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </main>
  );
}
