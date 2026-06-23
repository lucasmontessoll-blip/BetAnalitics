import React from "react";
import { Flame, Target, TrendingUp, Zap } from "lucide-react";

export default function DashboardIA({ insights }) {
  if (!insights) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="bg-gradient-to-br from-green-900/40 to-green-600/10 border border-green-500/30 p-4 rounded-2xl shadow-lg transform-gpu">
        <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest mb-2"><Flame className="w-4 h-4" /> Melhor Value Bet</div>
        <h3 className="text-white font-bold text-sm truncate">{insights.valueBet || "Aguardando..."}</h3>
      </div>
      <div className="bg-gradient-to-br from-red-900/40 to-red-600/10 border border-red-500/30 p-4 rounded-2xl shadow-lg transform-gpu">
        <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest mb-2"><Target className="w-4 h-4" /> Gol Iminente</div>
        <h3 className="text-white font-bold text-sm truncate">{insights.golIminente || "Aguardando..."}</h3>
      </div>
      <div className="bg-gradient-to-br from-purple-900/40 to-purple-600/10 border border-purple-500/30 p-4 rounded-2xl shadow-lg transform-gpu">
        <div className="flex items-center gap-2 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-2"><TrendingUp className="w-4 h-4" /> Mercado Errado</div>
        <h3 className="text-white font-bold text-sm truncate">{insights.mercadoErrado || "Nenhuma falha."}</h3>
      </div>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-600/10 border border-blue-500/30 p-4 rounded-2xl shadow-lg transform-gpu">
        <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2"><Zap className="w-4 h-4" /> Maior EV+</div>
        <h3 className="text-white font-bold text-sm truncate">{insights.evPositivo || "Analisando..."}</h3>
      </div>
    </div>
  );
}