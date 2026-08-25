import React, { useMemo, useState } from 'react';
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Radio,
  RefreshCw,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

import LegalCompliance from './LegalCompliance.jsx';
import {
  awayLogo,
  awayName,
  awayScore,
  dateTimeLabel,
  elapsedText,
  homeLogo,
  homeName,
  homeScore,
  isFinished,
  isLive,
  leagueName,
} from './matchProUtils.js';

/* BET_ETAPA_37A_HOME_REAL */

function TeamLogo({ src, name }) {
  const [erro, setErro] = useState(false);

  if (src && !erro) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErro(true)}
        className="h-10 w-10 shrink-0 object-contain"
      />
    );
  }

  const iniciais = String(name || 'FC')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-black text-slate-300 ring-1 ring-inset ring-white/[0.08]">
      {iniciais || 'FC'}
    </div>
  );
}

function LiveCard({ jogo, onOpen }) {
  const casa = homeName(jogo);
  const fora = awayName(jogo);

  const placarCasa = homeScore(jogo);
  const placarFora = awayScore(jogo);

  const minuto =
    elapsedText(jogo) ||
    jogo?.time_elapsed ||
    jogo?.tempo ||
    jogo?.minuto ||
    jogo?.fixture?.status?.elapsed ||
    '';

  return (
    <button
      type="button"
      onClick={() => onOpen?.(jogo)}
      className="relative w-full overflow-hidden rounded-[24px] bg-[#0d111c] p-4 text-left shadow-[0_18px_45px_rgba(0,0,0,0.30)] ring-1 ring-inset ring-red-500/25 transition active:scale-[0.99]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(239,68,68,0.12),transparent_38%)]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
              {leagueName(jogo)}
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-red-300 ring-1 ring-inset ring-red-500/25">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
            Ao vivo
            {minuto ? ` · ${minuto}` : ''}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="min-w-0 text-center">
            <TeamLogo
              src={homeLogo(jogo)}
              name={casa}
            />

            <p className="mt-2 truncate text-[10px] font-black text-white">
              {casa}
            </p>
          </div>

          <div className="min-w-[72px] text-center">
            <div className="text-3xl font-black tracking-tight text-white">
              {placarCasa ?? 0}
              <span className="mx-2 text-slate-700">:</span>
              {placarFora ?? 0}
            </div>

            <p className="mt-1 text-[7px] font-black uppercase tracking-[0.16em] text-red-400">
              Em andamento
            </p>
          </div>

          <div className="min-w-0 text-center">
            <div className="flex justify-end">
              <TeamLogo
                src={awayLogo(jogo)}
                name={fora}
              />
            </div>

            <p className="mt-2 truncate text-[10px] font-black text-white">
              {fora}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center rounded-xl bg-red-500/[0.07] px-3 py-2 text-[8px] font-black uppercase tracking-wider text-red-300">
          Toque para acompanhar a partida
        </div>
      </div>
    </button>
  );
}

