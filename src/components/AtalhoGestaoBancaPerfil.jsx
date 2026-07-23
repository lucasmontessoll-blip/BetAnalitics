import React from 'react';
import { Wallet, Crown, TrendingUp } from 'lucide-react';

export default function AtalhoGestaoBancaPerfil({
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
          setViewMode('banca');
          setJogoSelecionado(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="w-full bg-gradient-to-br from-green-500/20 via-[#0f172a] to-blue-500/10 border border-green-500/30 rounded-3xl p-5 text-left shadow-lg active:scale-[0.99]"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400 mb-1 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Recurso PRO
            </div>

            <div className="text-xl font-black text-white">
              Gestão de Banca
            </div>

            <div className="text-[11px] font-bold text-slate-400 mt-1">
              Controle saldo, entradas, lucro, prejuízo e ROI.
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-green-500/15 border border-green-400/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-green-300" />
          </div>
        </div>

        <div className="mt-4 bg-black/20 border border-white/10 rounded-2xl p-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-300" />
          <span className="text-[11px] font-bold text-slate-300">
            Abra sua central de controle financeiro das entradas.
          </span>
        </div>
      </button>
    </div>
  );
}
