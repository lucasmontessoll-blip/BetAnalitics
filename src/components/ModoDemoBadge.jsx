import React from 'react';
import { FlaskConical, ChevronRight } from 'lucide-react';

export default function ModoDemoBadge({ modoDemo = true, setViewMode }) {
  if (!modoDemo) return null;

  return (
    <button
      type="button"
      onClick={() => setViewMode?.('modo-demo')}
      className="mx-4 mt-3 mb-1 w-[calc(100%-2rem)] rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 flex items-center gap-3 text-left active:scale-[0.99]"
    >
      <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center shrink-0">
        <FlaskConical className="w-5 h-5 text-amber-300" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-black text-amber-300 uppercase tracking-wider">
          Modo Demonstração ativo
        </div>
        <div className="text-[10px] font-bold text-amber-100/70 truncate">
          Dados simulados até conectar a API real.
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-amber-300/70 shrink-0" />
    </button>
  );
}
