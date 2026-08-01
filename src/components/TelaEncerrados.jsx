import React, { useMemo } from 'react';
import { CheckCircle2, Trophy } from 'lucide-react';
import MatchCardPro from './MatchCardPro.jsx';
import {
  favoriteContains,
  groupByLeague,
  isFinished,
  leagueCountry,
  leagueLogo,
  normalizeMatch
} from './matchProUtils.js';

/* BET_ETAPA_32A_TELA_ENCERRADOS */

const DEMO = [
  {
    id: 'demo-ft-flamengo-palmeiras',
    demo: true,
    league_name: 'Brasileirão Série A',
    league_country: 'Brasil',
    status: 'Finished',
    time_elapsed: 'FT',
    home_team: 'Flamengo',
    away_team: 'Palmeiras',
    scoreHome: 2,
    scoreAway: 1,
    confianca_ia: 92,
    odd_principal: 1.82,
    mercado_principal: 'Vitória Flamengo',
    comentario: 'Flamengo foi mais eficiente e confirmou a vitória.',
    estatisticas: {
      posseCasa: 57,
      posseFora: 43,
      chutesCasa: 16,
      chutesFora: 9,
      chutesNoAlvoCasa: 7,
      chutesNoAlvoFora: 3,
      escanteiosCasa: 6,
      escanteiosFora: 4
    },
    escalacoes: {
      casa: ['Rossi', 'Varela', 'Léo Pereira', 'Léo Ortiz', 'Ayrton Lucas', 'Pulgar', 'De la Cruz', 'Arrascaeta'],
      fora: ['Weverton', 'Mayke', 'Gómez', 'Murilo', 'Piquerez', 'Aníbal Moreno', 'Raphael Veiga', 'Estêvão']
    },
    classificacao: { casa_posicao: 2, fora_posicao: 4, casa_pontos: 38, fora_pontos: 34 },
    h2h: { resumo: 'Flamengo 2 vitórias, 2 empates e Palmeiras 1 vitória.', vitorias_casa: 2, empates: 2, vitorias_fora: 1 }
  },
  {
    id: 'demo-ft-real-city',
    demo: true,
    league_name: 'Champions League',
    league_country: 'Europa',
    status: 'Finished',
    time_elapsed: 'FT',
    home_team: 'Real Madrid',
    away_team: 'Manchester City',
    scoreHome: 3,
    scoreAway: 2,
    confianca_ia: 88,
    odd_principal: 2.10,
    mercado_principal: 'Ambos marcam',
    estatisticas: {
      posseCasa: 46,
      posseFora: 54,
      chutesCasa: 14,
      chutesFora: 17,
      chutesNoAlvoCasa: 8,
      chutesNoAlvoFora: 6,
      escanteiosCasa: 5,
      escanteiosFora: 7
    }
  }
];

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
      <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400">
        {partidas.length} finalizados
      </span>
    </div>
  );
}

export default function TelaEncerrados({
  jogos = [],
  setMenuAtivo,
  setJogoSelecionado,
  toggleFavorito,
  favoritos = [],
  gerarEscudoAutomatico
}) {
  const matches = useMemo(() => {
    const real = (Array.isArray(jogos) ? jogos : []).filter(isFinished).map(normalizeMatch);
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
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.18em] text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resultados
          </div>
          <h1 className="mt-1 text-xl font-black tracking-tight text-white">Partidas encerradas</h1>
          <p className="mt-1 text-[10px] font-medium text-slate-600">
            Placar final, desempenho e análise pós-jogo.
          </p>
        </div>

        <div className="flex h-10 min-w-[58px] items-center justify-center rounded-2xl bg-emerald-400/10 text-sm font-black text-emerald-300">
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
                  variant="finished"
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
