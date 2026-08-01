import React from 'react';
import { ShieldCheck, Crown } from 'lucide-react';

export default function AtalhoAdminPerfil({
  viewMode,
  setViewMode,
  setMenuAtivo,
  setJogoSelecionado,
}) {
  if (viewMode !== 'perfil') return null;

  return (
    <div className="px-4 mt-4 mb-4 w-full">
      <button
        type="button"
        onClick={() => {
          setMenuAtivo('Todos os Jogos');
          setViewMode('admin');
          setJogoSelecionado(null);
        }}
        className="w-full bg-gradient-to-br from-yellow-500/20 via-[#0f172a] to-green-500/10 border border-yellow-500/30 rounded-3xl p-5 text-left shadow-lg active:scale-[0.99]"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 mb-1 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Aba Admin
            </div>
            <div className="text-xl font-black text-white">
              Painel administrativo
            </div>
            <div className="text-[11px] font-bold text-slate-400 mt-1">
              Inscritos, lucro, pagamentos, conversao e status do app.
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-yellow-300" />
          </div>
        </div>
      </button>
    </div>
  );
}
