import React from 'react';
import { Crown, TrendingUp } from "lucide-react";

export default function HeroPremium({ onViewOportunidades }) {
  return (
    <div className="mx-4 mt-4 mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 p-6 shadow-[0_0_40px_rgba(37,99,235,.35)] relative">
      <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none">
        <TrendingUp className="w-40 h-40" />
      </div>
      
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <Crown className="text-yellow-400 w-6 h-6" />
        <h2 className="font-black text-xl text-white tracking-tight">BETANALYTICS PRO</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
        <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
          <div className="text-2xl font-black text-white">89%</div>
          <div className="text-[10px] text-blue-200 uppercase tracking-widest font-bold mt-1">Precisão IA</div>
        </div>

        <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
          <div className="text-2xl font-black text-white">247</div>
          <div className="text-[10px] text-blue-200 uppercase tracking-widest font-bold mt-1">Jogos Hoje</div>
        </div>

        <div className="bg-white/10 p-3 rounded-2xl border border-green-500/30">
          <div className="text-2xl font-black text-green-400">12</div>
          <div className="text-[10px] text-green-200 uppercase tracking-widest font-bold mt-1">Oportunidades</div>
        </div>
      </div>

      <button 
        onClick={onViewOportunidades}
        className="w-full bg-white text-blue-900 hover:bg-slate-200 transition-colors font-black py-3.5 rounded-2xl shadow-xl relative z-10 text-sm uppercase tracking-widest"
      >
        VER OPORTUNIDADES
      </button>
    </div>
  );
}