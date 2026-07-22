import React, { useMemo } from 'react';
import { Radio, Activity } from 'lucide-react';
import CardJogo from './CardJogo.jsx';

function ehAoVivo(jogo) {
  const texto = [
    jogo?.status,
    jogo?.status_short,
    jogo?.fixture?.status?.short,
    jogo?.fixture?.status?.long,
    jogo?.time_elapsed,
    jogo?.tempo_jogo
  ].filter(Boolean).join(' ').toLowerCase().trim();

  return texto === 'live' ||
    texto.includes('live') ||
    texto.includes('ao vivo') ||
    texto.includes('1h') ||
    texto.includes('2h') ||
    texto.includes('ht') ||
    texto.includes('intervalo');
}

const jogosAoVivoDemo = [
  {
    id: 'aovivo-flamengo-palmeiras',
    demo: true,
    league_id: 71,
    league_name: 'Brasileirao',
    league_country: 'Brasil',
    status: 'Live',
    home_team: 'Flamengo',
    away_team: 'Palmeiras',
    scoreHome: 2,
    scoreAway: 1,
    placar_casa: 2,
    placar_fora: 1,
    confianca_ia: 92,
    odd_principal: 1.82,
    mercado_principal: 'Vitoria Flamengo',
    time_elapsed: "62'"
  },
  {
    id: 'aovivo-botafogo-gremio',
    demo: true,
    league_id: 71,
    league_name: 'Brasileirao',
    league_country: 'Brasil',
    status: 'Live',
    home_team: 'Botafogo',
    away_team: 'Gremio',
    scoreHome: 1,
    scoreAway: 0,
    placar_casa: 1,
    placar_fora: 0,
    confianca_ia: 87,
    odd_principal: 1.74,
    mercado_principal: 'Mais de 1.5 gols',
    time_elapsed: "38'"
  }
];

export default function TelaAoVivo({
  jogos = [],
  userData,
  setMenuAtivo,
  setJogoSelecionado,
  toggleFavorito,
  favoritos,
  escudoTime,
  gerarEscudoAutomatico,
}) {
  const jogosAoVivo = useMemo(() => {
    const lista = [
      ...(Array.isArray(jogos) ? jogos : []),
      ...jogosAoVivoDemo
    ];

    const mapa = new Map();

    lista
      .filter((jogo) => ehAoVivo(jogo))
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
      <div className="bg-gradient-to-br from-red-500/20 via-[#0f172a] to-orange-500/10 border border-red-500/30 rounded-[32px] p-5 mb-5 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-400/30 flex items-center justify-center">
            <Radio className="w-6 h-6 text-red-300" />
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
              Partidas em andamento
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">
              Ao Vivo
            </h2>
          </div>
        </div>

        <p className="text-[12px] text-slate-400 font-bold">
          Aqui ficam somente jogos em andamento, com placar, tempo e leitura da IA.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
            <div className="text-[9px] text-slate-400 font-black uppercase">
              Jogos ao vivo
            </div>
            <div className="text-xl font-black text-white">
              {jogosAoVivo.length}
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
            <div className="text-[9px] text-slate-400 font-black uppercase">
              Status
            </div>
            <div className="text-xl font-black text-red-300">
              LIVE
            </div>
          </div>
        </div>
      </div>

      {jogosAoVivo.length === 0 ? (
        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 text-center">
          <Activity className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-white font-black text-lg">
            Nenhum jogo ao vivo agora
          </h3>
          <p className="text-slate-400 text-sm font-bold mt-1">
            Quando houver partidas em andamento, elas vão aparecer aqui.
          </p>
        </div>
      ) : (
        <div>
          {jogosAoVivo.map((jogo) => (
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
              statusEhAoVivo={ehAoVivo}
              statusEhEncerrado={() => false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
