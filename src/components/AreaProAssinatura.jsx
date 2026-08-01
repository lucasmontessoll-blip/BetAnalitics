import React, { useMemo } from 'react';
import {
  ArrowRight,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  Crown,
  Lock,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';

import { temAcessoPro } from '../utils/acessoPro.js';

/* BET_ETAPA_32C_AREA_PRO_PREMIUM */

function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function BenefitRow({ icon: Icon, title, description, index }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-4 ${
        index > 0 ? 'border-t border-white/[0.055]' : ''
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-300">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[11px] font-black text-white">{title}</p>
        <p className="mt-1 text-[9px] font-medium leading-relaxed text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}

function PlanCard({
  recommended = false,
  title,
  price,
  period,
  saving,
  active,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative isolate w-full overflow-hidden rounded-[24px] px-4 py-4 text-left transition active:scale-[0.99] ${
        recommended
          ? 'bg-gradient-to-br from-yellow-400/[0.11] via-[#0b0e14] to-emerald-400/[0.06] ring-1 ring-inset ring-yellow-400/20'
          : 'bg-[#0b0e14] ring-1 ring-inset ring-white/[0.06]'
      }`}
    >
      {recommended && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-white">{title}</p>
            {recommended && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/10 px-2 py-1 text-[7px] font-black uppercase tracking-wide text-yellow-300 ring-1 ring-inset ring-yellow-400/15">
                <Sparkles className="h-2.5 w-2.5" />
                Recomendado
              </span>
            )}
          </div>
          <p className="mt-1 text-[9px] font-semibold text-slate-600">{period}</p>
          {saving && (
            <p className="mt-2 text-[8px] font-black uppercase tracking-wide text-emerald-300">
              {saving}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className={`text-xl font-black tabular-nums ${recommended ? 'text-yellow-300' : 'text-white'}`}>
            {money(price)}
          </p>
          <p className="mt-1 text-[7px] font-black uppercase tracking-wider text-slate-700">
            {active ? 'renovar plano' : 'selecionar'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.055] pt-3">
        <span className="text-[8px] font-semibold text-slate-600">
          Pagamento seguro e liberação após aprovação
        </span>
        <ArrowRight className="h-4 w-4 text-slate-700" />
      </div>
    </button>
  );
}

function FeatureStatus({ enabled }) {
  return enabled ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
  ) : (
    <X className="h-4 w-4 text-slate-800" />
  );
}

export default function AreaProAssinatura({
  userData,
  setMenuAtivo,
  setViewMode,
  iniciarPagamento
}) {
  const data = useMemo(() => {
    const vipActive = temAcessoPro(userData);
    const plan = userData?.plano || userData?.plan || (vipActive ? 'PRO' : 'Free');
    const expiration =
      userData?.vip_expira ||
      userData?.vip_expira_em ||
      userData?.vencimento ||
      'Após pagamento aprovado';

    return {
      vipActive,
      plan,
      expiration,
      monthly: 29.9,
      annual: 299.9
    };
  }, [userData]);

  function subscribe(plan) {
    if (typeof iniciarPagamento === 'function') {
      iniciarPagamento(plan);
      return;
    }

    if (typeof setMenuAtivo === 'function') {
      setMenuAtivo('pagamento');
    }
  }

  function openRadar() {
    if (typeof setViewMode === 'function') {
      setViewMode('radarpro');
    }
  }

  const benefits = [
    {
      icon: Brain,
      title: 'Análise IA completa',
      description: 'Confiança, mercado, risco e explicação detalhada das oportunidades.'
    },
    {
      icon: TrendingUp,
      title: 'Radar de valor',
      description: 'Ranking de jogos, movimento de odds e valor esperado em tempo real.'
    },
    {
      icon: Target,
      title: 'Gestão de banca',
      description: 'Controle de unidade, exposição, ROI e histórico das entradas.'
    },
    {
      icon: Zap,
      title: 'Alertas premium',
      description: 'Mudanças importantes de confiança e mercado destacadas automaticamente.'
    }
  ];

  const comparison = [
    ['Jogos e resultados básicos', true, true],
    ['Radar IA completo', false, true],
    ['Análise detalhada da partida', false, true],
    ['Gestão de banca', false, true],
    ['Histórico da IA', false, true],
    ['Alertas premium', false, true]
  ];

  return (
    <main className="w-full animate-fade-in px-3 pb-28 pt-3 sm:px-4">
      <section className="relative isolate overflow-hidden rounded-[30px] bg-[#080c16] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] ring-1 ring-inset ring-yellow-400/15 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(234,179,8,0.18),transparent_38%),radial-gradient(circle_at_90%_100%,rgba(37,99,235,0.12),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-yellow-300">
              <Crown className="h-3.5 w-3.5" />
              Assinatura premium
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-black ring-1 ring-inset ${
                data.vipActive
                  ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/15'
                  : 'bg-white/[0.04] text-slate-500 ring-white/[0.06]'
              }`}
            >
              {data.vipActive ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {data.vipActive ? 'PRO ATIVO' : 'PLANO FREE'}
            </span>
          </div>

          <h1 className="mt-5 text-[27px] font-black leading-[1.08] tracking-[-0.035em] text-white sm:text-3xl">
            BetAnalytics PRO
          </h1>
          <p className="mt-3 max-w-xl text-[11px] font-medium leading-5 text-slate-400">
            Libere o Radar IA, análises avançadas, gestão de banca e alertas em uma experiência completa.
          </p>

          <div className="mt-6 grid grid-cols-2 divide-x divide-white/[0.06] overflow-hidden rounded-2xl bg-white/[0.035] py-3 ring-1 ring-inset ring-white/[0.055]">
            <div className="text-center">
              <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">Status</p>
              <p className={`mt-1 text-sm font-black ${data.vipActive ? 'text-emerald-300' : 'text-slate-300'}`}>
                {data.vipActive ? 'Ativo' : 'Free'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">Plano</p>
              <p className="mt-1 text-sm font-black text-yellow-300">{data.plan}</p>
            </div>
          </div>

          {data.vipActive && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-emerald-400/[0.06] px-4 py-3 text-[9px] font-semibold leading-relaxed text-emerald-200 ring-1 ring-inset ring-emerald-400/10">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              Sua assinatura está ativa. Vencimento: {data.expiration}
            </div>
          )}

          {data.vipActive && (
            <button
              type="button"
              onClick={openRadar}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-[9px] font-black uppercase tracking-wide text-slate-950"
            >
              Abrir Radar IA
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 px-1">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
            Recursos incluídos
          </p>
          <h2 className="mt-1 text-base font-black tracking-tight text-white">
            Inteligência para cada decisão
          </h2>
          <p className="mt-1 text-[10px] font-medium text-slate-600">
            Ferramentas organizadas para análise e controle responsável.
          </p>
        </div>

        <div className="overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
          {benefits.map((benefit, index) => (
            <BenefitRow key={benefit.title} {...benefit} index={index} />
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between gap-4 px-1">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
              Planos
            </p>
            <h2 className="mt-1 text-base font-black tracking-tight text-white">
              Escolha seu acesso
            </h2>
            <p className="mt-1 text-[10px] font-medium text-slate-600">
              Liberação após a confirmação do pagamento.
            </p>
          </div>
          <CreditCard className="h-5 w-5 text-yellow-300" />
        </div>

        <div className="space-y-2.5">
          <PlanCard
            title="Plano mensal"
            price={data.monthly}
            period="Acesso PRO por 30 dias"
            active={data.vipActive}
            onClick={() => subscribe('mensal')}
          />

          <PlanCard
            recommended
            title="Plano anual"
            price={data.annual}
            period="Acesso PRO por 12 meses"
            saving="Economize aproximadamente 2 meses"
            active={data.vipActive}
            onClick={() => subscribe('anual')}
          />
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 px-1">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
            Comparativo
          </p>
          <h2 className="mt-1 text-base font-black tracking-tight text-white">
            Free versus PRO
          </h2>
        </div>

        <div className="overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
          <div className="grid grid-cols-[1fr_52px_52px] items-center border-b border-white/[0.06] px-4 py-3 text-[7px] font-black uppercase tracking-[0.12em] text-slate-700">
            <span>Recurso</span>
            <span className="text-center">Free</span>
            <span className="text-center text-yellow-300">PRO</span>
          </div>

          {comparison.map(([label, free, pro], index) => (
            <div
              key={label}
              className={`grid grid-cols-[1fr_52px_52px] items-center px-4 py-3 ${
                index > 0 ? 'border-t border-white/[0.045]' : ''
              }`}
            >
              <span className="text-[9px] font-semibold text-slate-400">{label}</span>
              <span className="flex justify-center"><FeatureStatus enabled={free} /></span>
              <span className="flex justify-center"><FeatureStatus enabled={pro} /></span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 flex items-start gap-3 rounded-[22px] bg-red-500/[0.055] px-4 py-4 ring-1 ring-inset ring-red-500/10">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
        <div>
          <p className="text-[10px] font-black text-red-200">Aviso importante</p>
          <p className="mt-1 text-[9px] font-medium leading-relaxed text-red-100/60">
            As análises são informativas e não garantem lucro. Apostas envolvem risco e exigem responsabilidade.
          </p>
        </div>
      </section>
    </main>
  );
}
