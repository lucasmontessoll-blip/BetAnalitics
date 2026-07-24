import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function BotaoVoltarSimples({
  viewMode,
  menuAtivo,
  jogoSelecionado,
  setViewMode,
  setMenuAtivo,
  setJogoSelecionado,
  setFilterCentro,
}) {
  const deveMostrar =
    Boolean(jogoSelecionado) ||
    menuAtivo === 'assinar pro' ||
    (viewMode && viewMode !== 'jogos');

  function voltarInicio() {
    if (typeof setJogoSelecionado === 'function') {
      setJogoSelecionado(null);
    }

    if (typeof setViewMode === 'function') {
      setViewMode('jogos');
    }

    if (typeof setMenuAtivo === 'function') {
      setMenuAtivo('Todos os Jogos');
    }

    if (typeof setFilterCentro === 'function') {
      setFilterCentro('Todos');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    function ouvirVoltar() {
      voltarInicio();
    }

    window.addEventListener('betanalytics:voltarInicio', ouvirVoltar);

    return () => {
      window.removeEventListener('betanalytics:voltarInicio', ouvirVoltar);
    };
  });

  if (!deveMostrar) return null;

  return (
    <div className="px-4 mt-3 mb-3 w-full">
      <button
        type="button"
        onClick={voltarInicio}
        className="inline-flex items-center gap-2 bg-[#0f172a] border border-white/10 text-white rounded-2xl px-4 py-3 text-xs font-black uppercase shadow-lg active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>
    </div>
  );
}
