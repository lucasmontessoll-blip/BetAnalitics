import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Radio,
  Sparkles,
  Star,
  TrendingUp
} from 'lucide-react';
import {
  awayLogo,
  awayName,
  confidence,
  dateTimeLabel,
  elapsedText,
  homeLogo,
  homeName,
  homeScore,
  awayScore,
  initials,
  mainOdd,
  timeLabel
} from './matchProUtils.js';

/* BET_ETAPA_32A_MATCH_CARD_PRO */

function TeamLogo({ src, name, gerarEscudoAutomatico }) {
  const [failed, setFailed] = useState(false);
  const generated = typeof gerarEscudoAutomatico === 'function'
    ? gerarEscudoAutomatico(name)
    : null;
  const image = src || generated;

  if (image && !failed) {
    return (
      <img
        src={image}
        alt={name}
        onError={() => setFailed(true)}
        className="h-7 w-7 shrink-0 object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.35)]"
      />
    );
  }

  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[8px] font-black text-white/70 ring-1 ring-inset ring-white/[0.08]">
      {initials(name)}
    </span>
  );
}

const STYLES = {
  live: {
    accent: 'bg-red-500',
    glow: 'from-red-500/[0.10]',
    badge: 'bg-red-500/10 text-red-300 ring-red-500/20',
    icon: Radio,
    label: 'AO VIVO'
  },
  finished: {
    accent: 'bg-emerald-400',
    glow: 'from-emerald-400/[0.08]',
    badge: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
    icon: CheckCircle2,
    label: 'ENCERRADO'
  },
  prematch: {
    accent: 'bg-blue-500',
    glow: 'from-blue-500/[0.09]',
    badge: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
    icon: Clock3,
    label: 'PRÉ-JOGO'
  }
};

export default function MatchCardPro({
  jogo = {},
  variant = 'prematch',
  onOpen,
  onFavorite,
  favorito = false,
  gerarEscudoAutomatico
}) {
  const style = STYLES[variant] || STYLES.prematch;
  const StatusIcon = style.icon;
  const home = homeName(jogo);
  const away = awayName(jogo);
  const scoreH = homeScore(jogo);
  const scoreA = awayScore(jogo);
  const ia = confidence(jogo);
  const odd = mainOdd(jogo);
  const isPrematch = variant === 'prematch';
  const centralTop = variant === 'live'
    ? elapsedText(jogo) || 'LIVE'
    : variant === 'finished'
      ? 'FT'
      : dateTimeLabel(jogo);
  const centralMain = isPrematch
    ? timeLabel(jogo)
    : `${scoreH ?? 0}  –  ${scoreA ?? 0}`;

  function open() {
    if (typeof onOpen === 'function') onOpen(jogo);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      }}
      className="group relative isolate cursor-pointer overflow-hidden rounded-[22px] bg-[#0b0e14] shadow-[0_14px_36px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/[0.065] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0d1119] hover:ring-white/[0.11] focus:outline-none focus:ring-2 focus:ring-blue-400/40"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${style.glow} via-transparent to-transparent`} />
      <div className={`absolute inset-y-4 left-0 w-[3px] rounded-r-full ${style.accent}`} />

      <div className="relative px-4 py-3.5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-black tracking-[0.12em] ring-1 ring-inset ${style.badge}`}>
            <StatusIcon className="h-3 w-3" />
            {style.label}
          </span>

          <button
            type="button"
            aria-label={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            onClick={(event) => {
              event.stopPropagation();
              if (typeof onFavorite === 'function') onFavorite(event, jogo);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              favorito
                ? 'bg-yellow-400/12 text-yellow-300'
                : 'text-slate-600 hover:bg-white/[0.05] hover:text-yellow-300'
            }`}
          >
            <Star className={`h-4 w-4 ${favorito ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center gap-4">
          <div className="min-w-0 space-y-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <TeamLogo src={homeLogo(jogo)} name={home} gerarEscudoAutomatico={gerarEscudoAutomatico} />
              <span className="truncate text-[12px] font-extrabold text-slate-100">{home}</span>
              {!isPrematch && (
                <span className="ml-auto text-base font-black tabular-nums text-white">{scoreH ?? 0}</span>
              )}
            </div>

            <div className="flex min-w-0 items-center gap-2.5">
              <TeamLogo src={awayLogo(jogo)} name={away} gerarEscudoAutomatico={gerarEscudoAutomatico} />
              <span className="truncate text-[12px] font-extrabold text-slate-100">{away}</span>
              {!isPrematch && (
                <span className="ml-auto text-base font-black tabular-nums text-white">{scoreA ?? 0}</span>
              )}
            </div>
          </div>

          <div className="flex min-w-[82px] flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-500">
              {centralTop}
            </span>
            <span className={`mt-1 whitespace-nowrap font-black tabular-nums ${
              isPrematch ? 'text-xl text-white' : 'text-[13px] text-slate-400'
            }`}>
              {centralMain}
            </span>
            <ChevronRight className="mt-2 h-4 w-4 text-slate-700 transition group-hover:translate-x-0.5 group-hover:text-slate-400" />
          </div>
        </div>

        {(ia > 0 || odd !== null) && (
          <div className="mt-3 flex items-center gap-4 border-t border-white/[0.055] pt-2.5 text-[9px] font-bold text-slate-500">
            {ia > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-blue-400" />
                IA <strong className="text-slate-200">{ia}%</strong>
              </span>
            )}

            {odd !== null && (
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                Odd <strong className="text-slate-200">{odd.toFixed(2)}</strong>
              </span>
            )}

            <span className="ml-auto text-[8px] uppercase tracking-[0.1em] text-slate-700">
              Abrir análise
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
