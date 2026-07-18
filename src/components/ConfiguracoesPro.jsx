import React, { useState } from 'react';
import {
  ArrowLeft,
  Settings,
  Crown,
  Bell,
  Wallet,
  Moon,
  ShieldCheck,
  FileText,
  LifeBuoy,
  LogOut,
  Brain,
  FlaskConical,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

function lerConfig() {
  try {
    return JSON.parse(localStorage.getItem('bet_config_pro_v1') || 'null') || {
      notificacoes: true,
      tema: 'escuro',
      moeda: 'BRL',
      limiteDiario: 50,
      iaConservadora: true,
    };
  } catch {
    return {
      notificacoes: true,
      tema: 'escuro',
      moeda: 'BRL',
      limiteDiario: 50,
      iaConservadora: true,
    };
  }
}

function LinhaConfig({ icon: Icone, titulo, texto, cor = 'text-blue-400', onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-[#050816] border border-white/10 rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.99]"
    >
      <div className="w-11 h-11 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center shrink-0">
        <Icone className={'w-5 h-5 ' + cor} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-black text-white uppercase truncate">{titulo}</div>
        <div className="text-[10px] text-slate-500 font-bold mt-1 truncate">{texto}</div>
      </div>

      {children || <ChevronRight className="w-5 h-5 text-slate-600 shrink-0" />}
    </button>
  );
}

export default function ConfiguracoesPro({
  userData,
  setViewMode,
  solicitarPermissaoNotificacao,
  setAiOpen,
  setAiQuery,
  modoDemo = true,
}) {
  const [config, setConfig] = useState(lerConfig);

  const salvar = (patch) => {
    const proximo = { ...config, ...patch };
    setConfig(proximo);

    try {
      localStorage.setItem('bet_config_pro_v1', JSON.stringify(proximo));
    } catch {}
  };

  const sair = () => {
    localStorage.removeItem('bet_sessao_ativa');
    localStorage.removeItem('bet_user_nome');
    localStorage.removeItem('bet_user_email');
    window.location.reload();
  };

  const resetOnboarding = () => {
    localStorage.removeItem('bet_onboarding_pro_v1');
    window.location.reload();
  };

  const perguntarIA = () => {
    setAiQuery?.('Me ajude a configurar o BetAnalytics PRO de forma conservadora e segura.');
    setAiOpen?.(true);
  };

  const plano = userData?.is_vip ? 'VIP PRO ativo' : 'Plano gratuito';

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => setViewMode?.('perfil')}
          className="w-10 h-10 rounded-full bg-[#0f172a] border border-white/10 flex items-center justify-center active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div>
          <div className="text-xl font-black text-white">Configurações PRO</div>
          <div className="text-[11px] text-slate-500 font-bold">Preferências, segurança e dados do app</div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-gradient-to-br from-slate-800 via-blue-900 to-slate-950 border border-blue-300/20 p-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-3xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center">
            <Settings className="w-7 h-7 text-blue-300" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-blue-200 font-black uppercase tracking-widest">Conta e sistema</div>
            <div className="text-lg font-black text-white truncate">{plano}</div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1 truncate">
              {userData?.email || 'Usuário demo'}
            </div>
          </div>
        </div>
      </div>

      {modoDemo && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-4 mb-5 flex gap-3">
          <FlaskConical className="w-5 h-5 text-amber-300 shrink-0" />
          <div>
            <div className="text-xs font-black text-amber-300 uppercase">Modo Demonstração ativo</div>
            <div className="text-[11px] text-amber-100/70 font-semibold mt-1">
              Dados simulados até a API real ser conectada.
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 mb-5">
        <div className="text-sm font-black text-white mb-3 uppercase">Atalhos principais</div>

        <div className="space-y-3">
          <LinhaConfig
            icon={Crown}
            titulo="Meu plano"
            texto={plano}
            cor="text-yellow-400"
            onClick={() => setViewMode?.('vip-pro')}
          />

          <LinhaConfig
            icon={Wallet}
            titulo="Limite de banca"
            texto={'Limite diário sugerido: R$ ' + Number(config.limiteDiario || 0).toFixed(2)}
            cor="text-emerald-400"
            onClick={() => setViewMode?.('banca-pro')}
          />

          <LinhaConfig
            icon={Bell}
            titulo="Notificações"
            texto={config.notificacoes ? 'Alertas IA ativados' : 'Alertas IA desativados'}
            cor="text-amber-400"
            onClick={() => {
              salvar({ notificacoes: !config.notificacoes });
              solicitarPermissaoNotificacao?.();
            }}
          />

          <LinhaConfig
            icon={Brain}
            titulo="Preferências da IA"
            texto={config.iaConservadora ? 'Modo conservador ativo' : 'Modo agressivo demonstrativo'}
            cor="text-blue-400"
            onClick={() => salvar({ iaConservadora: !config.iaConservadora })}
          />

          <LinhaConfig
            icon={FlaskConical}
            titulo="Modo demonstração"
            texto="Entenda quais dados são simulados"
            cor="text-amber-300"
            onClick={() => setViewMode?.('modo-demo')}
          />
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 mb-5">
        <div className="text-sm font-black text-white mb-3 uppercase">Legal e segurança</div>

        <div className="space-y-3">
          <LinhaConfig
            icon={ShieldCheck}
            titulo="Jogo responsável"
            texto="Controle de risco, +18 e proteção de banca"
            cor="text-emerald-400"
            onClick={() => setViewMode?.('termos')}
          />

          <LinhaConfig
            icon={FileText}
            titulo="Termos e privacidade"
            texto="Política, aviso legal e condições de uso"
            cor="text-slate-300"
            onClick={() => setViewMode?.('termos')}
          />

          <LinhaConfig
            icon={LifeBuoy}
            titulo="Suporte"
            texto="betanlyticspro@gmail.com"
            cor="text-cyan-400"
            onClick={() => { window.location.href = 'mailto:betanlyticspro@gmail.com'; }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          type="button"
          onClick={perguntarIA}
          className="h-14 rounded-2xl bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Brain className="w-4 h-4" />
          Perguntar IA
        </button>

        <button
          type="button"
          onClick={resetOnboarding}
          className="h-14 rounded-2xl bg-[#0f172a] border border-white/10 text-white text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          Ver onboarding
        </button>
      </div>

      <button
        type="button"
        onClick={sair}
        className="w-full h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        <LogOut className="w-5 h-5" />
        Sair da conta
      </button>
    </div>
  );
}
