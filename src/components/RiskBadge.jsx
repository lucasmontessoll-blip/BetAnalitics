import React from 'react';
import {AlertTriangle,ShieldCheck} from 'lucide-react';
import {calcularNivelRisco} from '../utils/analiseRisco.js';

export default function RiskBadge({jogo,compacto=false}){
  const risco=calcularNivelRisco(jogo);

  if(compacto){
    return(
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${risco.cor}`}></span>
        <span className="text-[9px] font-black uppercase text-slate-400">{risco.texto}</span>
      </div>
    );
  }

  return(
    <div className="bg-[#050816] border border-white/10 rounded-2xl p-4 mt-3">
      <div className="flex items-center gap-2 mb-2">
        {risco.nivel==='Baixo'?<ShieldCheck className="w-4 h-4 text-emerald-400"/>:<AlertTriangle className="w-4 h-4 text-yellow-400"/>}
        <span className="text-xs font-black uppercase text-white">{risco.texto}</span>
        <span className={`ml-auto w-3 h-3 rounded-full ${risco.cor}`}></span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed">{risco.descricao}</p>
    </div>
  );
}
