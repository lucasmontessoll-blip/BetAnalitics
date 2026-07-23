import React from 'react';
import { createPortal } from 'react-dom';

export default function VoltarReal({
  setViewMode,
  setMenuAtivo,
  setJogoSelecionado,
  setFilterCentro,
  setLigaAtivaId,
}) {
  function retornarInicio() {
    if (typeof setJogoSelecionado === 'function') setJogoSelecionado(null);
    if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
    if (typeof setViewMode === 'function') setViewMode('jogos');
    if (typeof setFilterCentro === 'function') setFilterCentro('Todos');
    if (typeof setLigaAtivaId === 'function') setLigaAtivaId(null);

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {}
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <button
      type="button"
      onClick={retornarInicio}
      className="bet-retorno-real"
      data-bet-retorno="real"
      aria-label="Retornar ao início"
    >
      ‹
    </button>,
    document.body
  );
}
