import React from 'react';
import { createPortal } from 'react-dom';

export default function VoltarGlobal({
  setViewMode,
  setMenuAtivo,
  setJogoSelecionado,
  setFilterCentro,
  setLigaAtivaId,
}) {
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

    if (typeof setLigaAtivaId === 'function') {
      setLigaAtivaId(null);
    }

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {
      return;
    }
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <button
      type="button"
      onClick={voltarInicio}
      aria-label="Voltar para início"
      title="Voltar"
      style={{
        position: 'fixed',
        left: '12px',
        top: '88px',
        zIndex: 2147483647,
        width: '52px',
        height: '52px',
        borderRadius: '18px',
        border: '2px solid rgba(255,255,255,0.35)',
        background: '#2563eb',
        color: '#ffffff',
        fontSize: '34px',
        fontWeight: 900,
        lineHeight: '44px',
        textAlign: 'center',
        boxShadow: '0 18px 45px rgba(0,0,0,0.65)',
        cursor: 'pointer'
      }}
    >
      ←
    </button>,
    document.body
  );
}
