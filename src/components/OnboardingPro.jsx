import React, { useState } from 'react';
import { ShieldCheck, Brain, Bell, ChevronRight } from 'lucide-react';

const telas = [
  {
    titulo: 'Bem-vindo ao BetAnalytics PRO',
    subtitulo: 'Um painel inteligente para acompanhar jogos, oportunidades, banca e analises com IA.',
    icone: Brain,
  },
  {
    titulo: 'IA com foco em oportunidade',
    subtitulo: 'A IA considera confianca, risco, odds, value bet, mercado e contexto do jogo antes de sugerir algo.',
    icone: ShieldCheck,
  },
  {
    titulo: 'Alertas e jogo responsavel',
    subtitulo: 'Use alertas, controle de banca e limites. O app e uma ferramenta de analise, nao promessa de ganho.',
    icone: Bell,
  },
];

export default function OnboardingPro({ onFinish }) {
  const [atual, setAtual] = useState(0);
  const tela = telas[atual];
  const Icone = tela.icone;

  const avancar = () => {
    if (atual < telas.length - 1) {
      setAtual((v) => v + 1);
      return;
    }

    onFinish?.();
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col px-5 py-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-[2rem] bg-blue-500/15 border border-blue-400/30 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.25)] mb-8">
          <Icone className="w-12 h-12 text-blue-400" />
        </div>

        <div className="text-[10px] font-black tracking-[0.28em] uppercase text-blue-300 mb-3">
          BetAnalytics PRO
        </div>

        <h1 className="text-3xl font-black leading-tight mb-4">
          {tela.titulo}
        </h1>

        <p className="text-sm text-slate-400 font-semibold leading-relaxed max-w-sm">
          {tela.subtitulo}
        </p>

        <div className="flex gap-2 mt-8">
          {telas.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${i === atual ? 'w-8 bg-blue-500' : 'w-2 bg-white/15'}`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={avancar}
        className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {atual < telas.length - 1 ? 'Continuar' : 'Comecar agora'}
        <ChevronRight className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={onFinish}
        className="mt-4 text-xs font-bold text-slate-500"
      >
        Pular introducao
      </button>
    </div>
  );
}
