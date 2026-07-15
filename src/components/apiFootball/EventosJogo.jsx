import { normalizarEvento, eventoIcone } from '../../services/apiFootballMapper.js';

export default function EventosJogo({ events = [] }) {
  const lista = Array.isArray(events) ? events.map(normalizarEvento) : [];

  if (!lista.length) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 text-center text-xs font-bold text-slate-500">
        Nenhum evento disponivel para este jogo.
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-4">
      <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">Eventos da partida</div>

      <div className="space-y-3">
        {lista.map((ev, index) => (
          <div key={`${ev.id}-${index}`} className="flex items-start gap-3">
            <div className="w-12 text-center">
              <div className="text-xs font-black text-white">{ev.minuto}{ev.extra ? `+${ev.extra}` : ""}'</div>
              <div className="text-lg leading-none">{eventoIcone(ev.tipo, ev.detalhe)}</div>
            </div>

            <div className="flex-1 bg-[#050816] rounded-2xl border border-white/5 p-3">
              <div className="text-xs font-black text-white">{ev.player || ev.time || ev.tipo}</div>
              <div className="text-[10px] font-bold text-slate-400 mt-1">
                {ev.time} • {ev.tipo}{ev.detalhe ? ` / ${ev.detalhe}` : ''}
              </div>
              {ev.assist && <div className="text-[10px] font-semibold text-slate-500 mt-1">Assistencia: {ev.assist}</div>}
              {ev.comentarios && <div className="text-[10px] font-semibold text-slate-500 mt-1">{ev.comentarios}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
