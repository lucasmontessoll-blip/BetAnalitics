import React from 'react';
import { Star } from 'lucide-react';

function jogoEncerradoFallback(jogo) {
  const texto = [
    jogo?.status,
    jogo?.status_short,
    jogo?.fixture?.status?.short,
    jogo?.fixture?.status?.long,
    jogo?.time_elapsed,
    jogo?.tempo_jogo
  ].filter(Boolean).join(' ').toLowerCase().trim();

  return texto === 'ft' ||
    texto === 'aet' ||
    texto === 'pen' ||
    texto.includes('finished') ||
    texto.includes('match finished') ||
    texto.includes('finalizado') ||
    texto.includes('encerrado');
}

export default function CardJogo({
  j,
  userData,
  setMenuAtivo,
  setJogoSelecionado,
  toggleFavorito,
  favoritos = [],
  escudoTime,
  gerarEscudoAutomatico,
  statusEhAoVivo,
  statusEhEncerrado,
}) {
  const aoVivo = typeof statusEhAoVivo === 'function'
    ? statusEhAoVivo(j)
    : j?.status === 'Live';

  const encerrado = typeof statusEhEncerrado === 'function'
    ? statusEhEncerrado(j)
    : jogoEncerradoFallback(j);

  const placarCasa = j?.scoreHome ?? j?.placar_casa ?? j?.goals?.home ?? 0;
  const placarFora = j?.scoreAway ?? j?.placar_fora ?? j?.goals?.away ?? 0;

  const escudoCasa = typeof escudoTime === 'function'
    ? escudoTime(j?.home_image, j?.home_team)
    : j?.home_image;

  const escudoFora = typeof escudoTime === 'function'
    ? escudoTime(j?.away_image, j?.away_team)
    : j?.away_image;

  const fallbackCasa = typeof gerarEscudoAutomatico === 'function'
    ? gerarEscudoAutomatico(j?.home_team)
    : '';

  const fallbackFora = typeof gerarEscudoAutomatico === 'function'
    ? gerarEscudoAutomatico(j?.away_team)
    : '';

  return (
    <div
      onClick={() => {
        if (!userData?.is_vip) {
          setMenuAtivo('assinar pro');
          return;
        }

        setJogoSelecionado(j);
      }}
      className="bg-[#0f172a] border border-white/10 rounded-3xl p-5 shadow-lg mb-4 cursor-pointer hover:border-blue-500/50 transform-gpu transition-colors"
    >
      <div className="flex justify-between items-center mb-5">
        {aoVivo ? (
          <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            Ao Vivo {String(j?.time_elapsed || '').replace("'", "")}'
          </span>
        ) : (
          <span className="text-slate-400 text-[10px] font-bold uppercase">
            {encerrado ? 'Finalizado' : 'Agendado'}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (typeof toggleFavorito === 'function') {
              toggleFavorito(e, j?.id);
            }
          }}
          className="p-1"
        >
          <Star
            className={`w-5 h-5 ${
              favoritos.includes(j?.id)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-slate-600'
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-3 items-center text-center mb-4">
        <div className="flex flex-col items-center gap-2">
          <img
            src={escudoCasa}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackCasa;
            }}
            className="w-10 h-10 object-contain"
            alt={j?.home_team || 'Time casa'}
          />

          <span className="text-[10px] font-bold text-slate-200 truncate w-full">
            {j?.home_team}
          </span>
        </div>

        <div className="text-2xl font-black">
          {aoVivo || encerrado ? (
            `${placarCasa} - ${placarFora}`
          ) : (
            <span className="text-slate-600">-</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <img
            src={escudoFora}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackFora;
            }}
            className="w-10 h-10 object-contain"
            alt={j?.away_team || 'Time fora'}
          />

          <span className="text-[10px] font-bold text-slate-200 truncate w-full">
            {j?.away_team}
          </span>
        </div>
      </div>
    </div>
  );
}
