import React from 'react';
import { Activity, TrendingDown, Calendar } from 'lucide-react';

export default function GestaoBanca({ 
  stopWin, setStopWin, stopLoss, setStopLoss, 
  atingiuStopWin, atingiuStopLoss, calcularDrawdown, 
  apostas, bancaInicial, handleRunBacktest 
}) {
  return (
    <>
      <div className="bg-[#0f172a] p-4 sm:p-5 rounded-3xl mb-6 shadow-lg border border-white/5 w-full transform-gpu">
          <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><Activity className="w-4 h-4 text-orange-500"/> Gestão de Risco Diário</h3>
          <div className="flex gap-3 mb-4 w-full">
              <div className="w-1/2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1 truncate">Stop Win (R$)</label>
                  <input type="number" value={stopWin} onChange={(e)=>setStopWin(Number(e.target.value))} className="w-full bg-[#050816] border border-slate-800 p-3 rounded-xl text-xs text-white font-bold outline-none focus:border-green-500 transition-colors" />
              </div>
              <div className="w-1/2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1 truncate">Stop Loss (R$)</label>
                  <input type="number" value={stopLoss} onChange={(e)=>setStopLoss(Number(e.target.value))} className="w-full bg-[#050816] border border-slate-800 p-3 rounded-xl text-xs text-white font-bold outline-none focus:border-red-500 transition-colors" />
              </div>
          </div>
          
          {atingiuStopWin && <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-xl text-green-400 text-xs font-black text-center flex items-center justify-center gap-2 shadow-inner break-words">✅ META BATIDA!</div>}
          {atingiuStopLoss && <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-400 text-xs font-black text-center flex items-center justify-center gap-2 shadow-inner mt-2 break-words">⚠️ STOP LOSS!</div>}
      </div>

      <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2 relative z-10"><Activity className="w-4 h-4 text-red-500"/> Gestão Profissional</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 w-full">
          <div className="bg-[#111827] p-4 sm:p-5 rounded-2xl border border-red-500/20 shadow-lg flex flex-col justify-center transform-gpu min-w-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1 truncate"><TrendingDown className="w-3 h-3 text-red-400 flex-shrink-0"/> Drawdown Máx</div>
              <div className="text-xl sm:text-2xl font-black text-red-400 truncate">{calcularDrawdown(apostas, bancaInicial)}%</div>
          </div>
          <button onClick={handleRunBacktest} className="bg-gradient-to-br from-blue-700 to-blue-500 p-4 sm:p-5 rounded-2xl border border-blue-400/30 shadow-lg flex flex-col items-center justify-center active:scale-95 transition-transform transform-gpu min-w-0">
              <Calendar className="w-5 h-5 text-white mb-1 flex-shrink-0"/>
              <div className="text-[10px] text-white font-black uppercase tracking-widest text-center truncate w-full">Rodar Backtest Histórico</div>
          </button>
      </div>
    </>
  );
}