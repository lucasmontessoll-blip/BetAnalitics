import React from 'react';
import {Trophy,Star} from 'lucide-react';
import {calcularScoreOportunidade} from '../utils/analiseRisco.js';
import RiskBadge from './RiskBadge.jsx';

export default function RankingOportunidades({jogos=[],onSelecionarJogo}){
  const ranking=[...jogos]
    .filter((j)=>j?.home_team&&j?.away_team)
    .map((j)=>({...j,score_oportunidade:calcularScoreOportunidade(j)}))
    .sort((a,b)=>b.score_oportunidade-a.score_oportunidade)
    .slice(0,10);

  return(
    <div className="px-4 animate-fade-in pb-24">
      <div className="bg-gradient-to-br from-yellow-500 to-orange-700 rounded-3xl p-6 mb-5 relative overflow-hidden">
        <Trophy className="absolute -right-5 -top-5 w-32 h-32 text-white/10"/>
        <h2 className="text-2xl font-black text-white relative z-10">Ranking de Oportunidades</h2>
        <p className="text-sm text-yellow-100 font-bold mt-2 relative z-10">Jogos ordenados por confiança, odd e risco.</p>
      </div>

      {ranking.length===0?(
        <div className="text-center text-slate-500 py-10 font-bold">Nenhuma oportunidade encontrada no momento.</div>
      ):(
        <div className="space-y-3">
          {ranking.map((jogo,index)=>(
            <button key={jogo.id||index} onClick={()=>onSelecionarJogo?.(jogo)} className="w-full bg-[#0f172a] border border-white/10 rounded-3xl p-4 text-left active:scale-[0.98] transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#050816] border border-white/10 flex items-center justify-center text-xs font-black text-yellow-400">{index+1}</div>
                  <div>
                    <div className="text-xs font-black text-white uppercase">{jogo.league_name||'Competição'}</div>
                    <RiskBadge jogo={jogo} compacto/>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-400 font-black text-sm">
                  <Star className="w-4 h-4 fill-yellow-400"/>
                  {jogo.score_oportunidade}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center text-center">
                <div className="text-[11px] font-bold text-slate-300 truncate">{jogo.home_team}</div>
                <div className="text-xs font-black text-slate-500">vs</div>
                <div className="text-[11px] font-bold text-slate-300 truncate">{jogo.away_team}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-blue-500/10 rounded-2xl p-3 text-center">
                  <div className="text-[9px] text-blue-300 uppercase font-black">Confiança</div>
                  <div className="text-lg font-black text-blue-400">{jogo.confianca_ia||0}%</div>
                </div>
                <div className="bg-emerald-500/10 rounded-2xl p-3 text-center">
                  <div className="text-[9px] text-emerald-300 uppercase font-black">Odd</div>
                  <div className="text-lg font-black text-emerald-400">{jogo.odd_principal||'-'}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-600 leading-relaxed mt-5 text-center">
        Ranking estatístico. Não representa garantia de acerto ou lucro.
      </p>
    </div>
  );
}
