import React, { useState } from 'react';
import {
  Bell,
  Brain,
  ChevronRight,
  Crown,
  FileText,
  FlaskConical,
  LifeBuoy,
  Lock,
  LogOut,
  Moon,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Wallet
} from 'lucide-react';

import { temAcessoPro } from '../utils/acessoPro.js';

/* BET_ETAPA_32D_CONFIGURACOES_PREMIUM */

const DEFAULT_CONFIG = {
  notificacoes: false,
  tema: 'escuro',
  moeda: 'BRL',
  limiteDiario: 50,
  iaConservadora: true
};

function readConfig() {
  try {
    const stored = JSON.parse(
      localStorage.getItem('bet_config_pro_v1') || 'null'
    );

    const merged = {
      ...DEFAULT_CONFIG,
      ...(stored && typeof stored === 'object' ? stored : {})
    };

    const consentimentoPush =
      localStorage.getItem('bet_push_consent_v1') === 'granted';

    return {
      ...merged,
      notificacoes: Boolean(
        consentimentoPush &&
        merged.notificacoes
      )
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function SettingRow({
  icon: Icon,
  title,
  description,
  accent = 'text-blue-300',
  onClick,
  control
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.025]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.035]">
        <Icon className={`h-4 w-4 ${accent}`} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-black text-white">{title}</p>
        <p className="mt-1 truncate text-[8px] font-semibold text-slate-600">
          {description}
        </p>
      </div>

      {control || (
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-800 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
      )}
    </button>
  );
}

function Toggle({ active }) {
  return (
    <span
      className={`relative h-6 w-10 shrink-0 rounded-full transition ${
        active ? 'bg-blue-600' : 'bg-white/[0.07]'
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
          active ? 'left-5' : 'left-1'
        }`}
      />
    </span>
  );
}

function Section({ eyebrow, title, children }) {
  return (
    <section className="mt-7">
      <div className="mb-3 px-1">
        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-base font-black tracking-tight text-white">
          {title}
        </h2>
      </div>

      <div className="overflow-hidden rounded-[24px] bg-[#0b0e14] shadow-[0_15px_40px_rgba(0,0,0,0.24)] ring-1 ring-inset ring-white/[0.06]">
        {children}
      </div>
    </section>
  );
}

export default function ConfiguracoesPro({
  userData = {},
  setViewMode,
  solicitarPermissaoNotificacao,
  desativarNotificacao,
  testarNotificacao,
  setAiOpen,
  setAiQuery,
  modoDemo = true
}) {
  const [config, setConfig] = useState(readConfig);
  const vipActive = temAcessoPro(userData);
  const plan = userData?.plano || userData?.plan || (vipActive ? 'PRO' : 'Free');
  const email = userData?.email || localStorage.getItem('bet_user_email') || 'Usuário demo';

  function save(patch) {
    const next = { ...config, ...patch };
    setConfig(next);

    try {
      localStorage.setItem('bet_config_pro_v1', JSON.stringify(next));
    } catch {}
  }

  async function logout() {
    try {
      if (
        typeof desativarNotificacao ===
        'function'
      ) {
        await desativarNotificacao();
      }
    } catch {}

    localStorage.removeItem('bet_sessao_ativa');
    localStorage.removeItem('bet_user_nome');
    localStorage.removeItem('bet_user_email');
    window.location.reload();
  }

  function resetOnboarding() {
    localStorage.removeItem('bet_onboarding_pro_v1');
    window.location.reload();
  }

  function askAI() {
    if (typeof setAiQuery === 'function') {
      setAiQuery(
        'Me ajude a configurar o BetAnalytics PRO de forma conservadora e segura.'
      );
    }

    if (typeof setAiOpen === 'function') {
      setAiOpen(true);
    }
  }

  async function toggleNotifications() {
    const next =
      !config.notificacoes;

    try {
      if (next) {
        if (
          typeof solicitarPermissaoNotificacao !==
          'function'
        ) {
          throw new Error(
            'Servico de notificacoes indisponivel.'
          );
        }

        const resultado =
          await solicitarPermissaoNotificacao();

        if (
          resultado?.ok === false
        ) {
          throw new Error(
            resultado?.mensagem ||
            'Nao foi possivel ativar notificacoes.'
          );
        }

        localStorage.setItem(
          'bet_push_consent_v1',
          'granted'
        );

        save({
          notificacoes: true
        });

        alert(
          resultado?.mensagem ||
          'Notificacoes ativadas.'
        );

        return;
      }

      if (
        typeof desativarNotificacao ===
        'function'
      ) {
        await desativarNotificacao();
      }

      localStorage.removeItem(
        'bet_push_consent_v1'
      );

      save({
        notificacoes: false
      });
    }
    catch (e) {
      if (next) {
        localStorage.removeItem(
          'bet_push_consent_v1'
        );

        save({
          notificacoes: false
        });
      }

      alert(
        e?.message ||
        'Nao foi possivel alterar as notificacoes.'
      );
    }
  }

  async function testarPush() {
    try {
      if (!config.notificacoes) {
        throw new Error(
          'Ative as notificacoes antes de enviar o teste.'
        );
      }

      if (
        typeof testarNotificacao !==
        'function'
      ) {
        throw new Error(
          'Teste Push indisponivel.'
        );
      }

      const resultado =
        await testarNotificacao();

      alert(
        `Push enviado para ${resultado?.enviados || 0} dispositivo(s).`
      );
    }
    catch (e) {
      alert(
        e?.message ||
        'Nao foi possivel enviar a notificacao de teste.'
      );
    }
  }

  return (
    <main className="w-full animate-fade-in px-3 pb-28 pt-3 sm:px-4">
      <section className="relative isolate overflow-hidden rounded-[30px] bg-[#080c16] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] ring-1 ring-inset ring-slate-400/10 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(71,85,105,0.24),transparent_40%),radial-gradient(circle_at_90%_100%,rgba(37,99,235,0.13),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-slate-300">
              <Settings className="h-3.5 w-3.5" />
              Conta e sistema
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-black ring-1 ring-inset ${
                vipActive
                  ? 'bg-yellow-400/10 text-yellow-300 ring-yellow-400/20'
                  : 'bg-white/[0.04] text-slate-500 ring-white/[0.06]'
              }`}
            >
              {vipActive ? <Crown className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {vipActive ? 'PRO ATIVO' : 'PLANO FREE'}
            </span>
          </div>

          <h1 className="mt-5 text-[27px] font-black leading-[1.08] tracking-[-0.035em] text-white sm:text-3xl">
            Configurações
          </h1>
          <p className="mt-3 max-w-xl text-[11px] font-medium leading-5 text-slate-400">
            Preferências, notificações, segurança e dados do aplicativo.
          </p>

          <div className="mt-6 grid grid-cols-2 divide-x divide-white/[0.06] overflow-hidden rounded-2xl bg-white/[0.035] py-3 ring-1 ring-inset ring-white/[0.055]">
            <div className="min-w-0 px-3 text-center">
              <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">
                Plano
              </p>
              <p className="mt-1 truncate text-sm font-black text-yellow-300">
                {plan}
              </p>
            </div>
            <div className="min-w-0 px-3 text-center">
              <p className="text-[7px] font-black uppercase tracking-wider text-slate-700">
                Conta
              </p>
              <p className="mt-1 truncate text-[10px] font-black text-slate-300">
                {email}
              </p>
            </div>
          </div>
        </div>
      </section>

      {modoDemo && (
        <section className="mt-4 flex items-start gap-3 rounded-[22px] bg-amber-500/[0.055] px-4 py-4 ring-1 ring-inset ring-amber-500/10">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <div>
            <p className="text-[10px] font-black text-amber-200">
              Modo demonstração ativo
            </p>
            <p className="mt-1 text-[9px] font-medium leading-relaxed text-amber-100/55">
              Alguns dados permanecem simulados até a integração completa da API.
            </p>
          </div>
        </section>
      )}

      <Section eyebrow="Preferências" title="Aplicativo e inteligência">
        <SettingRow
          icon={Crown}
          title="Meu plano"
          description={vipActive ? 'Assinatura PRO ativa' : 'Plano gratuito'}
          accent="text-yellow-300"
          onClick={() => setViewMode?.('vip-pro')}
        />
        <div className="border-t border-white/[0.055]" />
        <SettingRow
          icon={Wallet}
          title="Limite de banca"
          description={`Limite diário sugerido: R$ ${Number(
            config.limiteDiario || 0
          ).toFixed(2)}`}
          accent="text-emerald-300"
          onClick={() => setViewMode?.('banca-pro')}
        />
        <div className="border-t border-white/[0.055]" />
        <SettingRow
          icon={Bell}
          title="Notificações"
          description={
            config.notificacoes
              ? 'Push nativo autorizado neste dispositivo'
              : 'Toque para autorizar Push no Android'
          }
          accent="text-amber-300"
          onClick={toggleNotifications}
          control={<Toggle active={config.notificacoes} />}
        />

        {config.notificacoes && (
          <>
            <div className="border-t border-white/[0.055]" />
            <SettingRow
              icon={Bell}
              title="Testar Push"
              description="Enviar uma notificacao para este dispositivo"
              accent="text-cyan-300"
              onClick={testarPush}
            />
          </>
        )}

        <div className="border-t border-white/[0.055]" />
        <SettingRow
          icon={Brain}
          title="Preferências da IA"
          description={
            config.iaConservadora
              ? 'Modo conservador ativo'
              : 'Modo agressivo demonstrativo'
          }
          accent="text-blue-300"
          onClick={() =>
            save({ iaConservadora: !config.iaConservadora })
          }
          control={<Toggle active={config.iaConservadora} />}
        />
        <div className="border-t border-white/[0.055]" />
        <SettingRow
          icon={Moon}
          title="Tema"
          description="Interface escura otimizada para análise"
          accent="text-violet-300"
          onClick={() => save({ tema: 'escuro' })}
        />
        <div className="border-t border-white/[0.055]" />
        <SettingRow
          icon={FlaskConical}
          title="Modo demonstração"
          description="Entenda quais informações são simuladas"
          accent="text-amber-300"
          onClick={() => setViewMode?.('modo-demo')}
        />
      </Section>

      <Section eyebrow="Proteção" title="Legal e segurança">
        <SettingRow
          icon={ShieldCheck}
          title="Jogo responsável"
          description="Controle de risco, +18 e proteção de banca"
          accent="text-emerald-300"
          onClick={() => setViewMode?.('termos')}
        />
        <div className="border-t border-white/[0.055]" />
        <SettingRow
          icon={FileText}
          title="Termos e privacidade"
          description="Política, aviso legal e condições de uso"
          accent="text-slate-300"
          onClick={() => setViewMode?.('termos')}
        />
        <div className="border-t border-white/[0.055]" />
        <SettingRow
          icon={LifeBuoy}
          title="Suporte"
          description="betanlyticspro@gmail.com"
          accent="text-cyan-300"
          onClick={() => {
            window.location.href = 'mailto:betanlyticspro@gmail.com';
          }}
        />
      </Section>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={askAI}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 text-[9px] font-black uppercase tracking-wide text-white transition hover:bg-blue-500 active:scale-[0.99]"
        >
          <Sparkles className="h-4 w-4" />
          Configurar com IA
        </button>

        <button
          type="button"
          onClick={resetOnboarding}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/[0.035] px-3 text-[9px] font-black uppercase tracking-wide text-slate-300 ring-1 ring-inset ring-white/[0.06] active:scale-[0.99]"
        >
          <RotateCcw className="h-4 w-4" />
          Ver onboarding
        </button>
      </div>

      <button
        type="button"
        onClick={logout}
        className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-500/[0.07] px-3 text-[9px] font-black uppercase tracking-wide text-red-300 ring-1 ring-inset ring-red-500/15 active:scale-[0.99]"
      >
        <LogOut className="h-4 w-4" />
        Sair da conta
      </button>
    </main>
  );
}
