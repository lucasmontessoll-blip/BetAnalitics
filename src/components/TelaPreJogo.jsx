import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import MatchCardPro from './MatchCardPro.jsx';
import {
  dateKey,
  favoriteContains,
  groupByLeague,
  isPreMatch,
  leagueCountry,
  leagueLogo,
  matchDate,
  normalizeMatch
} from './matchProUtils.js';

/* BET_ETAPA_32A_TELA_PRE_JOGO */

const DAY_NAMES = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

function startOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value, amount) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function toISO(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function demoDate(days, hour, minute = 0) {
  const date = addDays(startOfDay(), days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function demoMatches() {
  return [
    {
      id: 'pre-chelsea-tottenham',
      demo: true,
      league_name: 'Amistoso internacional de clubes',
      league_country: 'Internacional',
      status: 'Not Started',
      starting_at: demoDate(1, 6, 45),
      home_team: 'Chelsea',
      away_team: 'Tottenham',
      confianca_ia: 84,
      odd_principal: 1.95,
      odds: { home: 1.95, draw: 3.45, away: 3.80 },
      probabilidades: { casa: 47, empate: 28, fora: 25 },
      mercado_principal: 'Mais de 1.5 gols'
    },
    {
      id: 'pre-new-york-toronto',
      demo: true,
      league_name: 'Major League Soccer',
      league_country: 'Estados Unidos',
      status: 'NS',
      starting_at: demoDate(1, 20, 30),
      home_team: 'New York City',
      away_team: 'Toronto',
      confianca_ia: 81,
      odd_principal: 1.78,
      odds: { home: 1.78, draw: 3.60, away: 4.20 },
      probabilidades: { casa: 55, empate: 25, fora: 20 },
      mercado_principal: 'Vitória New York City'
    },
    {
      id: 'pre-leverkusen-essen',
      demo: true,
      league_name: 'Amistoso internacional de clubes',
      league_country: 'Internacional',
      status: 'Scheduled',
      starting_at: demoDate(2, 6, 0),
      home_team: 'Leverkusen',
      away_team: 'Rot-Weiss Essen',
      confianca_ia: 89,
      odd_principal: 1.42,
      odds: { home: 1.42, draw: 4.40, away: 6.80 },
      probabilidades: { casa: 67, empate: 20, fora: 13 },
      mercado_principal: 'Vitória Leverkusen'
    },
    {
      id: 'pre-tokyo-dortmund',
      demo: true,
      league_name: 'Amistoso internacional de clubes',
      league_country: 'Internacional',
      status: 'Not Started',
      starting_at: demoDate(2, 7, 0),
      home_team: 'FC Tokyo',
      away_team: 'Dortmund',
      confianca_ia: 86,
      odd_principal: 1.66,
      odds: { home: 4.80, draw: 3.90, away: 1.66 },
      probabilidades: { casa: 19, empate: 25, fora: 56 },
      mercado_principal: 'Dortmund ou empate'
    }
  ];
}

function LeagueHeading({ name, partidas }) {
  const first = partidas[0] || {};
  const logo = leagueLogo(first);

  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
          {logo ? <img src={logo} alt="" className="h-4 w-4 object-contain" /> : <Trophy className="h-3.5 w-3.5 text-slate-600" />}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[10px] font-black text-slate-200">{name}</h3>
          <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-700">{leagueCountry(first)}</p>
        </div>
      </div>
      <span className="text-[8px] font-black uppercase tracking-wider text-blue-400">
        {partidas.length} agendados
      </span>
    </div>
  );
}

export default function TelaPreJogo({
  jogos = [],
  setMenuAtivo,
  setJogoSelecionado,
  toggleFavorito,
  favoritos = [],
  gerarEscudoAutomatico
}) {
  const today = useMemo(() => startOfDay(), []);
  const [weekStart, setWeekStart] = useState(today);
  const [selectedDate, setSelectedDate] = useState(toISO(today));
  const adjusted = useRef(false);

  const matches = useMemo(() => {
    const real = (Array.isArray(jogos) ? jogos : [])
      .filter(isPreMatch)
      .map(normalizeMatch)
      .sort((a, b) => (matchDate(a)?.getTime() ?? Number.MAX_SAFE_INTEGER) - (matchDate(b)?.getTime() ?? Number.MAX_SAFE_INTEGER));

    return real.length > 0 ? real : demoMatches().map(normalizeMatch);
  }, [jogos]);

  const availableDates = useMemo(() => (
    Array.from(new Set(matches.map(dateKey).filter(Boolean))).sort()
  ), [matches]);

  useEffect(() => {
    if (adjusted.current || availableDates.length === 0) return;
    const todayISO = toISO(today);
    const initial = availableDates.includes(todayISO) ? todayISO : availableDates[0];
    setSelectedDate(initial);
    setWeekStart(startOfDay(`${initial}T12:00:00`));
    adjusted.current = true;
  }, [availableDates, today]);

  const week = useMemo(() => (
    Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      return {
        date,
        iso: toISO(date),
        name: DAY_NAMES[date.getDay()],
        day: String(date.getDate()).padStart(2, '0'),
        month: String(date.getMonth() + 1).padStart(2, '0')
      };
    })
  ), [weekStart]);

  const matchesForDay = useMemo(() => (
    matches.filter((match) => dateKey(match) === selectedDate)
  ), [matches, selectedDate]);

  const groups = useMemo(() => groupByLeague(matchesForDay), [matchesForDay]);

  function open(jogo) {
    if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
    if (typeof setJogoSelecionado === 'function') setJogoSelecionado(jogo);
  }

  return (
    <main className="w-full px-3 pb-28 pt-3 sm:px-4">
      <header className="mb-5 px-1">
        <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.18em] text-blue-400">
          <CalendarDays className="h-3.5 w-3.5" />
          Agenda esportiva
        </div>
        <h1 className="mt-1 text-xl font-black tracking-tight text-white">Próximas partidas</h1>
        <p className="mt-1 text-[10px] font-medium text-slate-600">
          Calendário, horários, odds e análise antes do jogo.
        </p>
      </header>

      <section className="mb-7 overflow-hidden rounded-[24px] bg-[#0b0e14] p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.25)] ring-1 ring-inset ring-white/[0.06]">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-600">Semana selecionada</p>
            <p className="mt-1 text-[11px] font-black text-slate-200">
              {selectedDate ? selectedDate.split('-').reverse().join('/') : 'Selecione uma data'}
            </p>
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setWeekStart((date) => addDays(date, -7))}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-slate-500 transition hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((date) => addDays(date, 7))}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-slate-500 transition hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {week.map((day) => {
            const active = day.iso === selectedDate;
            const hasGames = availableDates.includes(day.iso);

            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => setSelectedDate(day.iso)}
                className={`relative min-w-0 rounded-xl px-1 py-2.5 text-center transition ${
                  active
                    ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)]'
                    : 'bg-white/[0.025] text-slate-600 hover:bg-white/[0.045]'
                }`}
              >
                <span className="block text-[7px] font-black">{day.name}</span>
                <span className="mt-1 block text-sm font-black tabular-nums">{day.day}</span>
                <span className="mt-0.5 block text-[7px] font-bold opacity-70">{day.month}</span>
                {hasGames && !active && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-500" />}
              </button>
            );
          })}
        </div>
      </section>

      {matchesForDay.length === 0 ? (
        <div className="py-14 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-slate-800" />
          <p className="mt-3 text-sm font-black text-slate-400">Nenhuma partida nesta data</p>
          <p className="mt-1 text-[10px] font-medium text-slate-700">Escolha outro dia no calendário.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([league, partidas]) => (
            <section key={league}>
              <LeagueHeading name={league} partidas={partidas} />
              <div className="space-y-2.5">
                {partidas.map((jogo) => (
                  <MatchCardPro
                    key={jogo.id}
                    jogo={jogo}
                    variant="prematch"
                    favorito={favoriteContains(favoritos, jogo.id)}
                    onOpen={open}
                    onFavorite={(event, match) => {
                      if (typeof toggleFavorito === 'function') toggleFavorito(event, match.id);
                    }}
                    gerarEscudoAutomatico={gerarEscudoAutomatico}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
