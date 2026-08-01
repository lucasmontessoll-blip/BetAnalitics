import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  Crown,
  Eye,
  Flame,
  Lock,
  Target,
  Trophy,
  Zap
} from 'lucide-react';

import JogosPorPaisContinente from './JogosPorPaisContinente.jsx';
import LegalCompliance from './LegalCompliance.jsx';

const jogosDemoHome = [
  {
    id: 'demo-home-premium-1',
    demo: true,
    home_team: 'Flamengo',
    away_team: 'Palmeiras',
    league: 'Brasileirão Série A',
    status: 'Live',
    time_elapsed: 62,
    scoreHome: 2,
    scoreAway: 1,
    confianca_ia: 92,
    odd_principal: 1.78,
    mercado: 'Mais de 1.5 gols',
    risco: 'Baixo',
    ev: 14.2
  },
  {
    id: 'demo-home-premium-2',
    demo: true,
    home_team: 'Corinthians',
    away_team: 'São Paulo',
    league: 'Brasileirão Série A',
    status: 'NS',
    confianca_ia: 84,
    odd_principal: 2.70,
    mercado: 'Mais de 1.5 gols',
    risco: 'Médio',
    ev: 127.8
  },
  {
    id: 'demo-home-premium-3',
    demo: true,
    home_team: 'Liverpool',
    away_team: 'Man City',
    league: 'Premier League',
    status: 'NS',
    confianca_ia: 89,
    odd_principal: 2.10,
    mercado: 'Ambas marcam',
    risco: 'Médio',
    ev: 11.5
  }
];

function numero(valor, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
}

function normalizarJogo(jogo, index) {
  const casa =
    jogo?.home_team ||
    jogo?.time_casa ||
    jogo?.teams?.home?.name ||
    'Time Casa';

  const fora =
    jogo?.away_team ||
    jogo?.time_fora ||
    jogo?.teams?.away?.name ||
    'Time Fora';

  const confianca =
    numero(jogo?.confianca_ia, 0) ||
    numero(jogo?.ia_confidence, 0) ||
    numero(jogo?.confidence, 0) ||
    86 + index;

  const odd =
    numero(jogo?.odd_principal, 0) ||
    numero(jogo?.odd, 0) ||
    numero(jogo?.odds?.home, 0) ||
    1.75 + index * 0.08;

  const ev =
    numero(jogo?.ev, 0) ||
    Number((((confianca / 100) * odd - 1) * 100).toFixed(1));

  return {
    ...jogo,
    id: jogo?.id || jogo?.fixture?.id || jogo?.id_jogo || `home-${index}`,
    home_team: casa,
    away_team: fora,
    league: jogo?.league || jogo?.liga || jogo?.league_name || 'Liga PRO',
    status: jogo?.status || jogo?.status_short || jogo?.fixture?.status?.short || 'NS',
    time_elapsed: jogo?.time_elapsed || jogo?.tempo_jogo || jogo?.fixture?.status?.elapsed || '',
    scoreHome: numero(jogo?.scoreHome ?? jogo?.placar_casa ?? jogo?.goals?.home, 0),
    scoreAway: numero(jogo?.scoreAway ?? jogo?.placar_fora ?? jogo?.goals?.away, 0),
    confianca_ia: Math.round(Math.max(60, Math.min(99, confianca))),
    odd_principal: Number(odd).toFixed(2),
    mercado: jogo?.mercado || jogo?.market || 'Mais de 1.5 gols',
    risco: jogo?.risco || (confianca >= 90 ? 'Baixo' : 'Médio'),
    ev: Number(ev).toFixed(1)
  };
}

function CardMetrica({ icon: Icon, label, valor, destaque = '' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Icon className="h-4 w-4 text-blue-300" />
        {destaque && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[8px] font-black uppercase text-emerald-400">
            {destaque}
          </span>
        )}
      </div>

      <p className="text-[9px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-white">
        {valor}
      </p>
    </div>
  );
}

function BarraIA({ valor }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-blue-500"
        style={{ width: `${Math.max(5, Math.min(100, valor))}%` }}
      />
    </div>
  );
}

