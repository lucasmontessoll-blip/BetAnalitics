import { useEffect, useMemo, useState } from 'react';
import { buscarTimeApiFootball } from '../../services/apiFootballClient.js';
import StatCircle from './StatCircle.jsx';
import BarraComparativa from './BarraComparativa.jsx';

function safePct(v, total) {
  const n = Number(v) || 0;
  const t = Math.max(Number(total) || 0, 1);
  return Math.round((n / t) * 100);
}

export default function TeamWidget({ teamId, league, season, titulo = 'Equipe' }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    const controller = new AbortController();

    async function carregar() {
      try {
        setLoading(true);
        const payload = await buscarTimeApiFootball({ teamId, league, season, signal: controller.signal });
        setDados(payload);
      } catch (e) {
        console.error('Erro equipe:', e);
        setDados(null);
      } finally {
        setLoading(false);
      }
    }

    carregar();
    return () => controller.abort();
  }, [teamId, league, season]);

  const team = dados?.team?.team || {};
  const venue = dados?.team?.venue || {};
  const stats = dados?.statistics || {};
  const fixtures = stats?.fixtures || {};
  const goals = stats?.goals || {};
  const clean = stats?.clean_sheet || {};
  const failed = stats?.failed_to_score || {};
  const cardsYellow = stats?.cards?.yellow || {};
  const played = fixtures?.played?.total || 0;
  const winsPct = safePct(fixtures?.wins?.total, played);
  const scoredPct = safePct(played - (failed?.total || 0), played);
  const lineup = stats?.lineups?.[0];

  const cardsFaixas = useMemo(() => {
    return Object.entries(cardsYellow || {}).map(([k, v]) => ({
      label: k.replace('-', "'-") + "'",
      total: v?.total || 0,
    })).filter(x => x.total > 0);
  }, [cardsYellow]);

  if (loading) return <div className="p-5 text-center text-xs font-black text-blue-400 animate-pulse">Carregando equipe...</div>;

  if (!team?.id) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 text-center text-xs font-bold text-slate-500">
        Dados da equipe indisponíveis.
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 flex items-center gap-3 border-r-4 border-teal-400">
        <img src={team.logo} className="w-16 h-16 object-contain rounded bg-slate-50 p-1" alt="" />
        <div className="min-w-0">
          <div className="text-sm font-black truncate">{team.name}</div>
          <div className="text-[10px] text-slate-500 font-bold">Founded: {team.founded || '-'}</div>
          <div className="text-[10px] text-slate-500 font-bold">{team.national ? 'National team' : team.country}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 bg-slate-100 text-[10px] font-black uppercase text-teal-500">
        <div className="text-center py-2 bg-teal-400 text-white">Statistics</div>
        <div className="text-center py-2">Squad</div>
        <div className="text-center py-2">Stadium</div>
      </div>

      <div className="px-4 py-3 bg-slate-50 text-[10px] font-bold text-slate-600">
        🏆 {stats?.league?.name || titulo} ({season})
      </div>

      <div className="p-4 grid grid-cols-3 gap-2">
        <StatCircle value={winsPct} label="Wins" sub={`Played: ${played}`} />
        <StatCircle value={lineup ? 67 : 50} label={lineup?.formation || 'Lineup'} sub={`Lineups: ${lineup?.played || 0}`} />
        <StatCircle value={scoredPct} label="Scored" sub={`Failed: ${failed?.total || 0}`} />
      </div>

      <div className="px-4 pb-4">
        <BarraComparativa label="Wins" casa={fixtures?.wins?.home} fora={fixtures?.wins?.away} />
        <BarraComparativa label="Losses" casa={fixtures?.loses?.home} fora={fixtures?.loses?.away} />
        <BarraComparativa label="Draws" casa={fixtures?.draws?.home} fora={fixtures?.draws?.away} />
        <BarraComparativa label="Clean sheets" casa={clean?.home} fora={clean?.away} />
        <BarraComparativa label="Failed to score" casa={failed?.home} fora={failed?.away} />

        {venue?.name && (
          <div className="mt-3 rounded-xl bg-slate-100 p-3 text-[10px] font-bold text-slate-600">
            <div className="font-black text-slate-900 text-xs">{venue.name}</div>
            <div>{venue.city} • Capacidade: {venue.capacity || '-'}</div>
          </div>
        )}

        {cardsFaixas.length > 0 && (
          <div className="mt-3">
            <div className="text-[10px] font-black uppercase text-slate-500 text-center mb-2">Cards</div>
            <div className="flex items-end gap-1 h-16">
              {cardsFaixas.map((c) => (
                <div key={c.label} className="flex-1 flex flex-col items-center justify-end">
                  <div className="w-full bg-yellow-400 rounded-t" style={{ height: `${Math.max(6, c.total * 5)}px` }} />
                  <div className="text-[7px] text-slate-500 mt-1">{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
