import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function BotaoVoltarSimples({
  viewMode,
  menuAtivo,
  filterCentro,
  jogoSelecionado,
  setViewMode,
  setMenuAtivo,
  setJogoSelecionado,
  setFilterCentro,
}) {
  const menuNormalizado = String(menuAtivo || '').toLowerCase().trim();
  const filtroNormalizado = String(filterCentro || '').toLowerCase().trim();
  const viewNormalizado = String(viewMode || '').toLowerCase().trim();

  const estaNaTelaInicial =
    (!viewNormalizado || viewNormalizado === 'jogos' || viewNormalizado === 'inicio' || viewNormalizado === 'home') &&
    (!menuNormalizado || menuNormalizado === 'todos os jogos' || menuNormalizado === 'todos' || menuNormalizado === 'início' || menuNormalizado === 'inicio') &&
    (!filtroNormalizado || filtroNormalizado === 'todos');

  const deveMostrar =
    Boolean(jogoSelecionado) ||
    menuNormalizado === 'assinar pro' ||
    !estaNaTelaInicial;

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
    <button
      type="button"
      onClick={voltarInicio}
      className="fixed left-3 top-[82px] z-[9999] bg-[#0f172a] border border-white/20 text-white rounded-2xl px-3 py-3 shadow-2xl active:scale-95"
      aria-label="Voltar"
      title="Voltar"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}
