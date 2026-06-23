import React from "react";

export default function OddsComparison({ odds }) {
  if (!odds) return null;

  const casas = [
    { nome: "Bet365", odd: odds.bet365 || 1.85 },
    { nome: "Betano", odd: odds.betano || 1.82 },
    { nome: "1xBet", odd: odds.xbet || 1.90 },
    { nome: "Pinnacle", odd: odds.pinnacle || 1.95 }
  ];

  const melhor = casas.reduce((a, b) => (a.odd > b.odd ? a : b));

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-white/5 mt-4">
      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">💰 Comparador de Odds (Tempo Real)</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {casas.map(casa => (
          <div key={casa.nome} className={`min-w-[80px] p-2 rounded-lg flex flex-col items-center border ${melhor.nome === casa.nome ? "bg-green-600/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "bg-[#050816] border-slate-700 text-slate-400"}`}>
             <span className="text-[9px] font-black uppercase mb-1">{casa.nome}</span>
             <span className="text-sm font-black">{casa.odd.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}