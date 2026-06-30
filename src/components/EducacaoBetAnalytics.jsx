import React from 'react';
import {BookOpen,ShieldCheck} from 'lucide-react';
import {educacaoConteudos} from '../data/educacaoConteudos.js';

export default function EducacaoBetAnalytics(){
  return(
    <div className="px-4 animate-fade-in pb-24">
      <div className="bg-gradient-to-br from-emerald-600 to-blue-700 rounded-3xl p-6 mb-5 relative overflow-hidden">
        <BookOpen className="absolute -right-5 -top-5 w-32 h-32 text-white/10"/>
        <h2 className="text-2xl font-black text-white relative z-10">Educação BetAnalytics</h2>
        <p className="text-sm text-emerald-100 font-bold mt-2 relative z-10">Aprenda conceitos importantes para interpretar análises esportivas com responsabilidade.</p>
      </div>

      <div className="space-y-3">
        {educacaoConteudos.map((item)=>(
          <div key={item.titulo} className="bg-[#0f172a] border border-white/10 rounded-3xl p-5">
            <h3 className="text-sm font-black text-white uppercase">{item.titulo}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">{item.texto}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0f172a] border border-blue-500/20 rounded-3xl p-5 mt-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-blue-400"/>
          <h3 className="text-xs font-black uppercase text-blue-400">Uso responsável</h3>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Este conteúdo é educativo. O BetAnalytics PRO não garante lucro, não realiza apostas e não substitui responsabilidade pessoal.
        </p>
      </div>
    </div>
  );
}
