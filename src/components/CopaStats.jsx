import React from "react";
import { Goal, Users } from "lucide-react";

export default function CopaStats({ artilheiros = [], assistencias = [] }) {
  // Mock fallback se vier vazio
  const listaGols = artilheiros.length ? artilheiros : [{id:1, nome:"Mbappé", gols: 5}, {id:2, nome:"Kane", gols: 4}];
  const listaAssists = assistencias.length ? assistencias : [{id:1, nome:"De Bruyne", assistencias: 4}, {id:2, nome:"Vinícius Jr", assistencias: 3}];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
      {/* Box Artilheiros */}
      <div className="bg-[#0f172a] rounded-3xl p-5 border border-white/5 shadow-lg">
        <h3 className="text-sm font-black text-yellow-500 flex items-center gap-2 mb-4 uppercase tracking-wider">
          <Goal className="w-4 h-4" /> Chuteira de Ouro
        </h3>
        <div className="space-y-3">
          {listaGols.map((j, i) => (
            <div key={j.id} className="flex justify-between items-center bg-[#050816] p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-black text-[10px]">{i + 1}º</span>
                <span className="text-xs font-bold text-white">{j.nome}</span>
              </div>
              <span className="text-sm font-black text-yellow-500">{j.gols} <span className="text-[9px] text-slate-400">Gols</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Box Assistências */}
      <div className="bg-[#0f172a] rounded-3xl p-5 border border-white/5 shadow-lg">
        <h3 className="text-sm font-black text-blue-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
          <Users className="w-4 h-4" /> Garçons da Copa
        </h3>
        <div className="space-y-3">
          {listaAssists.map((j, i) => (
            <div key={j.id} className="flex justify-between items-center bg-[#050816] p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-black text-[10px]">{i + 1}º</span>
                <span className="text-xs font-bold text-white">{j.nome}</span>
              </div>
              <span className="text-sm font-black text-blue-400">{j.assistencias} <span className="text-[9px] text-slate-400">Ast.</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}