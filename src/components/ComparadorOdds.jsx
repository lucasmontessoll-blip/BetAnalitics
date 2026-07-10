import { DollarSign } from 'lucide-react';
import { APP_MODE } from '../config/appMode.js';
import { CASAS_AFILIADAS } from '../config/casasAfiliadas.js';

export default function ComparadorOdds({ onAbrirCasa }) {
  if (APP_MODE.PLAYSTORE) return null;

  return (
    <div className="bg-[#0f172a] rounded-3xl p-5 mb-4 shadow-lg border border-white/5">
      <h3 className="text-slate-400 font-black text-[10px] uppercase flex items-center gap-2 mb-4">
        <DollarSign className="w-3 h-3 text-yellow-500" /> Comparador de Odds
      </h3>

      <div className="flex gap-3 overflow-x-auto pb-2 pt-2 no-scrollbar">
        {CASAS_AFILIADAS.map((casa) => (
          <button
            key={casa.id}
            onClick={() => onAbrirCasa?.(casa)}
            className={`min-w-[96px] flex-shrink-0 rounded-xl p-3 text-center border transition-colors cursor-pointer active:scale-95 relative ${
              casa.destaque
                ? 'bg-gradient-to-b from-[#050816] to-green-900/20 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                : 'bg-[#050816] border-white/5 hover:border-white/20'
            }`}
          >
            {casa.destaque && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-black text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-md">
                {casa.tag || 'Destaque'}
              </div>
            )}

            <div className={`text-[9px] font-black uppercase mb-1 ${casa.destaque ? 'text-green-400 mt-1' : 'text-slate-400'}`}>
              {casa.nome}
            </div>

            <div className={`text-sm font-black ${casa.destaque ? 'text-green-400' : 'text-white'}`}>
              {casa.odd}
            </div>

            <div className="text-[8px] font-bold text-slate-500 mt-1 uppercase">
              Abrir
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
