import React, { useMemo } from 'react';
import { Radio, Trophy } from 'lucide-react';
import MatchCardPro from './MatchCardPro.jsx';
import {
  favoriteContains,
  groupByLeague,
  isLive,
  leagueCountry,
  leagueLogo,
  normalizeMatch
} from './matchProUtils.js';

/* BET_ETAPA_32A_TELA_AO_VIVO */

const DEMO = [{
  id: 'demo-live-flamengo-palmeiras',
  demo: true,
  league_name: 'Brasileirão Série A',
  league_country: 'Brasil',
  status: 'Live',
  time_elapsed: "62'",
  home_team: 'Flamengo',
  away_team: 'Palmeiras',
  scoreHome: 2,
  scoreAway: 1,
  confianca_ia: 92,
  odd_principal: 1.78,
  mercado_principal: 'Vitória Flamengo',
  estatisticas: {
    posseCasa: 58,
    posseFora: 42,
    chutesCasa: 15,
    chutesFora: 8,
    chutesNoAlvoCasa: 7,
    chutesNoAlvoFora: 3,
    escanteiosCasa: 7,
    escanteiosFora: 3
  }
}];

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
          <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-700">
            {leagueCountry(first)}
          </p>
        </div>
      </div>
      <span className="text-[8px] font-black uppercase tracking-wider text-red-400">
        {partidas.length} ao vivo
      </span>
    </div>
  );
}

export default function TelaAoVivo({
  jogos = [],
  setMenuAtivo,
  setJogoSelecionado,
  toggleFavorito,
  favoritos = [],
  gerarEscudoAutomatico
}) {
  const matches = useMemo(() => {
    const real = (Array.isArray(jogos) ? jogos : []).filter(isLive).map(normalizeMatch);
    return real.length > 0 ? real : DEMO.map(normalizeMatch);
  }, [jogos]);

  const groups = useMemo(() => groupByLeague(matches), [matches]);

  function open(jogo) {
    if (typeof setMenuAtivo === 'function') setMenuAtivo('Todos os Jogos');
    if (typeof setJogoSelecionado === 'function') setJogoSelecionado(jogo);
  }

  return (
    <main className="w-full px-3 pb-28 pt-3 sm:px-4">
      <header className="mb-6 flex items-end justify-between gap-4 px-1">
        <div>
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.18em] text-red-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Central ao vivo
          </div>
          <h1 className="mt-1 text-xl font-black tracking-tight text-white">Partidas em andamento</h1>
          <p className="mt-1 text-[10px] font-medium text-slate-600">
            Placar, minuto, IA e mercado em uma visão limpa.
          </p>
        </div>

        <div className="flex h-10 min-w-[58px] items-center justify-center rounded-2xl bg-red-500/10 text-sm font-black text-red-300">
          {matches.length}
        </div>
      </header>

      <div className="space-y-6">
        {Object.entries(groups).map(([league, partidas]) => (
          <section key={league}>
            <LeagueHeading name={league} partidas={partidas} />
            <div className="space-y-2.5">
              {partidas.map((jogo) => (
                <MatchCardPro
                  key={jogo.id}
                  jogo={jogo}
                  variant="live"
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
    </main>
  );
}
