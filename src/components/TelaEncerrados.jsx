import React, { useMemo } from 'react';
import { CheckCircle2, Trophy } from 'lucide-react';
import CardJogo from './CardJogo.jsx';

function ehEncerrado(jogo) {
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

const jogosEncerradosDemo = [
  {
    id: 'encerrado-flamengo-palmeiras',
    demo: true,
    league_id: 71,
    league_name: 'Brasileirao',
    league_country: 'Brasil',
    status: 'Finished',
    home_team: 'Flamengo',
    away_team: 'Palmeiras',
    scoreHome: 2,
    scoreAway: 1,
    placar_casa: 2,
    placar_fora: 1,
    confianca_ia: 92,
    odd_principal: 1.82,
    mercado_principal: 'Vitoria Flamengo',
    time_elapsed: 'FT'
  },
  {
    id: 'encerrado-real-city',
    demo: true,
    league_id: 2,
    league_name: 'Champions League',
    league_country: 'Europa',
    status: 'Finished',
    home_team: 'Real Madrid',
    away_team: 'Manchester City',
    scoreHome: 3,
    scoreAway: 2,
    placar_casa: 3,
    placar_fora: 2,
    confianca_ia: 88,
    odd_principal: 2.10,
    mercado_principal: 'Ambos marcam',
    time_elapsed: 'FT'
  },
  {
    id: 'encerrado-liverpool-arsenal',
    demo: true,
    league_id: 39,
    league_name: 'Premier League',
    league_country: 'Inglaterra',
    status: 'Finished',
    home_team: 'Liverpool',
    away_team: 'Arsenal',
    scoreHome: 1,
    scoreAway: 1,
    placar_casa: 1,
    placar_fora: 1,
    confianca_ia: 84,
    odd_principal: 1.95,
    mercado_principal: 'Mais de 1.5 gols',
    time_elapsed: 'FT'
  }
];

export default function TelaEncerrados({
  jogos = [],
  userData,
  setMenuAtivo,
  setJogoSelecionado,
  toggleFavorito,
  favoritos,
  escudoTime,
  gerarEscudoAutomatico,
}) {
  const jogosEncerrados = useMemo(() => {
    const lista = [
      ...(Array.isArray(jogos) ? jogos : []),
      ...jogosEncerradosDemo
    ];

    const mapa = new Map();

    lista
      .filter((jogo) => ehEncerrado(jogo))
      .forEach((jogo, index) => {
        const id = String(
          jogo?.id ||
          jogo?.fixture?.id ||
          `${jogo?.home_team || 'casa'}-${jogo?.away_team || 'fora'}-${index}`
        );

        mapa.set(id, jogo);
      });

    return Array.from(mapa.values());
  }, [jogos]);

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="bg-gradient-to-br from-green-500/20 via-[#0f172a] to-blue-500/10 border border-green-500/30 rounded-[32px] p-5 mb-5 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-400/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-300" />
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">
              Jogos finalizados
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">
              Encerrado
            </h2>
          </div>
        </div>

        <p className="text-[12px] text-slate-400 font-bold">
          Aqui ficam somente partidas terminadas, com placar final e informações da IA.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
            <div className="text-[9px] text-slate-400 font-black uppercase">
              Total
            </div>
            <div className="text-xl font-black text-white">
              {jogosEncerrados.length}
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
            <div className="text-[9px] text-slate-400 font-black uppercase">
              Status
            </div>
            <div className="text-xl font-black text-green-300">
              FT
            </div>
          </div>
        </div>
      </div>

      {jogosEncerrados.length === 0 ? (
        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 text-center">
          <Trophy className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-white font-black text-lg">
            Nenhum jogo encerrado agora
          </h3>
          <p className="text-slate-400 text-sm font-bold mt-1">
            Quando a API trouxer partidas finalizadas, elas vão aparecer aqui.
          </p>
        </div>
      ) : (
        <div>
          {jogosEncerrados.map((jogo) => (
            <CardJogo
              key={jogo.id}
              j={jogo}
              userData={userData}
              setMenuAtivo={setMenuAtivo}
              setJogoSelecionado={setJogoSelecionado}
              toggleFavorito={toggleFavorito}
              favoritos={favoritos}
              escudoTime={escudoTime}
              gerarEscudoAutomatico={gerarEscudoAutomatico}
              statusEhAoVivo={() => false}
              statusEhEncerrado={ehEncerrado}
            />
          ))}
        </div>
      )}
    </div>
  );
}
