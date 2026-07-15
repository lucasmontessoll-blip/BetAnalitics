import { History } from 'lucide-react';

function statusJogo(fixture) {
  const s = fixture?.status?.short || '';
  if (['FT', 'AET', 'PEN'].includes(s)) return 'Finalizado';
  if (['1H', '2H', 'HT', 'LIVE'].includes(s)) return 'Ao vivo';
  return fixture?.status?.long || 'Jogo';
}

export default function H2HCard({ h2h = [] }) {
  if (!Array.isArray(h2h) || !h2h.length) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 text-center text-xs font-bold text-slate-500">
        Confronto direto ainda nao disponivel.
      </div>
    );
  }

  const ultimos = h2h.slice(0, 8);

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-4">
      <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 mb-4">
        <History className="w-3 h-3" />
        Cara a cara / H2H
      </div>

      <div className="space-y-2">
        {ultimos.map((jogo, index) => {
          const home = jogo?.teams?.home || {};
          const away = jogo?.teams?.away || {};
          const goals = jogo?.goals || {};
          const league = jogo?.league || {};
          return (
            <div key={`${jogo?.fixture?.id || index}`} className="bg-[#050816] border border-white/5 rounded-2xl p-3">
              <div className="flex items-center justify-between gap-2 text-[9px] font-bold text-slate-500 mb-2">
                <span className="truncate">{league.name} • {league.season}</span>
                <span>{statusJogo(jogo.fixture)}</span>
              </div>

              <div className="grid grid-cols-[1fr_54px_1fr] items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={home.logo} className="w-6 h-6 object-contain" alt="" />
                  <span className="text-xs font-black text-white truncate">{home.name}</span>
                </div>
                <div className="text-center text-sm font-black text-white">
                  {goals.home ?? '-'} - {goals.away ?? '-'}
                </div>
                <div className="flex items-center justify-end gap-2 min-w-0">
                  <span className="text-xs font-black text-white truncate">{away.name}</span>
                  <img src={away.logo} className="w-6 h-6 object-contain" alt="" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
