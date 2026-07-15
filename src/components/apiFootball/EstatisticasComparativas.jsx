import { listaEstatisticasComparativas } from '../../services/apiFootballMapper.js';
import BarraComparativa from './BarraComparativa.jsx';

export default function EstatisticasComparativas({ statistics = [], jogo }) {
  const lista = listaEstatisticasComparativas(statistics);

  if (!lista.length) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 text-center text-xs font-bold text-slate-500">
        Estatisticas ainda nao disponiveis pela API-Football.
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-white/10 overflow-hidden">
      <div className="grid grid-cols-3 items-center bg-[#101827] px-4 py-3 text-[10px] font-black uppercase text-slate-400">
        <span className="truncate text-left">{jogo?.home_team || 'Casa'}</span>
        <span className="text-center text-cyan-400">Estatisticas</span>
        <span className="truncate text-right">{jogo?.away_team || 'Fora'}</span>
      </div>

      <div className="p-3">
        {lista.map((stat) => (
          <BarraComparativa key={stat.id} label={stat.label} casa={stat.casa} fora={stat.fora} />
        ))}
      </div>
    </div>
  );
}
