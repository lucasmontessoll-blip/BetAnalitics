import React from 'react';
import { FlaskConical, Database, Brain, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ModoDemoPro({ setViewMode }) {
  const itens = [
    {
      titulo: 'Dados demonstrativos',
      texto: 'Alguns jogos, odds, alertas e análises podem ser simulados enquanto a API real não estiver conectada.',
      icon: Database,
    },
    {
      titulo: 'IA em modo apresentação',
      texto: 'A IA mostra como o produto vai funcionar, mas a base final depende da API-Football e dos dados reais.',
      icon: Brain,
    },
    {
      titulo: 'Sem promessa de resultado',
      texto: 'O app é uma ferramenta de análise. Ele não garante lucro e não substitui controle de banca.',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="flex items-center gap-3 mb-4">
        

        <div>
          <div className="text-xl font-black text-white">Modo Demonstração</div>
          <div className="text-[11px] text-slate-500 font-bold">Transparência sobre dados simulados</div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-gradient-to-br from-amber-600 via-orange-700 to-slate-950 border border-amber-300/20 p-5 mb-5 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/15 blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-100 mb-3">
            <FlaskConical className="w-4 h-4" />
            Ambiente Demo
          </div>

          <h1 className="text-3xl font-black text-white leading-tight">
            App em modo apresentação
          </h1>

          <p className="text-xs text-amber-100/85 font-semibold mt-3 leading-relaxed">
            Este modo permite testar visual, fluxo, IA, favoritos, banca e VIP antes da API real ser ativada.
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {itens.map((item) => {
          const Icone = item.icon;

          return (
            <div key={item.titulo} className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 flex gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                <Icone className="w-5 h-5 text-amber-300" />
              </div>

              <div>
                <div className="text-sm font-black text-white">{item.titulo}</div>
                <div className="text-[11px] text-slate-500 font-semibold mt-1 leading-relaxed">{item.texto}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-4 flex gap-3 mb-5">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <div className="text-xs font-black text-emerald-300 uppercase">Pronto para apresentação</div>
          <div className="text-[11px] text-emerald-100/70 font-semibold mt-1 leading-relaxed">
            Você pode apresentar o app em modo demo e depois conectar a API-Football para dados reais.
          </div>
        </div>
      </div>

      
    </div>
  );
}
