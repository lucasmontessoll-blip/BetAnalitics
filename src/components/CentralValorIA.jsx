import React, { useMemo, useState } from 'react';
import {
  Brain,
  Bell,
  Wallet,
  Crown,
  Star,
  ShieldCheck,
  TrendingUp,
  Target,
  ChevronRight,
  BarChart3,
  Landmark,
  X
} from 'lucide-react';

function normalizarJogo(jogo, index) {
  return {
    id: jogo?.id || 'demo-' + index,
    casa: jogo?.home_team || jogo?.time_casa || 'Flamengo',
    fora: jogo?.away_team || jogo?.time_fora || 'Palmeiras',
    liga: jogo?.league_name || jogo?.liga || 'Brasil Serie A',
    confianca: Number(jogo?.confianca_ia || jogo?.confianca || 86),
    odd: Number(jogo?.odd_principal || jogo?.odd || 1.85),
    mercado: jogo?.mercado_principal || jogo?.mercado || 'Mais de 1.5 gols',
    raw: jogo,
  };
}

const demos = [
  { id: 'ia-demo-1', casa: 'Flamengo', fora: 'Palmeiras', liga: 'Brasil Serie A', confianca: 91, odd: 1.82, mercado: 'Mais de 1.5 gols' },
  { id: 'ia-demo-2', casa: 'Liverpool', fora: 'Arsenal', liga: 'Premier League', confianca: 88, odd: 1.95, mercado: 'Ambos marcam' },
  { id: 'ia-demo-3', casa: 'Real Madrid', fora: 'Barcelona', liga: 'LaLiga', confianca: 87, odd: 2.10, mercado: 'Mais de 2.5 gols' },
];

function CardAcao({ icon: Icone, titulo, texto, cor, onClick }) {
  return (
          </div>
        </div>

        {perguntasAberta && (
          <div className="bg-[#050816] border border-blue-500/20 rounded-3xl p-3 mb-4 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest">
                  Perguntas rapidas
                </div>

                <div className="text-sm text-white font-black">
                  Assistente IA
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPerguntasAberta(false)}
                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="grid gap-2">
              {perguntasRapidas.map((pergunta) => (
                <button
                  key={pergunta}
                  type="button"
                  onClick={() => abrirPergunta(pergunta)}
                  className="w-full bg-[#0b1020] border border-white/10 rounded-2xl px-4 py-3 text-left text-xs font-bold text-slate-300 flex items-center justify-between active:scale-[0.99]"
                >
                  {pergunta}
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {oportunidades.map((jogo, index) => {
            const ev = Math.max(4, Math.round(((jogo.confianca / 100) * jogo.odd - 1) * 100));

            return (
              <button
                key={jogo.id}
                type="button"
                onClick={() => setJogoSelecionado?.(jogo.raw || jogo)}
                className="w-full bg-[#050816] border border-white/10 rounded-2xl p-4 text-left active:scale-[0.99]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 font-black uppercase">
                    {jogo.liga}
                  </span>

                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                    EV +{ev}%
                  </span>
                </div>

                <div className="text-sm font-black text-white">
                  {index + 1}. {jogo.casa} x {jogo.fora}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-[11px] text-slate-400 font-bold">
                    {jogo.mercado} • Odd {jogo.odd.toFixed(2)}
                  </div>

                  <div className="text-xs font-black text-blue-400">
                    {jogo.confianca}%
                  </div>
                </div>

                <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: Math.min(96, Math.max(20, jogo.confianca)) + '%' }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-5">
        <button
          type="button"
          onClick={() => setViewMode?.('favoritos')}
          className="bg-[#0f172a] border border-white/10 rounded-2xl p-3 text-xs font-black text-white flex flex-col items-center gap-2 active:scale-[0.98]"
        >
          <Star className="w-5 h-5 text-yellow-400" />
          Favoritos
        </button>

        <button
          type="button"
          onClick={() => setViewMode?.('Ranking')}
          className="bg-[#0f172a] border border-white/10 rounded-2xl p-3 text-xs font-black text-white flex flex-col items-center gap-2 active:scale-[0.98]"
        >
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Ranking
        </button>

        <button
          type="button"
          onClick={() => abrirPergunta('Analise os jogos de hoje.')}
          className="bg-[#0f172a] border border-white/10 rounded-2xl p-3 text-xs font-black text-white flex flex-col items-center gap-2 active:scale-[0.98]"
        >
          <Target className="w-5 h-5 text-blue-400" />
          Analisar
        </button>
      </div>
    </div>
  );
}
