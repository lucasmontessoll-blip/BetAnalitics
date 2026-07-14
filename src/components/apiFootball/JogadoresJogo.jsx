function PlayerRow({ item }) {
  const player = item?.player || {};
  const stats = item?.statistics?.[0] || {};
  const games = stats.games || {};
  const shots = stats.shots || {};
  const passes = stats.passes || {};
  const goals = stats.goals || {};
  const cards = stats.cards || {};

  return (
    <div className="bg-[#050816] border border-white/5 rounded-2xl p-3 flex items-center gap-3">
      <img src={player.photo} className="w-10 h-10 rounded-full object-cover bg-slate-800" alt="" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-black text-white truncate">{player.name}</div>
        <div className="text-[9px] font-bold text-slate-500 uppercase">
          {games.position || 'Jogador'} • Nota {games.rating || '-'}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center min-w-[130px]">
        <div>
          <div className="text-[8px] font-black text-slate-500 uppercase">Gols</div>
          <div className="text-xs font-black text-white">{goals.total ?? 0}</div>
        </div>
        <div>
          <div className="text-[8px] font-black text-slate-500 uppercase">Chutes</div>
          <div className="text-xs font-black text-white">{shots.total ?? 0}</div>
        </div>
        <div>
          <div className="text-[8px] font-black text-slate-500 uppercase">Passes</div>
          <div className="text-xs font-black text-white">{passes.total ?? 0}</div>
        </div>
        <div>
          <div className="text-[8px] font-black text-slate-500 uppercase">Cart.</div>
          <div className="text-xs font-black text-yellow-400">{(cards.yellow || 0) + (cards.red || 0)}</div>
        </div>
      </div>
    </div>
  );
}

export default function JogadoresJogo({ players = [], jogo }) {
  if (!Array.isArray(players) || !players.length) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 text-center text-xs font-bold text-slate-500">
        Estatísticas de jogadores ainda não disponíveis para esta partida.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {players.map((teamBlock) => (
        <div key={teamBlock?.team?.id} className="bg-[#0f172a] border border-white/10 rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-3">
            <img src={teamBlock?.team?.logo} className="w-6 h-6 object-contain" alt="" />
            <div className="text-xs font-black text-white uppercase">{teamBlock?.team?.name}</div>
          </div>

          <div className="space-y-2">
            {(teamBlock?.players || []).slice(0, 18).map((p) => (
              <PlayerRow key={p?.player?.id} item={p} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
