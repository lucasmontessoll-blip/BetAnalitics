import React from 'react';
import { Crown, CheckCircle2, Lock, Zap, ShieldCheck, Bell, Wallet, Brain, Gift } from 'lucide-react';

const beneficios = [
  { titulo: 'Radar IA completo', texto: 'Ranking de oportunidades com confiança, risco e value bet.', icon: Brain },
  { titulo: 'Gestão de banca', texto: 'Controle de stake, ROI, lucro, histórico e proteção de risco.', icon: Wallet },
  { titulo: 'Alertas inteligentes', texto: 'Alertas de odds, favoritos, oportunidades e jogos em destaque.', icon: Bell },
  { titulo: 'Análises avançadas', texto: 'Probabilidade, odd justa, mercado recomendado e explicação da IA.', icon: Zap },
  { titulo: 'Jogo responsável', texto: 'Limites, avisos de risco e proteção contra excesso de exposição.', icon: ShieldCheck },
];

function Linha({ children, ativo = true }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
      {ativo ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-600" />}
      <span className={ativo ? '' : 'text-slate-600'}>{children}</span>
    </div>
  );
}

export default function VipPro({ userData, setViewMode, setAiOpen, setAiQuery }) {
  const isVip = Boolean(userData?.is_vip);

  const perguntarIA = () => {
    setAiQuery?.('Explique as vantagens do plano PRO e como ele pode ajudar na análise dos jogos.');
    setAiOpen?.(true);
  };

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="flex items-center gap-3 mb-4">
        

        <div>
          <div className="text-xl font-black text-white">Área VIP PRO</div>
          <div className="text-[11px] text-slate-500 font-bold">Plano, benefícios e recursos premium</div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-gradient-to-br from-yellow-500 via-orange-600 to-purple-800 p-5 border border-yellow-300/30 shadow-2xl overflow-hidden relative mb-5">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/15 blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-yellow-100 mb-3">
            <Crown className="w-4 h-4" />
            BetAnalytics PRO
          </div>

          <h1 className="text-3xl font-black leading-tight text-white">
            Desbloqueie a central profissional
          </h1>

          <p className="text-xs text-yellow-100/90 font-semibold mt-3 leading-relaxed">
            Mais recursos para análise, controle de banca, alertas e tomada de decisão com IA.
          </p>

          <div className="mt-5 flex items-end gap-2">
            <div className="text-4xl font-black text-white">R$ 29,90</div>
            <div className="text-xs font-bold text-yellow-100 mb-1">/mês</div>
          </div>

          <div className="mt-2 text-[10px] font-bold text-yellow-100/80">
            Valor demonstrativo. Ajuste o preço conforme sua estratégia comercial.
          </div>
        </div>
      </div>

      {isVip && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-4 mb-5 flex gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="text-sm font-black text-emerald-300">VIP ativo</div>
            <div className="text-xs text-emerald-100/70 font-semibold mt-1">
              Sua conta já está marcada como PRO.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4">
          <div className="text-sm font-black text-white mb-3">Grátis</div>
          <div className="space-y-3">
            <Linha>Jogos básicos</Linha>
            <Linha>Análises limitadas</Linha>
            <Linha>Favoritos simples</Linha>
            <Linha ativo={false}>Radar IA completo</Linha>
            <Linha ativo={false}>Gestão de banca</Linha>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-yellow-400" />
            <div className="text-sm font-black text-yellow-300">PRO</div>
          </div>

          <div className="space-y-3">
            <Linha>Radar IA completo</Linha>
            <Linha>Alertas inteligentes</Linha>
            <Linha>Gestão de banca</Linha>
            <Linha>Value bets</Linha>
            <Linha>Comparador de odds</Linha>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {beneficios.map((item) => {
          const Icone = item.icon;

          return (
            <div key={item.titulo} className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 flex gap-3">
              <div className="w-11 h-11 rounded-2xl bg-yellow-500/10 border border-yellow-400/20 flex items-center justify-center shrink-0">
                <Icone className="w-5 h-5 text-yellow-400" />
              </div>

              <div>
                <div className="text-sm font-black text-white">{item.titulo}</div>
                <div className="text-[11px] text-slate-500 font-semibold mt-1 leading-relaxed">{item.texto}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-5 h-5 text-purple-400" />
          <div className="text-sm font-black text-white">Oferta comercial</div>
        </div>

        <div className="text-xs text-slate-400 font-semibold leading-relaxed">
          Mostre essa tela para vender o app com mais força: ela explica claramente o que o usuário ganha no plano PRO.
        </div>
      </div>

      <button
        type="button"
        onClick={() => setViewMode?.('perfil')}
        className="w-full h-14 rounded-2xl bg-yellow-500 text-black font-black text-sm active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Crown className="w-5 h-5" />
        Abrir assinatura PRO
      </button>

      <button
        type="button"
        onClick={perguntarIA}
        className="w-full h-12 rounded-2xl bg-blue-600 text-white font-black text-xs mt-3 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <span>{'\u{1F916}'}</span>
        Perguntar para IA sobre o PRO
      </button>
    </div>
  );
}
