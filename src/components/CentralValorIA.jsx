import React, {
  useMemo,
} from 'react';

import {
  BarChart3,
  Bell,
  Brain,
  ChevronRight,
  Clock3,
  Crown,
  Database,
  History,
  Landmark,
  RefreshCw,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import {
  useRadarOddsReal,
} from '../hooks/useRadarOddsReal.js';

function CardAcao({
  icon: Icone,
  titulo,
  texto,
  cor,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-3xl border border-white/10 bg-[#0f172a] p-4 text-left active:scale-[0.98]"
    >
      <div
        className={`${cor} mb-3 flex h-10 w-10 items-center justify-center rounded-2xl`}
      >
        <Icone className="h-5 w-5 text-white" />
      </div>

      <div className="text-sm font-black text-white">
        {titulo}
      </div>

      <div className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">
        {texto}
      </div>
    </button>
  );
}

function dataPartida(valor) {
  if (!valor) {
    return 'Horário indisponível';
  }

  const data =
    new Date(valor);

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return 'Horário indisponível';
  }

  return data.toLocaleString(
    'pt-BR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    }
  );
}

function sinal(valor) {
  return valor > 0
    ? '+'
    : '';
}

const perguntasRapidas = [
  'Explique as probabilidades reais disponíveis no radar.',
  'Como interpretar EV sem inventar dados?',
  'Explique a diferença entre probabilidade e precisão histórica.',
];

export default function CentralValorIA({
  jogos = [],
  userData,
  setViewMode,
  setJogoSelecionado,
  setAiOpen,
  setAiQuery,
}) {
  const {
    oportunidades,
    loading,
    erro,
    analisados,
    recarregar,
  } =
    useRadarOddsReal(jogos);

  const mediaProbabilidade =
    useMemo(
      () => {
        if (
          oportunidades.length === 0
        ) {
          return null;
        }

        const total =
          oportunidades.reduce(
            (soma, item) =>
              soma +
              Number(
                item.probabilidade ||
                0
              ),
            0
          );

        return Number(
          (
            total /
            oportunidades.length
          ).toFixed(1)
        );
      },
      [oportunidades]
    );

  const abrirPergunta =
    (pergunta) => {
      setAiQuery?.(pergunta);
      setAiOpen?.(true);
    };

  return (
    <div className="w-full animate-fade-in px-4 pb-28">

      <div className="relative mb-5 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-5 shadow-2xl">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative">

          <div className="mb-3 flex items-center justify-between gap-3">

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-blue-100">
              <Brain className="h-4 w-4" />
              Radar real
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={recarregar}
              className="rounded-full bg-black/20 p-2 text-blue-100 ring-1 ring-inset ring-white/10 disabled:opacity-50"
              aria-label="Atualizar Radar"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? 'animate-spin'
                    : ''
                }`}
              />
            </button>

          </div>

          <h2 className="text-2xl font-black leading-tight">
            Odds e probabilidades sem valores simulados
          </h2>

          <p className="mt-2 text-xs font-semibold leading-relaxed text-blue-100/90">
            O radar cruza a previsão disponível para a partida com odds 1X2 fornecidas pela API. Quando uma das fontes não existe, o jogo não recebe números artificiais.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">

            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="text-xl font-black">
                {mediaProbabilidade !== null
                  ? `${mediaProbabilidade}%`
                  : '-'}
              </div>

              <div className="text-[8px] font-bold uppercase text-blue-100">
                Prob. média
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="text-xl font-black">
                {oportunidades.length}
              </div>

              <div className="text-[8px] font-bold uppercase text-blue-100">
                Com odds reais
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="text-xl font-black">
                {analisados}
              </div>

              <div className="text-[8px] font-bold uppercase text-blue-100">
                Consultados
              </div>
            </div>

          </div>

          <div className="mt-3 flex items-center gap-2 text-[8px] font-bold text-blue-100/70">
            <Database className="h-3.5 w-3.5" />
            Fontes: API-Football /predictions + /odds
          </div>

        </div>
      </div>


      <div className="mb-5 grid grid-cols-2 gap-3">

        <CardAcao
          icon={Wallet}
          titulo="Gestão de Banca"
          texto="Stake, ROI e controle de risco."
          cor="bg-emerald-600"
          onClick={() =>
            setViewMode?.(
              'banca-pro'
            )
          }
        />

        <CardAcao
          icon={Bell}
          titulo="Alertas IA"
          texto="Acompanhe alertas configurados."
          cor="bg-amber-600"
          onClick={() =>
            setViewMode?.(
              'alertas-ia'
            )
          }
        />

        <CardAcao
          icon={History}
          titulo="Histórico IA"
          texto="Performance registrada na sua conta."
          cor="bg-blue-600"
          onClick={() =>
            setViewMode?.(
              'historico'
            )
          }
        />

        <CardAcao
          icon={BarChart3}
          titulo="Performance IA"
          texto="Indicadores de desempenho."
          cor="bg-emerald-600"
          onClick={() =>
            setViewMode?.(
              'performance-ia'
            )
          }
        />

        <CardAcao
          icon={Landmark}
          titulo="Casas Parceiras"
          texto="Acesse comparadores e parceiros."
          cor="bg-purple-600"
          onClick={() =>
            setViewMode?.(
              'casas-parceiras'
            )
          }
        />

        <CardAcao
          icon={Crown}
          titulo="Área VIP"
          texto="Recursos profissionais da conta."
          cor="bg-purple-600"
          onClick={() =>
            setViewMode?.(
              'vip-pro'
            )
          }
        />

      </div>


      <div className="mb-5 rounded-3xl border border-white/10 bg-[#0f172a] p-4">

        <div className="mb-4 flex items-center justify-between gap-3">

          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Mercado 1X2
            </div>

            <div className="text-base font-black text-white">
              Oportunidades com dados reais
            </div>
          </div>

          <TrendingUp className="h-5 w-5 text-emerald-400" />

        </div>

        {erro && (
          <div className="mb-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-[10px] font-bold text-amber-300">
            {erro}
          </div>
        )}

        {loading &&
        oportunidades.length === 0 ? (

          <div className="rounded-2xl border border-white/10 bg-[#050816] p-6 text-center">

            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-400" />

            <p className="mt-3 text-xs font-black text-white">
              Consultando predictions e odds...
            </p>

            <p className="mt-1 text-[9px] font-semibold text-slate-500">
              O radar consulta no máximo cinco partidas pré-jogo por atualização.
            </p>

          </div>

        ) : oportunidades.length === 0 ? (

          <div className="rounded-2xl border border-white/10 bg-[#050816] p-6 text-center">

            <Database className="mx-auto h-7 w-7 text-slate-600" />

            <p className="mt-3 text-sm font-black text-white">
              Nenhuma oportunidade real disponível
            </p>

            <p className="mt-2 text-[10px] font-semibold leading-relaxed text-slate-500">
              As partidas consultadas ainda não possuem simultaneamente previsão e odd 1X2 válidas. O aplicativo não preencherá esses campos com números demonstrativos.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {oportunidades.map(
              (jogo, index) => (
                <button
                  key={jogo.id}
                  type="button"
                  onClick={() =>
                    setJogoSelecionado?.(
                      jogo.raw
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#050816] p-4 text-left active:scale-[0.99]"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">
                      <div className="text-[9px] font-black uppercase text-slate-600">
                        #{index + 1} · {jogo.liga}
                      </div>

                      <div className="mt-1 truncate text-sm font-black text-white">
                        {jogo.casa} x {jogo.fora}
                      </div>
                    </div>

                    <div className="shrink-0 rounded-full bg-blue-500/10 px-2.5 py-1 text-[9px] font-black text-blue-300 ring-1 ring-inset ring-blue-500/20">
                      {jogo.probabilidade}%
                    </div>

                  </div>

                  <div className="mt-3 grid grid-cols-3 divide-x divide-white/[0.06] rounded-2xl bg-white/[0.035] py-3">

                    <div className="min-w-0 px-2 text-center">
                      <div className="text-[7px] font-black uppercase text-slate-600">
                        Mercado
                      </div>

                      <div className="mt-1 truncate text-[9px] font-black text-slate-300">
                        {jogo.mercado}
                      </div>
                    </div>

                    <div className="px-2 text-center">
                      <div className="text-[7px] font-black uppercase text-slate-600">
                        Melhor odd
                      </div>

                      <div className="mt-1 text-sm font-black text-yellow-300">
                        {jogo.odd.toFixed(2)}
                      </div>
                    </div>

                    <div className="px-2 text-center">
                      <div className="text-[7px] font-black uppercase text-slate-600">
                        EV
                      </div>

                      <div
                        className={`mt-1 text-sm font-black ${
                          jogo.ev >= 0
                            ? 'text-emerald-300'
                            : 'text-red-300'
                        }`}
                      >
                        {sinal(jogo.ev)}
                        {jogo.ev.toFixed(1)}%
                      </div>
                    </div>

                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-[8px] font-semibold text-slate-600">

                    <span className="truncate">
                      Bookmaker: {jogo.bookmaker}
                    </span>

                    <span className="flex shrink-0 items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      {dataPartida(
                        jogo.partida_em
                      )}
                    </span>

                  </div>

                </button>
              )
            )}

          </div>
        )}

      </div>


      <div className="mb-5 rounded-3xl border border-white/10 bg-[#0f172a] p-4">

        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-400" />

          <div className="text-sm font-black text-white">
            Como ler este Radar
          </div>
        </div>

        <p className="text-[10px] font-semibold leading-relaxed text-slate-500">
          A probabilidade vem do endpoint de predictions. A odd é a melhor cotação 1X2 encontrada para o mesmo resultado previsto entre os bookmakers retornados pela fonte. O EV é calculado diretamente desses dois valores e pode ser positivo ou negativo.
        </p>

      </div>


      <div className="mb-5 rounded-3xl border border-white/10 bg-[#0f172a] p-4">

        <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
          Perguntas rápidas
        </div>

        <div className="grid gap-2">

          {perguntasRapidas.map(
            (pergunta) => (
              <button
                key={pergunta}
                type="button"
                onClick={() =>
                  abrirPergunta(
                    pergunta
                  )
                }
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#050816] px-4 py-3 text-left text-xs font-bold text-slate-300 active:scale-[0.99]"
              >
                {pergunta}

                <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />
              </button>
            )
          )}

        </div>
      </div>


      <div className="grid grid-cols-3 gap-2">

        <button
          type="button"
          onClick={() =>
            setViewMode?.(
              'favoritos'
            )
          }
          className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#0f172a] p-3 text-xs font-black text-white active:scale-[0.98]"
        >
          <Star className="h-5 w-5 text-yellow-400" />
          Favoritos
        </button>

        <button
          type="button"
          onClick={() =>
            setViewMode?.(
              'historico'
            )
          }
          className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#0f172a] p-3 text-xs font-black text-white active:scale-[0.98]"
        >
          <History className="h-5 w-5 text-emerald-400" />
          Histórico
        </button>

        <button
          type="button"
          onClick={() =>
            abrirPergunta(
              'Analise apenas os dados reais disponíveis no Radar de hoje.'
            )
          }
          className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#0f172a] p-3 text-xs font-black text-white active:scale-[0.98]"
        >
          <Target className="h-5 w-5 text-blue-400" />
          Analisar
        </button>

      </div>

      <div className="mt-4 text-center text-[8px] font-semibold text-slate-700">
        Plano atual: {userData?.is_vip ? 'PRO' : 'FREE'}
      </div>

    </div>
  );
}
