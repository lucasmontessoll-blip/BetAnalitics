import React from 'react';
import { Calculator } from 'lucide-react';

export default function SimuladorStake({ simStake, setSimStake, simOdd, setSimOdd, lucroSimulado, retornoTotal }) {
  return (
    <div className="bg-[#0f172a] p-4 sm:p-5 rounded-3xl mb-6 shadow-lg border border-white/5 transform-gpu w-full">
        <h2 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2 truncate"><Calculator className="w-4 h-4 text-blue-500 flex-shrink-0"/> Simulador de Stake</h2>
        <div className="flex gap-3 mb-4">
            <input type="number" placeholder="Stake" value={simStake} onChange={(e)=>setSimStake(e.target.value)} className="w-full bg-[#050816] border border-slate-800 p-3 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500 transition-colors min-w-0" />
            <input type="number" placeholder="Odd" value={simOdd} onChange={(e)=>setSimOdd(e.target.value)} className="w-full bg-[#050816] border border-slate-800 p-3 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500 transition-colors min-w-0" />
        </div>
        <div className="flex justify-between items-center bg-[#111827] p-3 rounded-xl border border-white/5">
            <div className="pr-2"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block truncate">Lucro Limpo</span><span className="text-green-400 font-black text-sm truncate">R$ {Number(lucroSimulado||0).toFixed(2)}</span></div>
            <div className="text-right"><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block truncate">Retorno Total</span><span className="text-blue-400 font-black text-sm truncate">R$ {Number(retornoTotal||0).toFixed(2)}</span></div>
        </div>
    </div>
  );
}