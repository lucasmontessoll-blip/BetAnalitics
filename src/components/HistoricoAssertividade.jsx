import React from 'react';
import {BarChart,Bar,ResponsiveContainer,XAxis,YAxis,Tooltip} from 'recharts';
import {TrendingUp,AlertTriangle} from 'lucide-react';
import {historicoAssertividade} from '../data/historicoAssertividade.js';

export default function HistoricoAssertividade(){
  const totalAcertos=historicoAssertividade.reduce((acc,item)=>acc+item.acertos,0);
  const totalErros=historicoAssertividade.reduce((acc,item)=>acc+item.erros,0);
  const taxaMedia=Math.round((totalAcertos/(totalAcertos+totalErros))*100);

  return(
    <div className="px-4 animate-fade-in pb-24">
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-emerald-400"/>
          <div>
            <h2 className="text-xl font-black text-white">Histórico de Assertividade</h2>
            <p className="text-xs text-slate-500 font-bold">Resultados simulados e estatísticos</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#050816] rounded-2xl p-3 text-center"><div className="text-[9px] text-slate-500 font-black uppercase">Acertos</div><div className="text-xl font-black text-emerald-400">{totalAcertos}</div></div>
          <div className="bg-[#050816] rounded-2xl p-3 text-center"><div className="text-[9px] text-slate-500 font-black uppercase">Erros</div><div className="text-xl font-black text-red-400">{totalErros}</div></div>
          <div className="bg-[#050816] rounded-2xl p-3 text-center"><div className="text-[9px] text-slate-500 font-black uppercase">Taxa</div><div className="text-xl font-black text-blue-400">{taxaMedia}%</div></div>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-5">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-4">Semana atual</h3>
        <div className="w-full h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historicoAssertividade}>
              <XAxis dataKey="dia" stroke="rgba(255,255,255,0.4)" fontSize={10}/>
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10}/>
              <Tooltip contentStyle={{backgroundColor:'#050816',borderColor:'rgba(255,255,255,0.1)',borderRadius:'12px',color:'#fff'}}/>
              <Bar dataKey="acertos" fill="#10b981" radius={[6,6,0,0]}/>
              <Bar dataKey="erros" fill="#ef4444" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-5 mt-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400"/>
          <h3 className="text-xs font-black uppercase text-yellow-400">Aviso</h3>
        </div>
        <p className="text-[11px] text-yellow-100/80 leading-relaxed">
          Resultados passados não garantem resultados futuros. Estes dados são informativos e não representam promessa de lucro.
        </p>
      </div>
    </div>
  );
}
