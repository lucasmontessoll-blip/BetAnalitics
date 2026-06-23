import React from "react";
import { Globe, Crosshair } from "lucide-react";

export default function RadarMundial({ jogos = [] }) {
  // Filtra jogos com alta confiança, odd de valor e EV positivo
  const radar = jogos.filter(j => (j.confianca_ia || j.confianca) > 85 && (j.odd_principal || j.oddPrincipal) > 1.7);

  return (
    <div className="bg-[#0f172a] border border-blue-500/20 rounded-3xl p-5 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
      <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4"><Globe className="w-5 h-5 text-blue-400" /> Radar Mundial PRO</h2>
      {radar.length === 0 ? (
        <div className="text-slate-500 text-xs text-center py-4 font-bold">Nenhuma super-oportunidade detectada no momento.</div>
      ) : (
        <div className="space-y-3">
          {radar.map((jogo, idx) => (
            <div key={idx} className="bg-[#050816] border border-white/5 p-3 rounded-xl flex justify-between items-center hover:border-blue-500/40 transition-colors">
              <div className="font-bold text-sm text-white truncate pr-2">{jogo.home_team || jogo.nome} x {jogo.away_team || "Adversário"}</div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="bg-green-500/20 text-green-400 text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-widest">EV+ {jogo.ev || 8}%</span>
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1"><Crosshair className="w-3 h-3 text-blue-400"/> {jogo.confianca_ia || jogo.confianca}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}