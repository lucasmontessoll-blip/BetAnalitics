import React, { useMemo } from 'react';
import { Target, TrendingUp, ShieldCheck, Flame, BarChart3 } from 'lucide-react';
import CardJogo from './CardJogo.jsx';

function numero(valor, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
}

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
    texto.includes('ht');
}

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

const radarDemo = [
  {
    id: 'radar-flamengo-palmeiras',
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
    id: 'radar-real-barcelona',
    demo: true,
    league_id: 140,
    league_name: 'La Liga',
    league_country: 'Espanha',
    status: 'NS',
    home_team: 'Real Madrid',
    away_team: 'Barcelona',
    scoreHome: 0,
    scoreAway: 0,
    placar_casa: 0,
    placar_fora: 0,
    confianca_ia: 89,
    odd_principal: 2.05,
    mercado_principal: 'Mais de 1.5 gols',
    time_elapsed: ''
  },
  {
    id: 'radar-liverpool-city',
    demo: true,
    league_id: 39,
    league_name: 'Premier League',
    league_country: 'Inglaterra',
    status: 'NS',
    home_team: 'Liverpool',
    away_team: 'Manchester City',
    scoreHome: 0,
    scoreAway: 0,
    placar_casa: 0,
    placar_fora: 0,
    confianca_ia: 87,
    odd_principal: 1.95,
    mercado_principal: 'Ambos marcam',
    time_elapsed: ''
  }
];

function scoreRadar(jogo) {
  const confianca = numero(jogo?.confianca_ia, 80);
  const odd = numero(jogo?.odd_principal, 1.75);
  const ev = ((confianca / 100) * odd - 1) * 100;

  return Math.round((confianca * 0.7) + (Math.max(ev, 0) * 0.3));
}

function CardResumo({ titulo, valor, subtitulo, icon: Icon, cor = 'text-blue-400' }) {
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
            {titulo}
          </div>
          <div className={`text-xl font-black ${cor}`}>
            {valor}
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-1">
            {subtitulo}
          </div>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${cor}`} />
        </div>
      </div>
    </div>
  );
}

export default function TelaRadarIA({
  jogos = [],
  userData,
  setMenuAtivo,
  setJogoSelecionado,
  toggleFavorito,
  favoritos,
  escudoTime,
  gerarEscudoAutomatico,
}) {
  const oportunidades = useMemo(() => {
    const lista = [
      ...(Array.isArray(jogos) ? jogos : []),
      ...radarDemo
    ];

    const mapa = new Map();

    lista
      .filter((jogo) => !ehEncerrado(jogo))
      .filter((jogo) => numero(jogo?.confianca_ia, 0) >= 75 || jogo?.demo)
      .forEach((jogo, index) => {
        const id = String(
          jogo?.id ||
          jogo?.fixture?.id ||
          `${jogo?.home_team || 'casa'}-${jogo?.away_team || 'fora'}-${index}`
        );

        mapa.set(id, jogo);
      });

    return Array.from(mapa.values())
      .sort((a, b) => scoreRadar(b) - scoreRadar(a))
      .slice(0, 12);
  }, [jogos]);

  const melhor = oportunidades[0];
  const mediaConfianca = oportunidades.length
    ? Math.round(oportunidades.reduce((acc, j) => acc + numero(j?.confianca_ia, 80), 0) / oportunidades.length)
    : 0;

  const melhorOdd = oportunidades.length
    ? Math.max(...oportunidades.map((j) => numero(j?.odd_principal, 1.5))).toFixed(2)
    : '0.00';

  return (
    <div className="px-4 animate-fade-in pb-28 w-full">
      <div className="bg-gradient-to-br from-blue-600/25 via-[#0f172a] to-purple-500/10 border border-blue-500/30 rounded-[32px] p-5 mb-5 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
            <Target className="w-6 h-6 text-blue-300" />
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
              Motor de oportunidades
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">
              Radar IA
            </h2>
          </div>
        </div>

        <p className="text-[12px] text-slate-400 font-bold">
          Jogos com maior confiança, melhor odd e maior potencial de valor.
        </p>

        {melhor && (
          <div className="mt-4 bg-black/20 rounded-3xl p-4 border border-blue-400/20">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                Oportunidade principal
              </span>
            </div>

            <div className="text-lg font-black text-white">
              {melhor.home_team} x {melhor.away_team}
            </div>

            <div className="text-[12px] text-slate-400 font-bold mt-1">
              {melhor.mercado_principal || 'Mercado recomendado'} · Confiança {numero(melhor.confianca_ia, 80)}%
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <CardResumo
          titulo="Jogos"
          valor={oportunidades.length}
          subtitulo="No radar"
          icon={Target}
          cor="text-blue-400"
        />

        <CardResumo
          titulo="Media IA"
          valor={`${mediaConfianca}%`}
          subtitulo="Confiança"
          icon={ShieldCheck}
          cor="text-green-400"
        />

        <CardResumo
          titulo="Melhor odd"
          valor={melhorOdd}
          subtitulo="Valor"
          icon={TrendingUp}
          cor="text-yellow-300"
        />
      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-black text-white uppercase">
            Ranking por segurança
          </h3>
        </div>

        <div className="space-y-2">
          {oportunidades.slice(0, 3).map((jogo, index) => (
            <div
              key={`ranking-${jogo.id || index}`}
              className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-3"
            >
              <div>
                <div className="text-[11px] font-black text-white">
                  #{index + 1} {jogo.home_team} x {jogo.away_team}
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  {jogo.mercado_principal || 'Mercado IA'}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-green-400">
                  {numero(jogo.confianca_ia, 80)}%
                </div>
                <div className="text-[9px] text-slate-500 font-bold">
                  Odd {numero(jogo.odd_principal, 1.7).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {oportunidades.map((jogo) => (
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
          statusEhEncerrado={ehEncerrado}
        />
      ))}
    </div>
  );
}
