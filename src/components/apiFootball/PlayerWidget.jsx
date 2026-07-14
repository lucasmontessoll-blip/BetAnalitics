import { useEffect, useState } from 'react';
import { buscarJogadorApiFootball } from '../../services/apiFootballClient.js';
import StatCircle from './StatCircle.jsx';
import JogadorExtras from './JogadorExtras.jsx';

export default function PlayerWidget({ playerId, team, league, season }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playerId) return;
    const controller = new AbortController();

    async function carregar() {
      try {
        setLoading(true);
        const payload = await buscarJogadorApiFootball({ playerId, team, league, season, signal: controller.signal });
        setDados(payload);
      } catch (e) {
        console.error('Erro jogador:', e);
        setDados(null);
      } finally {
        setLoading(false);
      }
    }

    carregar();
    return () => controller.abort();
  }, [playerId, team, league, season]);

  const player = dados?.player || {};
  const stat = dados?.statistics?.[0] || {};
  const games = stat.games || {};
  const shots = stat.shots || {};
  const goals = stat.goals || {};
  const duels = stat.duels || {};
  const dribbles = stat.dribbles || {};
  const passes = stat.passes || {};
  const leagueName = stat.league?.name || '';

  const pctAlvo = Math.round(((shots.on || 0) / Math.max(shots.total || 1, 1)) * 100);
  const pctDuels = Math.round(((duels.won || 0) / Math.max(duels.total || 1, 1)) * 100);
  const pctDribles = Math.round(((dribbles.success || 0) / Math.max(dribbles.attempts || 1, 1)) * 100);

  if (loading) return <div className="p-5 text-center text-xs font-black text-blue-400 animate-pulse">Carregando jogador...</div>;

  if (!player?.id) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 text-center text-xs font-bold text-slate-500">
        Selecione um jogador para ver o widget completo.
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 flex items-center gap-3 border-r-4 border-teal-400">
          <img src={player.photo} className="w-16 h-16 rounded-full object-cover bg-slate-100" alt="" />
          <div className="flex-1 min-w-0 text-center">
            <div className="text-sm font-black truncate">{player.name}</div>
            <div className="text-[10px] font-bold text-slate-500">{player.nationality}</div>
            <div className="grid grid-cols-4 gap-2 mt-2 text-[9px]">
              <div><b>Position</b><br />{games.position || '-'}</div>
              <div><b>Age</b><br />{player.age || '-'}</div>
              <div><b>Height</b><br />{player.height || '-'}</div>
              <div><b>Weight</b><br />{player.weight || '-'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 bg-slate-100 text-[10px] font-black uppercase text-teal-500">
          <div className="text-center py-2 bg-teal-400 text-white">Statistics</div>
          <div className="text-center py-2">Career</div>
          <div className="text-center py-2">Trophies</div>
        </div>

        <div className="px-4 py-3 bg-slate-50 text-[10px] font-bold text-slate-600">
          ⚽ {stat.team?.name || ''} ({season})
        </div>

        <div className="px-4 py-3 bg-slate-100 text-center text-[10px] font-black uppercase">
          {leagueName || 'Temporada'} ({season})
        </div>

        <div className="p-4 grid grid-cols-3 gap-2">
          <StatCircle value={pctAlvo} label="On target" sub={`Shots: ${shots.total || 0}`} tone={pctAlvo >= 50 ? 'emerald' : 'red'} />
          <StatCircle value={pctDuels} label="Won" sub={`Duels: ${duels.total || 0}`} tone={pctDuels >= 50 ? 'emerald' : 'red'} />
          <StatCircle value={pctDribles} label="Success" sub={`Dribbles: ${dribbles.attempts || 0}`} tone={pctDribles >= 50 ? 'emerald' : 'red'} />
        </div>

        <div className="px-4 pb-4 text-[11px]">
          {[
            ['Position', games.position],
            ['Appearances', games.appearences],
            ['Minutes Played', games.minutes],
            ['Total passes', passes.total],
            ['Goals', goals.total],
            ['Assists', goals.assists],
            ['Rating', games.rating],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-slate-100 py-2">
              <span className="text-teal-500 font-bold">{label}</span>
              <span className="font-bold text-slate-600">{value ?? '-'}</span>
            </div>
          ))}
        </div>
      </div>

      <JogadorExtras playerId={player.id} />
    </div>
  );
}
