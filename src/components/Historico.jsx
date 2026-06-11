import React from 'react';
import { List, Filter } from 'lucide-react';

export default function Historico({ filtroResultado, setFiltroResultado, filtroLiga, setFiltroLiga, apostasFiltradas }) {
  return (
    <div className="bg-[#0f172a] rounded-3xl p-4 sm:p-5 mb-6 shadow-lg border border-white/5 transform-gpu w-full">
        <h2 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><List className="w-4 h-4 text-slate-400"/> Histórico de Apostas</h2>
        <div className="flex gap-2 mb-5">
            <div className="relative w-1/2">
                <Filter className="w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"/>
                <select value={filtroResultado} onChange={(e)=>setFiltroResultado(e.target.value)} className="w-full bg-[#050816] border border-slate-800 text-xs text-white font-bold p-3 pl-8 rounded-xl outline-none focus:border-blue-500 appearance-none min-w-0">
                    <option value="todos">Status: Todos</option>
                    <option value="green">Green (Ganhos)</option>
                    <option value="red">Red (Perdas)</option>
                </select>
            </div>
            <select value={filtroLiga} onChange={(e)=>setFiltroLiga(e.target.value)} className="w-1/2 bg-[#050816] border border-slate-800 text-xs text-white font-bold p-3 rounded-xl outline-none focus:border-blue-500 appearance-none min-w-0">
                <option value="todas">Liga: Todas</option>
                <option value="Brasileirão">Brasileirão</option>
                <option value="Premier League">Premier League</option>
                <option value="La Liga">La Liga</option>
            </select>
        </div>
        <div className="flex flex-col gap-3">
            {apostasFiltradas.length > 0 ? apostasFiltradas.map((a, index)=>(
                <div key={index} className="bg-[#111827] border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                    <div className="pr-2 min-w-0">
                        <div className="font-bold text-white text-xs mb-1 truncate">{a.jogo}</div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 truncate"><span>{a.mercado}</span> <span>•</span> <span>Odd: @{Number(a.odd||0).toFixed(2)}</span></div>
                    </div>
                    <div className={`font-black text-sm uppercase tracking-widest px-3 py-1.5 rounded-lg border flex-shrink-0 ${a.resultado === "green" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                        {a.resultado}
                    </div>
                </div>
            )) : (
                <div className="text-center text-slate-500 text-xs py-4 font-bold">Nenhuma aposta encontrada no filtro.</div>
            )}
        </div>
    </div>
  );
}