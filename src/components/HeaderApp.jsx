import React from 'react';
import { ArrowLeft, Crown, User } from 'lucide-react';

export default function HeaderApp({
  userData,
  viewMode,
  menuAtivo,
  filterCentro,
  jogoSelecionado,
  setMenuAtivo,
  setViewMode,
  setJogoSelecionado,
  setFilterCentro,
}) {
  const telaInicial =
    !jogoSelecionado &&
    String(viewMode || '').toLowerCase() === 'jogos' &&
    String(menuAtivo || '').toLowerCase() !== 'assinar pro' &&
    (!filterCentro || String(filterCentro).toLowerCase() === 'todos');

  function voltarInicio() {
    if (typeof setJogoSelecionado === 'function') {
      setJogoSelecionado(null);
    }

    if (typeof setMenuAtivo === 'function') {
      setMenuAtivo('Todos os Jogos');
    }

    if (typeof setViewMode === 'function') {
      setViewMode('jogos');
    }

    if (typeof setFilterCentro === 'function') {
      setFilterCentro('Todos');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function abrirPerfil() {
    setMenuAtivo('Todos os Jogos');
    setViewMode('perfil');
    setJogoSelecionado(null);
    if (typeof setFilterCentro === 'function') {
      setFilterCentro('Todos');
    }
  }

  return (
    <header className="flex items-center justify-between gap-3 px-3 py-2 bg-[#050816] sticky top-0 z-[9999] border-b border-white/5">
      <div className="flex items-center gap-2 min-w-0">
        {!telaInicial && (
          <button
            type="button"
            onClick={voltarInicio}
            className="w-11 h-11 rounded-2xl bg-[#0f172a] border border-white/15 flex items-center justify-center text-white shadow-lg active:scale-95 shrink-0"
            aria-label="Voltar"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col items-start justify-center min-w-0">
          <img
            src="/logo-topo.png"
            alt="BetAnalytics PRO"
            className="h-12 sm:h-14 w-auto max-w-[210px] object-contain select-none"
            draggable="false"
            style={{
              background: 'transparent',
              boxShadow: 'none',
              filter: 'none',
              border: 'none',
              outline: 'none'
            }}
          />

          {userData?.is_vip && (
            <span className="mt-1 text-[9px] font-black uppercase tracking-widest text-yellow-400 flex items-center gap-1">
              <Crown className="w-3 h-3" />
              VIP ativo
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={abrirPerfil}
        className="bg-blue-600 hover:bg-blue-500 text-white font-black px-3 py-2 rounded-xl flex items-center gap-2 text-xs shadow-lg uppercase shrink-0"
      >
        <User className="w-4 h-4" />
        Perfil
      </button>
    </header>
  );
}
