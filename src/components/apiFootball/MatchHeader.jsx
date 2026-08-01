import { Star } from 'lucide-react';

function dataCurta(iso) {
  if (!iso) return '';

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch (e) {
    return iso;
  }
}

export default function MatchHeader({ jogo, detalhe }) {
  const fixture = detalhe?.fixture?.fixture || detalhe?.fixture || {};
  const league = detalhe?.fixture?.league || jogo || {};

  const referee = fixture?.referee || jogo?.referee || '';
  const venue = fixture?.venue?.name || jogo?.venue || '';

  const status =
    jogo?.status === 'Live'
      ? `AO VIVO ${String(jogo?.time_elapsed || '').replace("'", '')}'`
      : jogo?.status === 'Finished'
        ? 'FINALIZADO'
        : 'AGENDADO';

  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-[#101827] px-4 py-3 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase">
        <div className="flex items-center gap-2 min-w-0">
          {league?.logo && (
            <img
              src={league.logo}
              className="w-4 h-4 object-contain"
              alt=""
            />
          )}

          <span className="truncate">
            {jogo?.league_country || league?.country || 'World'} • {jogo?.league_name || league?.name || 'Competicao'}
          </span>
        </div>

        <span className="text-slate-300 truncate">
          {jogo?.round || league?.round || ''}
        </span>
      </div>

      <div className="px-4 py-5">
        <div className="grid grid-cols-3 items-center text-center gap-2">
          <div className="min-w-0">
            <img
              src={jogo?.home_image}
              className="w-16 h-16 mx-auto object-contain mb-2"
              alt={jogo?.home_team || 'Mandante'}
            />

            <div className="text-xs font-black text-white truncate flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-slate-500 flex-shrink-0" />
              <span className="truncate">{jogo?.home_team || 'Mandante'}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-black text-slate-300">
              {dataCurta(jogo?.starting_at)}
            </div>

            <div className="text-4xl font-black text-white leading-tight">
              {jogo?.status === 'Not Started'
                ? 'VS'
                : `${jogo?.scoreHome ?? 0} - ${jogo?.scoreAway ?? 0}`}
            </div>

            <div
              className={`inline-flex mt-1 rounded-full px-3 py-1 text-[9px] font-black uppercase ${
                jogo?.status === 'Live'
                  ? 'bg-red-500 text-white'
                  : jogo?.status === 'Finished'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-blue-500/20 text-blue-300'
              }`}
            >
              {status}
            </div>
          </div>

          <div className="min-w-0">
            <img
              src={jogo?.away_image}
              className="w-16 h-16 mx-auto object-contain mb-2"
              alt={jogo?.away_team || 'Visitante'}
            />

            <div className="text-xs font-black text-white truncate flex items-center justify-center gap-1">
              <span className="truncate">{jogo?.away_team || 'Visitante'}</span>
              <Star className="w-3 h-3 text-slate-500 flex-shrink-0" />
            </div>
          </div>
        </div>

        {(referee || venue) && (
          <div className="mt-4 text-[10px] font-semibold text-slate-400 text-center leading-relaxed">
            {referee && (
              <div>
                Arbitro: <span className="text-slate-200">{referee}</span>
              </div>
            )}

            {venue && (
              <div>
                Estadio: <span className="text-slate-200">{venue}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
