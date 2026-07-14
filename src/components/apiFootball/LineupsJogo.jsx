import CampoLineup from './CampoLineup.jsx';

export default function LineupsJogo({ lineups = [], jogo }) {
  const home = lineups.find(l => Number(l?.team?.id) === Number(jogo?.home_id)) || lineups[0];
  const away = lineups.find(l => Number(l?.team?.id) === Number(jogo?.away_id)) || lineups[1];

  return (
    <div className="space-y-3">
      <CampoLineup home={home} away={away} />

      {(home?.startXI?.length || away?.startXI?.length) && (
        <div className="bg-[#0f172a] rounded-2xl border border-white/10 overflow-hidden">
          <div className="bg-[#101827] text-center py-3 text-[10px] font-black uppercase text-slate-400">
            Start XI
          </div>

          <div className="grid grid-cols-2 gap-0">
            <div className="p-3 border-r border-white/10">
              <div className="text-xs font-black text-white mb-2 truncate">{home?.team?.name || jogo?.home_team}</div>
              {(home?.startXI || []).map((p, i) => (
                <div key={`home-xi-${i}`} className="flex items-center gap-2 text-[10px] font-bold text-slate-300 py-1 border-b border-white/5 last:border-b-0">
                  <span className="w-6 h-6 rounded bg-white text-slate-900 grid place-items-center font-black">{p?.player?.number || '-'}</span>
                  <span className="truncate">{p?.player?.name}</span>
                </div>
              ))}
            </div>

            <div className="p-3">
              <div className="text-xs font-black text-white mb-2 truncate">{away?.team?.name || jogo?.away_team}</div>
              {(away?.startXI || []).map((p, i) => (
                <div key={`away-xi-${i}`} className="flex items-center gap-2 text-[10px] font-bold text-slate-300 py-1 border-b border-white/5 last:border-b-0">
                  <span className="w-6 h-6 rounded bg-cyan-500 text-slate-900 grid place-items-center font-black">{p?.player?.number || '-'}</span>
                  <span className="truncate">{p?.player?.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
