import React from 'react';
import { Zap } from 'lucide-react';

export default function ConsensoIA({ jogo }) {
  // Puxa os dados reais ou usa fallback
  const forma = jogo?.homeStats?.form || 89;
  const ataque = jogo?.homeStats?.attack || 92;
  const defesa = 83; // Substitua por dados reais do seu crawler
  const odds = 94;   // Substitua por dados reais do seu crawler

  const final = Math.round((forma + ataque + defesa + odds) / 4);

  return (
    <div className="bg-[#0f172a] border border-white/5 shadow-lg rounded-3xl p-5 mb-4">
      <h3 className="font-black mb-4 text-white flex items-center gap-2 uppercase tracking-wider text-sm">
        <Zap className="w-4 h-4 text-yellow-400" />
        Consenso IA
      </h3>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-slate-300 font-bold mb-1"><span>Forma</span><span>{forma}%</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${forma}%`}}></div></div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-300 font-bold mb-1"><span>Ataque</span><span>{ataque}%</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full"><div className="bg-purple-500 h-1.5 rounded-full" style={{width: `${ataque}%`}}></div></div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-300 font-bold mb-1"><span>Defesa</span><span>{defesa}%</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full"><div className="bg-slate-400 h-1.5 rounded-full" style={{width: `${defesa}%`}}></div></div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-300 font-bold mb-1"><span>Força das Odds</span><span>{odds}%</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full"><div className="bg-yellow-500 h-1.5 rounded-full" style={{width: `${odds}%`}}></div></div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/10 text-green-400 font-black text-xl flex justify-between items-center">
        <span className="text-xs text-slate-400 uppercase tracking-widest">Confiança Final</span>
        <span>{final}%</span>
      </div>
    </div>
  );
}