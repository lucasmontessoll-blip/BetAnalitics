import { temAcessoPro } from '../utils/acessoPro.js';
﻿import React, { useMemo } from 'react';
import {
  Crown,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sparkles,
  CreditCard,
  CalendarDays,
  TrendingUp,
  Brain,
  Lock,
  Zap
} from 'lucide-react';

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function LinhaComparativo({ texto, free, pro }) {
  return (
    <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr] gap-2 items-center border-b border-white/5 py-3 text-[11px]">
      <div className="font-bold text-slate-300">{texto}</div>

      <div className="flex justify-center">
        {free ? (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ) : (
          <XCircle className="w-4 h-4 text-slate-600" />
        )}
      </div>

      <div className="flex justify-center">
        {pro ? (
          <CheckCircle2 className="w-4 h-4 text-yellow-300" />
        ) : (
          <XCircle className="w-4 h-4 text-slate-600" />
        )}
      </div>
    </div>
  );
}

function Beneficio({ icon: Icon, titulo, texto }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-yellow-300" />
        <div className="text-sm font-black text-white">{titulo}</div>
      </div>
      <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
        {texto}
      </p>
    </div>
  );
}

function Plano({ destaque, titulo, preco, periodo, economia, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-[28px] p-5 border shadow-xl active:scale-[0.99] ${
        destaque
          ? 'bg-gradient-to-br from-yellow-500/25 via-[#0f172a] to-green-500/10 border-yellow-400/40'
          : 'bg-[#0f172a] border-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {destaque && (
            <div className="inline-flex items-center gap-1 bg-yellow-400 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase mb-3">
              <Sparkles className="w-3 h-3" />
              Melhor escolha
            </div>
          )}

          <div className="text-lg font-black text-white">{titulo}</div>
          <div className="text-[11px] font-bold text-slate-400 mt-1">
            {periodo}
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-yellow-300">
            {dinheiro(preco)}
          </div>
          {economia && (
            <div className="text-[10px] font-black text-green-400 mt-1">
              {economia}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function AreaProAssinatura({
  userData,
  setMenuAtivo,
  setViewMode,
  iniciarPagamento,
}) {
  const dados = useMemo(() => {
    const vipAtivo = temAcessoPro(userData);
    const plano = userData?.plano || (vipAtivo ? 'PRO' : 'Free');
    const vencimento = userData?.vip_expira || userData?.vip_expira_em || userData?.vencimento || 'Apos pagamento aprovado';

    return {
      vipAtivo,
      plano,
      vencimento,
      mensal: 29.90,
      anual: 299.90
    };
  }, [userData]);

  function assinar(plano) {
    if (typeof iniciarPagamento === 'function') {
      iniciarPagamento(plano);
      return;
    }

    setMenuAtivo('pagamento');
  }

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="bg-gradient-to-br from-yellow-500/25 via-[#0f172a] to-blue-500/10 border border-yellow-500/30 rounded-[32px] p-5 mb-5 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center">
            <Crown className="w-6 h-6 text-yellow-300" />
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
              Assinatura premium
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">
              BetAnalytics PRO
            </h2>
          </div>
        </div>

        <p className="text-[12px] text-slate-400 font-bold leading-relaxed">
          Desbloqueie Radar IA, análise completa dos jogos, gestão de banca, histórico da IA e oportunidades com maior confiança.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
            <div className="text-[9px] text-slate-400 font-black uppercase">
              Status
            </div>
            <div className={`text-lg font-black ${dados.vipAtivo ? 'text-green-400' : 'text-slate-300'}`}>
              {dados.vipAtivo ? 'PRO ativo' : 'Free'}
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
            <div className="text-[9px] text-slate-400 font-black uppercase">
              Plano
            </div>
            <div className="text-lg font-black text-yellow-300">
              {dados.plano}
            </div>
          </div>
        </div>

        {dados.vipAtivo && (
          <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-2xl p-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-green-300" />
            <div className="text-[11px] font-bold text-green-200 h-4 text-green-300" />
            <div className="text-[11px] font-bold text-green-200">
              Sua assinatura está ativa. Vencimento: {dados.vencimento}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Beneficio
          icon={Brain}
          titulo="IA PRO"
          texto="Explicações inteligentes, confiança da análise e leitura rápida dos melhores jogos."
        />

        <Beneficio
          icon={TrendingUp}
          titulo="Radar IA"
          texto="Ranking com oportunidades, odds de valor e jogos com maior potencial."
        />

        <Beneficio
          icon={Lock}
          titulo="Recursos VIP"
          texto="Bloqueio premium para liberar detalhes avançados apenas para assinantes."
        />

        <Beneficio
          icon={Zap}
          titulo="Gestão"
          texto="Controle de banca, histórico e visão mais profissional das entradas."
        />
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-yellow-300" />
          <h3 className="text-sm font-black text-white uppercase">
            Escolha seu plano
          </h3>
        </div>

        <div className="space-y-3">
          <Plano
            titulo="Plano Mensal"
            preco={dados.mensal}
            periodo="Acesso PRO por 30 dias"
            onClick={() => assinar('mensal')}
          />

          <Plano
            destaque
            titulo="Plano Anual"
            preco={dados.anual}
            periodo="Acesso PRO por 12 meses"
            economia="Economize 2 meses"
            onClick={() => assinar('anual')}
          />
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 mb-5">
        <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr] gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/10 pb-3">
          <div>Recurso</div>
          <div className="text-center">Free</div>
          <div className="text-center text-yellow-300">PRO</div>
        </div>

        <LinhaComparativo texto="Ver jogos básicos" free pro />
        <LinhaComparativo texto="Radar IA completo" free={false} pro />
        <LinhaComparativo texto="Análise detalhada do jogo" free={false} pro />
        <LinhaComparativo texto="Gestão de banca" free={false} pro />
        <LinhaComparativo texto="Histórico da IA" free={false} pro />
        <LinhaComparativo texto="Alertas premium" free={false} pro />
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-4">
        <div className="flex gap-3">
          <ShieldAlert className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-black text-red-200 mb-1">
              Aviso importante
            </div>
            <p className="text-[11px] font-bold text-red-100/80 leading-relaxed">
              As análises são informativas e não garantem lucro. Apostas envolvem risco.
              O usuário é responsável por suas decisões.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
