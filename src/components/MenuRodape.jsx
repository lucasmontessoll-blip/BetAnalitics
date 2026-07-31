import React from 'react';
import { Home, Radio, Target, CheckCircle2, CalendarDays } from 'lucide-react';

export default function MenuRodape({
  viewMode,
  filterCentro,
  setMenuAtivo,
  setViewMode,
  setFilterCentro,
  setLigaAtivaId,
  setJogoSelecionado,
}) {
  function limparSelecao() {
    setMenuAtivo('Todos os Jogos');
    setLigaAtivaId(null);
    setJogoSelecionado(null);
  }

  function irInicio() {
    limparSelecao();
    setViewMode('jogos');
    setFilterCentro('Todos');
  }

  function irAoVivo() {
    limparSelecao();
    setViewMode('aovivo');
    setFilterCentro('Ao Vivo');
  }

  function irEncerrado() {
    limparSelecao();
    setViewMode('encerrado');
    setFilterCentro('Encerrado');
  }

  function irPreJogo() {
    limparSelecao();
    setViewMode('prejogo');
    setFilterCentro('Pre-Jogo');
  }

  function irRadarIA() {
    limparSelecao();
    setViewMode('radarpro');
    setFilterCentro('Todos');
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex flex-col border-t border-white/5 bg-[#050816] shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <div className="flex h-16 w-full items-center justify-around pt-2">
        <button
          type="button"
          onClick={irInicio}
          className={`flex flex-col items-center gap-1.5 ${
            viewMode === 'jogos' && filterCentro === 'Todos'
              ? 'text-blue-500'
              : 'text-slate-500'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <Home className="h-5 w-5" />
          <span className="mt-0.5 text-[8px] font-black uppercase">InÃ­cio</span>
        </button>

        <button
          type="button"
          onClick={irAoVivo}
          className={`flex flex-col items-center gap-1.5 ${
            viewMode === 'aovivo' || filterCentro === 'Ao Vivo'
              ? 'text-red-500'
              : 'text-slate-500'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <Radio className="h-5 w-5" />
          <span className="mt-0.5 text-[8px] font-black uppercase">Ao Vivo</span>
        </button>

        <button
          type="button"
          onClick={irEncerrado}
          className={`flex flex-col items-center gap-1.5 ${
            viewMode === 'encerrado' || filterCentro === 'Encerrado'
              ? 'text-green-500'
              : 'text-slate-500'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <CheckCircle2 className="h-5 w-5" />
          <span className="mt-0.5 text-[8px] font-black uppercase">Encerrado</span>
        </button>

        <button
          type="button"
          onClick={irPreJogo}
          className={`flex flex-col items-center gap-1.5 ${
            viewMode === 'prejogo'
              ? 'text-yellow-400'
              : 'text-slate-500'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <CalendarDays className="h-5 w-5" />
          <span className="mt-0.5 text-[8px] font-black uppercase">PrÃ©-jogo</span>
        </button>

        <button
          type="button"
          onClick={irRadarIA}
          className={`flex flex-col items-center gap-1.5 ${
            viewMode === 'radarpro' || viewMode === 'radar'
              ? 'text-blue-500'
              : 'text-slate-500'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <Target className="h-5 w-5" />
          <span className="mt-0.5 text-[8px] font-black uppercase">Radar IA</span>
        </button>
      </div>
    </nav>
  );
}