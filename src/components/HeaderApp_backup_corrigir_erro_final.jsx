import React from 'react';
import { Crown, User } from 'lucide-react';

export default function HeaderApp({
  userData,
  setMenuAtivo,
  setViewMode,
  setJogoSelecionado,
  setFilterCentro,
}) {
  function abrirPerfil() {
    if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
    if (typeof setViewMode === 'function') setViewMode('perfil');
    if (typeof setJogoSelecionado === 'function') setJogoSelecionado(null);
    if (typeof setFilterCentro === 'function') setFilterCentro('Todos');
  }

  return (
    <header className="bg-[#050816] border-b border-white/5 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
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

        <button
          type="button"
          onClick={abrirPerfil}
          className h-3" />
              VIP ativo
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={abrirPerfil}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black px-3 py-2 rounded-xl flex items-center gap-2 text-xs shadow-lg uppercase shrink-0"
        >
          <User className="w-4 h-4" />
          Perfil
        </button>
      </div>
    </header>
  );
}
