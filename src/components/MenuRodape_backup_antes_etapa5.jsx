import React from 'react';
import { Home, Radio, Trophy, Target, CheckCircle2 } from 'lucide-react';

export default function MenuRodape({
  viewMode,
  filterCentro,
  setMenuAtivo,
  setViewMode,
  setFilterCentro,
  setLigaAtivaId,
  setJogoSelecionado,
}) {
  function irInicio() {
    setMenuAtivo('Todos os Jogos');
    setViewMode('jogos');
    setFilterCentro('Todos');
    setLigaAtivaId(null);
    setJogoSelecionado(null);
  }

  function irAoVivo() {
    setMenuAtivo('Todos os Jogos');
    setViewMode('aovivo');
    setFilterCentro('Ao Vivo');
    setLigaAtivaId(null);
    setJogoSelecionado(null);
  }

  function irEncerrado() {
    setMenuAtivo('Todos os Jogos');
    setViewMode('encerrado');
    setFilterCentro('Encerrado');
    setLigaAtivaId(null);
    setJogoSelecionado(null);
  }

  function irJogos() {
    setMenuAtivo('Todos os Jogos');
    setViewMode('copa');
    setFilterCentro('Todos');
    setLigaAtivaId(null);
    setJogoSelecionado(null);
  }

  function irRadarIA() {
    setMenuAtivo('Todos os Jogos');
    setViewMode('radar');
    setFilterCentro('Todos');
    setLigaAtivaId(null);
    setJogoSelecionado(null);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#050816] border-t border-white/5 z-50 flex flex-col shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center h-16 pt-2 w-full">
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
          <Home className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase mt-0.5">Inicio</span>
        </button>

        <button
          type="button"
          onClick={irAoVivo}
          className={`flex flex-col items-center gap-1.5 ${
            filterCentro === 'Ao Vivo'
              ? 'text-red-500'
              : 'text-slate-500'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase mt-0.5">Ao Vivo</span>
        </button>

        <button
          type="button"
          onClick={irEncerrado}
          className={`flex flex-col items-center gap-1.5 ${
            filterCentro === 'Encerrado'
              ? 'text-green-500'
              : 'text-slate-500'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase mt-0.5">Encerrado</span>
        </button>

        <button
          type="button"
          onClick={irJogos}
          className={`flex flex-col items-center gap-1.5 ${
            viewMode === 'copa'
              ? 'text-yellow-500'
              : 'text-slate-500'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase mt-0.5">Jogos</span>
        </button>

        <button
          type="button"
          onClick={irRadarIA}
          className={`flex flex-col items-center gap-1.5 ${
            viewMode === 'radar'
              ? 'text-blue-500'
              : 'text-slate-500'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <Target className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase mt-0.5">Radar IA</span>
        </button>
      </div>
    </nav>
  );
}
