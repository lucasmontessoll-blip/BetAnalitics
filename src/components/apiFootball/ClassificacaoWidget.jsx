import { useEffect, useState } from 'react';
import { buscarClassificacaoApiFootball } from '../../services/apiFootballClient.js';

function formBadge(letra, index) {
  const v = String(letra || '').toUpperCase();
  const cls = v === 'W' || v === 'V'
    ? 'bg-emerald-500/20 text-emerald-300'
    : v === 'D' || v === 'E'
      ? 'bg-yellow-500/20 text-yellow-300'
      : 'bg-red-500/20 text-red-300';

  return (
    <span key={`${v}-${index}`} className={`w-4 h-4 rounded grid place-items-center text-[8px] font-black ${cls}`}>
      {v === 'V' ? 'W' : v === 'E' ? 'D' : v || '-'}
    </span>
  );
}

export default function ClassificacaoWidget({ league, season }) {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!league || !season) return;
    const controller = new AbortController();

    async function carregar() {
      try {
        setLoading(true);
        const payload = await buscarClassificacaoApiFootball({ league, season, signal: controller.signal });
        setDados(payload);
      } catch (e) {
        console.error('Erro classificação:', e);
        setDados([]);
      } finally {
        setLoading(false);
      }
    }

    carregar();
    return () => controller.abort();
  }, [league, season]);

  const standings = dados?.[0]?.league?.standings?.[0] || [];

  if (loading) {
    return <div className="p-5 text-center text-xs font-black text-blue-400 animate-pulse">Carregando classificação...</div>;
  }

  if (!standings.length) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 text-center text-xs font-bold text-slate-500">
        Classificação indisponível para esta competição/temporada.
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-xl">
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-black">
        <span>⭐</span>
        {dados?.[0]?.league?.flag && <img src={dados[0].league.flag} className="w-4 h-4 object-contain" alt="" />}
        <span className="truncate">{dados?.[0]?.league?.country} : {dados?.[0]?.league?.name}</span>
      </div>

      <div className="bg-teal-400 text-white text-center py-2 text-[10px] font-black uppercase">
        Classificação {season}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead className="bg-slate-100 text-slate-500 uppercase">
            <tr>
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Time</th>
              <th>MP</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>G</th>
              <th>+/-</th>
              <th>P</th>
              <th className="p-2">Form</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.team?.id} className="border-b border-slate-100">
                <td className="p-2 font-black">{row.rank}</td>
                <td className="p-2 font-bold whitespace-nowrap flex items-center gap-1.5">
                  <img src={row.team?.logo} className="w-4 h-4 object-contain" alt="" />
                  <span>{row.team?.name}</span>
                </td>
                <td className="text-center">{row.all?.played}</td>
                <td className="text-center">{row.all?.win}</td>
                <td className="text-center">{row.all?.draw}</td>
                <td className="text-center">{row.all?.lose}</td>
                <td className="text-center">{row.all?.goals?.for}:{row.all?.goals?.against}</td>
                <td className="text-center">{row.goalsDiff}</td>
                <td className="text-center font-black">{row.points}</td>
                <td className="p-2">
                  <div className="flex gap-1 justify-end">
                    {String(row.form || '').slice(-5).split('').map(formBadge)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
