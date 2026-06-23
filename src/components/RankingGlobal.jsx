import React from "react";
import { Trophy, Medal, Star } from "lucide-react";

export default function RankingGlobal({ usuarios = [] }) {
  if (!usuarios || usuarios.length === 0) return null;

  return (
    <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-5 shadow-lg mb-6">
      <h2 className="text-lg font-black text-white flex items-center gap-2 mb-5">
        <Trophy className="w-5 h-5 text-yellow-400" /> Top Tipsters Global
      </h2>

      <div className="space-y-3">
        {usuarios.map((u, i) => {
          const isTop3 = i < 3;
          const medalColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];
          
          return (
            <div key={u.id || i} className={`p-3 rounded-2xl flex items-center justify-between border ${isTop3 ? 'bg-gradient-to-r from-[#111827] to-[#050816] border-white/10' : 'bg-[#050816] border-transparent'}`}>
              <div className="flex items-center gap-3">
                <div className={`font-black text-lg ${isTop3 ? medalColors[i] : 'text-slate-600'}`}>
                  #{i + 1}
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1">
                    {u.nome} {i === 0 && <Medal className="w-3 h-3 text-yellow-400"/>}
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lvl. {u.nivel || 'PRO'} • {u.xp} XP</div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="text-xs font-black text-green-400 bg-green-400/10 px-2 py-0.5 rounded">+{u.roi}% ROI</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1">R$ {u.lucro}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}