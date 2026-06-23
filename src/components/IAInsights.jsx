import React from "react";
import { Brain, Flame, Target, ShieldAlert } from "lucide-react";

export default function IAInsights({ jogos = [] }) {
  if (!jogos || jogos.length === 0) return null;

  // Algoritmo de filtragem rápida (protegido contra dados nulos)
  // Se não houver 'ev', ele usa a 'confianca_ia' para classificar a melhor aposta
  const melhorAposta = [...jogos].sort((a, b) => (b.ev || b.confianca_ia || 0) - (a.ev || a.confianca_ia || 0))[0];
  
  const melhorOver = [...jogos]
    .filter(j => (j.over25 && j.over25 > 70) || (j.homeStats && j.homeStats.attack > 80) || j.confianca_ia > 85)
    .sort((a, b) => (b.confianca_ia || 0) - (a.confianca_ia || 0))[0];
  
  const zebra = [...jogos]
    .filter(j => (j.odd_principal || j.oddPrincipal || 0) > 3)
    .sort((a, b) => (b.confianca_ia || 0) - (a.confianca_ia || 0))[0];

  // Se a IA não encontrar nenhum dos 3 cenários, oculta o painel para não ficar um espaço vazio
  if (!melhorAposta && !melhorOver && !zebra) return null;

  return (
    <div className="bg-[#111827] border border-blue-500/30 rounded-2xl p-4 mt-4 shadow-lg transform-gpu">
      <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Brain className="w-4 h-4" /> Conclusões da IA
      </h3>
      
      <div className="grid gap-2">
        {melhorAposta && (
          <div className="bg-[#050816] p-3 rounded-xl border border-green-500/20 flex justify-between items-center transition-colors hover:border-green-500/40">
             <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-green-500"/>
                <span className="text-xs font-bold text-slate-200">Melhor Aposta</span>
             </div>
             <div className="text-xs font-black text-green-400 truncate max-w-[50%] text-right">
                {melhorAposta.home_team || melhorAposta.nome}
             </div>
          </div>
        )}
        
        {melhorOver && (
          <div className="bg-[#050816] p-3 rounded-xl border border-white/5 flex justify-between items-center transition-colors hover:border-blue-500/40">
             <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500"/>
                <span className="text-xs font-bold text-slate-200">Potencial Over 2.5</span>
             </div>
             <div className="text-xs font-black text-blue-400 truncate max-w-[50%] text-right">
                {melhorOver.home_team || melhorOver.nome}
             </div>
          </div>
        )}

        {zebra && (
          <div className="bg-[#050816] p-3 rounded-xl border border-yellow-500/20 flex justify-between items-center transition-colors hover:border-yellow-500/40">
             <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-yellow-500"/>
                <span className="text-xs font-bold text-slate-200">Zebra de Valor</span>
             </div>
             <div className="text-xs font-black text-yellow-400 truncate max-w-[50%] text-right flex flex-col items-end">
                <span>{zebra.home_team || zebra.nome}</span>
                <span className="text-[9px] text-yellow-500/70 mt-0.5">Odd {(zebra.odd_principal || zebra.oddPrincipal)?.toFixed(2)}</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}