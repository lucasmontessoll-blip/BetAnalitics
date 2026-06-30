import React from 'react';
import {Brain,TrendingUp,ShieldCheck,BarChart3,Target,AlertTriangle} from 'lucide-react';

const fatores=[
  {titulo:'Forma recente',texto:'Analisa desempenho recente, sequência de vitórias, empates, derrotas e estabilidade.',icon:TrendingUp,cor:'text-emerald-400'},
  {titulo:'Força ofensiva',texto:'Considera volume ofensivo, gols, finalizações e pressão de ataque.',icon:Target,cor:'text-blue-400'},
  {titulo:'Força defensiva',texto:'Avalia vulnerabilidade defensiva, gols sofridos e comportamento em momentos críticos.',icon:ShieldCheck,cor:'text-purple-400'},
  {titulo:'Mercado e odds',texto:'Compara probabilidade estimada com odds disponíveis para identificar distorções.',icon:BarChart3,cor:'text-yellow-400'},
  {titulo:'Risco',texto:'Classifica cada análise como risco baixo, médio ou alto. Nem todo jogo é oportunidade.',icon:AlertTriangle,cor:'text-red-400'}
];

export default function ComoIACalcula(){
  return(
    <div className="px-4 animate-fade-in pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 mb-5 relative overflow-hidden">
        <Brain className="absolute -right-5 -top-5 w-32 h-32 text-white/10"/>
        <h2 className="text-2xl font-black text-white relative z-10">Como a IA calcula?</h2>
        <p className="text-sm text-blue-100 font-bold mt-2 relative z-10">Entenda os critérios usados pelo BetAnalytics PRO para gerar análises esportivas.</p>
      </div>

      <div className="space-y-3">
        {fatores.map((item)=>{
          const Icon=item.icon;
          return(
            <div key={item.titulo} className="bg-[#0f172a] border border-white/10 rounded-3xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#050816] flex items-center justify-center border border-white/10">
                  <Icon className={`w-5 h-5 ${item.cor}`}/>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase">{item.titulo}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">{item.texto}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-5 mt-5">
        <h3 className="text-yellow-400 text-xs font-black uppercase mb-2">Aviso importante</h3>
        <p className="text-[11px] text-yellow-100/80 leading-relaxed">
          As análises são estimativas estatísticas e educativas. Elas não garantem resultado, lucro ou acerto.
        </p>
      </div>
    </div>
  );
}
