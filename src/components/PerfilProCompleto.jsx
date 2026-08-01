import React, { useMemo } from 'react';
import { User, Crown, Settings, Star, Bell, Wallet, BarChart3, Brain, Landmark, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';

function lerArray(chave) {
  try {
    const v = JSON.parse(localStorage.getItem(chave) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function lerFavoritos() {
  try {
    const v = JSON.parse(localStorage.getItem('bet_favoritos_pro_v1') || '{}');
    return Object.values(v).flat().length || 0;
  } catch {
    return 0;
  }
}

function CardAtalho({ icon: Icone, titulo, texto, cor, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 text-left active:scale-[0.98]"
    >
      <div className={'w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ' + cor}>
        <Icone className="w-5 h-5 text-white" />
      </div>

      <div className="text-sm font-black text-white">{titulo}</div>
      <div className="text-[11px] text-slate-500 font-semibold mt-1 leading-relaxed">{texto}</div>
    </button>
  );
}

function Linha({ icon: Icone, titulo, texto, onClick, cor = 'text-blue-400' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-[#050816] border border-white/10 rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.99]"
    >
      <div className="w-10 h-10 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center shrink-0">
        <Icone className={'w-5 h-5 ' + cor} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-black text-white truncate">{titulo}</div>
        <div className="text-[10px] text-slate-500 font-bold truncate">{texto}</div>
      </div>

      <ChevronRight className="w-5 h-5 text-slate-600 shrink-0" />
    </button>
  );
}

export default function PerfilProCompleto({ userData, setViewMode, setAiOpen, setAiQuery }) {
  const stats = useMemo(() => {
    const historico = lerArray('betanalytics_historico_ia_v1');
    const favoritos = lerFavoritos();
    const banca = lerArray('bet_banca_historico_v2');

    return {
      historico: historico.length || 3,
      favoritos: favoritos || 5,
      banca: banca.length || 3,
    };
  }, []);

  const nome = userData?.nome || localStorage.getItem('bet_user_nome') || 'Usuário BetAnalytics';
  const email = userData?.email || localStorage.getItem('bet_user_email') || 'demo@betanalytics.pro';
  const isVip = Boolean(userData?.is_vip);

  const sair = () => {
    localStorage.removeItem('bet_sessao_ativa');
    localStorage.removeItem('bet_user_nome');
    localStorage.removeItem('bet_user_email');
    window.location.reload();
  };

  const perguntar = () => {
    setAiQuery?.('Analise meu perfil e diga quais recursos do app devo usar primeiro.');
    setAiOpen?.(true);
  };

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 border border-blue-300/20 p-5 mb-5 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative flex items-center gap-4">
          <div className="w-20 h-20 rounded-[2rem] bg-blue-500/15 border border-blue-400/30 flex items-center justify-center shrink-0">
            <User className="w-10 h-10 text-blue-300" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-blue-200 font-black uppercase tracking-widest">Perfil PRO</div>
            <div className="text-2xl font-black text-white truncate">{nome}</div>
            <div className="text-xs text-slate-300 font-bold truncate">{email}</div>

            <div className={'inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full border text-[10px] font-black uppercase ' + (isVip ? 'bg-yellow-500/15 border-yellow-400/30 text-yellow-300' : 'bg-white/5 border-white/10 text-slate-400')}>
              <Crown className="w-3 h-3" />
              {isVip ? 'VIP PRO ativo' : 'Plano gratuito'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-3">
          <div className="text-2xl font-black text-blue-400">{stats.historico}</div>
          <div className="text-[9px] text-slate-500 font-black uppercase">Análises</div>
        </div>

        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-3">
          <div className="text-2xl font-black text-yellow-400">{stats.favoritos}</div>
          <div className="text-[9px] text-slate-500 font-black uppercase">Favoritos</div>
        </div>

        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-3">
          <div className="text-2xl font-black text-emerald-400">{stats.banca}</div>
          <div className="text-[9px] text-slate-500 font-black uppercase">Banca</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <CardAtalho icon={Crown} titulo="Área VIP" texto="Plano, benefícios e assinatura." cor="bg-yellow-600" onClick={() => setViewMode?.('vip-pro')} />
        <CardAtalho icon={Brain} titulo="Central IA" texto="Radar e oportunidades." cor="bg-blue-600" onClick={() => setViewMode?.('radar')} />
        <CardAtalho icon={BarChart3} titulo="Performance" texto="Assertividade e mercados fortes." cor="bg-emerald-600" onClick={() => setViewMode?.('performance-ia')} />
        <CardAtalho icon={Landmark} titulo="Parceiros" texto="Casas e afiliados." cor="bg-purple-600" onClick={() => setViewMode?.('casas-parceiras')} />
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 mb-5">
        <div className="text-sm font-black text-white uppercase mb-3">Minha conta</div>

        <div className="space-y-3">
          <Linha icon={Star} titulo="Favoritos PRO" texto="Times, ligas, jogos e alertas salvos" cor="text-yellow-400" onClick={() => setViewMode?.('favoritos')} />
          <Linha icon={Bell} titulo="Alertas IA" texto="Alertas de odds, banca e oportunidades" cor="text-amber-400" onClick={() => setViewMode?.('alertas-ia')} />
          <Linha icon={Wallet} titulo="Gestão de Banca" texto="Stake, ROI, lucro e controle de risco" cor="text-emerald-400" onClick={() => setViewMode?.('banca-pro')} />
          <Linha icon={BarChart3} titulo="Histórico IA PRO" texto="Análises abertas, Green, Red, lucro e ROI" cor="text-blue-400" onClick={() => setViewMode?.('historico')} />
          <Linha icon={Settings} titulo="Configurações PRO" texto="Conta, notificações, termos e modo demo" cor="text-slate-300" onClick={() => setViewMode?.('config')} />
          <Linha icon={ShieldCheck} titulo="Jogo responsável" texto="+18, avisos legais e controle" cor="text-cyan-400" onClick={() => setViewMode?.('termos')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={perguntar}
          className="h-14 rounded-2xl bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Brain className="w-4 h-4" />
          Perguntar IA
        </button>

        <button
          type="button"
          onClick={sair}
          className="h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );
}
