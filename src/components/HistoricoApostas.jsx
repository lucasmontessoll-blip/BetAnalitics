import React from "react";
import { PieChart, TrendingUp, TrendingDown, Target } from "lucide-react";

export default function HistoricoApostas({ apostas = [] }) {
  const total = apostas.length;
  const ganhos = apostas.filter(a => a.resultado === "green");
  const lucro = apostas.reduce((s, a) => s + (a.lucro || 0), 0);
  const roi = total ? ((lucro / total) * 100).toFixed(2) : 0;
  const winRate = total ? ((ganhos.length / total) * 100).toFixed(0) : 0;

  return (
    <div className="bg-[#0f172a] border border-blue-500/20 rounded-3xl p-5 shadow-lg">
      <h2 className="text-sm font-black text-blue-400 flex items-center gap-2 mb-4 uppercase tracking-widest">
        <PieChart className="w-4 h-4" /> Desempenho Pessoal
      </h2>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-[#050816] p-3 rounded-2xl border border-white/5 text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Win Rate</div>
          <div className="text-xl font-black text-white">{winRate}%</div>
        </div>
        <div className="bg-[#050816] p-3 rounded-2xl border border-white/5 text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">ROI</div>
          <div className={`text-xl font-black ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{roi}%</div>
        </div>
        <div className="bg-[#050816] p-3 rounded-2xl border border-white/5 text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Lucro Puro</div>
          <div className={`text-sm font-black mt-1 ${lucro >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {lucro.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-2">
        {apostas.slice(0, 5).map((a, idx) => (
          <div key={idx} className="flex justify-between items-center bg-[#111827] p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              {a.resultado === 'green' ? <TrendingUp className="w-4 h-4 text-green-500"/> : <TrendingDown className="w-4 h-4 text-red-500"/>}
              <span className="text-xs font-bold text-white">{a.jogo || 'Aposta Realizada'}</span>
            </div>
            <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${a.resultado === 'green' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {a.resultado === 'green' ? `+R$ ${a.lucro}` : `-R$ ${Math.abs(a.lucro)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}