function ResumoCard({
  icon: Icon,
  titulo,
  valor,
  destaque = '',
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-[#0b0f18] px-3 py-3.5 ring-1 ring-inset ring-white/[0.055]">
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${destaque}`} />

        <p className="truncate text-[7px] font-black uppercase tracking-[0.13em] text-slate-600">
          {titulo}
        </p>
      </div>

      <p className="mt-2 text-xl font-black tabular-nums text-white">
        {valor}
      </p>
    </div>
  );
}

export default function TelaInicial({
  jogos = [],
  onAbrirJogo,
  renderizarListaJogos,
}) {
  const partidas = useMemo(
    () => (
      Array.isArray(jogos)
        ? jogos.filter(Boolean)
        : []
    ),
    [jogos]
  );

  const jogosAoVivo = useMemo(
    () => partidas.filter(isLive),
    [partidas]
  );

  const jogosEncerrados = useMemo(
    () => partidas.filter(isFinished),
    [partidas]
  );

  const jogosAgendados = useMemo(
    () => partidas.filter(
      (jogo) => !isLive(jogo) && !isFinished(jogo)
    ),
    [partidas]
  );

  const aoVivoOrdenados = useMemo(
    () => (
      [...jogosAoVivo].sort((a, b) => {
        const minutoA = Number(
          a?.time_elapsed ??
          a?.tempo ??
          a?.minuto ??
          a?.fixture?.status?.elapsed ??
          0
        );

        const minutoB = Number(
          b?.time_elapsed ??
          b?.tempo ??
          b?.minuto ??
          b?.fixture?.status?.elapsed ??
          0
        );

        return minutoB - minutoA;
      })
    ),
    [jogosAoVivo]
  );

  const ListaJogos =
    typeof renderizarListaJogos === 'function'
      ? renderizarListaJogos
      : null;

  return (
    <main className="w-full px-3 pb-28 sm:px-4">

      {/* CABECALHO */}
      <section className="relative overflow-hidden rounded-[28px] bg-[#080c15] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.30)] ring-1 ring-inset ring-blue-500/15">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(37,99,235,0.16),transparent_38%),radial-gradient(circle_at_100%_100%,rgba(14,165,233,0.07),transparent_40%)]" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.18em] text-blue-300">
                <Activity className="h-3.5 w-3.5" />
                Central de partidas
              </div>

              <h1 className="mt-2 text-[25px] font-black leading-tight tracking-[-0.035em] text-white">
                Todos os jogos
              </h1>

              <p className="mt-2 max-w-md text-[10px] font-medium leading-5 text-slate-500">
                Partidas reais organizadas por status, com jogos ao vivo em destaque.
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-500/15">
              <Trophy className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ResumoCard
              icon={Trophy}
              titulo="Todos"
              valor={partidas.length}
              destaque="text-blue-300"
            />

            <ResumoCard
              icon={Radio}
              titulo="Ao vivo"
              valor={jogosAoVivo.length}
              destaque="text-red-400"
            />

            <ResumoCard
              icon={CalendarClock}
              titulo="Pré-jogo"
              valor={jogosAgendados.length}
              destaque="text-yellow-300"
            />

            <ResumoCard
              icon={CheckCircle2}
              titulo="Encerrados"
              valor={jogosEncerrados.length}
              destaque="text-emerald-300"
            />
          </div>
        </div>
      </section>


      {/* AO VIVO */}
      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-red-400" />

              <h2 className="text-base font-black tracking-tight text-white">
                Ao vivo agora
              </h2>
            </div>

            <p className="mt-1 text-[9px] font-semibold text-slate-600">
              Partidas em andamento recebem prioridade na Home.
            </p>
          </div>

          {jogosAoVivo.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[8px] font-black text-red-300 ring-1 ring-inset ring-red-500/20">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              {jogosAoVivo.length}
            </span>
          )}
        </div>

        {aoVivoOrdenados.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {aoVivoOrdenados.map((jogo, index) => (
              <LiveCard
                key={
                  jogo?.id ??
                  jogo?.fixture?.id ??
                  `live-${index}`
                }
                jogo={jogo}
                onOpen={onAbrirJogo}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] bg-[#0a0e16] px-5 py-6 text-center ring-1 ring-inset ring-white/[0.055]">
            <Clock3 className="mx-auto h-5 w-5 text-slate-700" />

            <p className="mt-3 text-[11px] font-black text-slate-300">
              Nenhuma partida ao vivo agora
            </p>

            <p className="mt-1 text-[9px] font-semibold text-slate-600">
              Os jogos aparecerão aqui automaticamente quando iniciarem.
            </p>
          </div>
        )}
      </section>


      {/* TODOS OS JOGOS */}
      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-blue-300" />

              <h2 className="text-base font-black tracking-tight text-white">
                Todos os jogos
              </h2>
            </div>

            <p className="mt-1 text-[9px] font-semibold text-slate-600">
              Pré-jogo, ao vivo e encerrados em uma única lista.
            </p>
          </div>

          <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[8px] font-black text-blue-300">
            {partidas.length} partidas
          </span>
        </div>

        {ListaJogos ? (
          <ListaJogos />
        ) : partidas.length === 0 ? (
          <div className="rounded-[22px] bg-[#0a0e16] px-5 py-8 text-center ring-1 ring-inset ring-white/[0.055]">
            <RefreshCw className="mx-auto h-5 w-5 text-slate-700" />

            <p className="mt-3 text-[11px] font-black text-slate-300">
              Nenhum jogo disponível
            </p>

            <p className="mt-1 text-[9px] font-semibold text-slate-600">
              A lista será atualizada quando a API fornecer novas partidas.
            </p>
          </div>
        ) : null}
      </section>


      {/* ORIGEM DOS DADOS */}
      <section className="mt-8 rounded-[22px] bg-emerald-500/[0.035] px-4 py-3.5 ring-1 ring-inset ring-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
              Dados reais
            </p>

            <p className="mt-0.5 text-[8px] font-semibold leading-relaxed text-slate-600">
              A Home não cria partidas, odds ou percentuais artificiais.
            </p>
          </div>
        </div>
      </section>


      <div className="mt-10 px-4 text-center">
        <LegalCompliance modo="botao" />
      </div>

    </main>
  );
}