export default function TelaInicial({
  jogos,
  favoritos,
  onToggleFavorito,
  onAbrirJogo,
  renderizarListaJogos,
}) {
  const navigate = useNavigate();

  const listaIA = useMemo(() => {
    const origem = Array.isArray(jogos) && jogos.length ? jogos : jogosDemoHome;

    return origem
      .map(normalizarJogo)
      .sort((a, b) => b.confianca_ia - a.confianca_ia)
      .slice(0, 3);
  }, [jogos]);

  const oportunidade = listaIA[0] || jogosDemoHome[0];

  const jogosAoVivo = listaIA.filter((jogo) => {
    const status = String(jogo.status || '').toLowerCase();
    return status === 'live' || status.includes('ao vivo');
  }).length;

  const mediaIA = Math.round(
    listaIA.reduce((soma, jogo) => soma + numero(jogo.confianca_ia, 0), 0) /
      Math.max(1, listaIA.length)
  );

  const melhorOdd = listaIA.reduce((maior, jogo) => {
    const odd = numero(jogo.odd_principal, 0);
    return odd > maior ? odd : maior;
  }, 0);

  function abrirOportunidade() {
    if (typeof onAbrirJogo === 'function') {
      onAbrirJogo(oportunidade);
    }
  }

  return (
    <div className="w-full px-4 pb-28">
      <section className="mt-3 overflow-hidden rounded-[32px] border border-blue-500/20 bg-gradient-to-br from-blue-950 via-slate-950 to-black p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-300">
            <Zap className="mr-1 h-3 w-3" />
            IA Premium
          </span>

          <span className="inline-flex items-center rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-black uppercase text-black">
            <Crown className="mr-1 h-3 w-3" />
            PRO
          </span>
        </div>

        <h1 className="mt-5 text-3xl font-black leading-tight text-white">
          Encontre as melhores oportunidades do dia
        </h1>

        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300">
          A IA analisa jogos, odds, mercado, risco e confiança para destacar as entradas com maior valor.
        </p>

        <div className="mt-5 rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-black">
              <Flame className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-300">
                Oportunidade do dia
              </p>

              <h2 className="mt-1 truncate text-xl font-black text-white">
                {oportunidade.home_team} x {oportunidade.away_team}
              </h2>

              <p className="mt-1 text-xs font-bold text-slate-400">
                {oportunidade.league}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-black/20 p-3">
              <p className="text-[9px] font-black uppercase text-slate-500">IA</p>
              <p className="mt-1 text-lg font-black text-white">{oportunidade.confianca_ia}%</p>
            </div>

            <div className="rounded-2xl bg-black/20 p-3">
              <p className="text-[9px] font-black uppercase text-slate-500">Odd</p>
              <p className="mt-1 text-lg font-black text-yellow-300">{oportunidade.odd_principal}</p>
            </div>

            <div className="rounded-2xl bg-black/20 p-3">
              <p className="text-[9px] font-black uppercase text-slate-500">EV</p>
              <p className="mt-1 text-lg font-black text-emerald-400">+{oportunidade.ev}%</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
              <span>Consenso IA</span>
              <span>{oportunidade.confianca_ia}%</span>
            </div>

            <BarraIA valor={oportunidade.confianca_ia} />
          </div>

          <button
            type="button"
            onClick={abrirOportunidade}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase text-slate-950"
          >
            <Eye className="h-4 w-4" />
            Ver análise
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate('/radar')}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-xs font-black uppercase text-white"
          >
            Abrir Radar IA
          </button>

          <button
            type="button"
            onClick={() => navigate('/pro')}
            className="flex items-center justify-center gap-2 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-xs font-black uppercase text-yellow-300"
          >
            <Lock className="h-4 w-4" />
            Área PRO
          </button>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <CardMetrica
          icon={Target}
          label="Precisão IA"
          valor={`${mediaIA}%`}
          destaque="hoje"
        />

        <CardMetrica
          icon={Activity}
          label="Ao vivo"
          valor={jogosAoVivo}
        />

        <CardMetrica
          icon={Bell}
          label="Alertas PRO"
          valor="3"
        />

        <CardMetrica
          icon={Trophy}
          label="Melhor odd"
          valor={melhorOdd ? melhorOdd.toFixed(2) : '1.78'}
        />
      </section>

      <section className="mt-5 rounded-3xl border border-white/10 bg-[#0f172a] p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
            <Trophy className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-black text-white">
              Ranking IA do dia
            </h2>

            <p className="text-xs font-bold text-slate-400">
              Top oportunidades calculadas pelo motor IA
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {listaIA.map((jogo, index) => (
            <button
              key={jogo.id}
              type="button"
              onClick={() => typeof onAbrirJogo === 'function' && onAbrirJogo(jogo)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-yellow-300">
                    #{index + 1} oportunidade
                  </p>

                  <h3 className="mt-1 truncate text-sm font-black text-white">
                    {jogo.home_team} x {jogo.away_team}
                  </h3>

                  <p className="mt-1 truncate text-xs font-bold text-slate-400">
                    {jogo.mercado} • Odd {jogo.odd_principal}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-500/10 px-3 py-2 text-center">
                  <p className="text-[9px] font-black uppercase text-blue-300">IA</p>
                  <p className="text-lg font-black text-white">{jogo.confianca_ia}%</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-5">
        <JogosPorPaisContinente
          jogos={jogos}
          favoritos={favoritos}
          onToggleFavorito={onToggleFavorito}
          onAbrirJogo={onAbrirJogo}
        />
      </div>

      {typeof renderizarListaJogos === 'function' ? renderizarListaJogos() : null}

      <div className="px-4 mt-10 mb-10 text-center">
        <LegalCompliance modo="botao" />
      </div>
    </div>
  );
}
