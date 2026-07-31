import React, { useMemo, useState } from 'react';
import { Activity, Radio, Star, Trophy } from 'lucide-react';

/* BET_ETAPA_28_AO_VIVO_COMPACTO_INICIO */

const JOGOS_DEMO_AO_VIVO = [
  {
    id: 'demo-live-flamengo-palmeiras',
    demo: true,
    league_id: 71,
    league_name: 'BrasileirÃ£o SÃ©rie A',
    league_country: 'Brasil',
    status: 'Live',
    time_elapsed: "62'",
    home_team: 'Flamengo',
    away_team: 'Palmeiras',
    scoreHome: 2,
    scoreAway: 1,
    confianca_ia: 92,
    odd_principal: 1.79,
    mercado_principal: 'VitÃ³ria Flamengo',
    estatisticas: {
      posseCasa: 58,
      posseFora: 42,
      chutesCasa: 15,
      chutesFora: 8,
      escanteiosCasa: 7,
      escanteiosFora: 3,
    },
  },
];

function primeiroValor(...valores) {
  return valores.find((valor) => valor !== undefined && valor !== null && valor !== '');
}

function texto(...valores) {
  const resultado = primeiroValor(...valores);
  if (typeof resultado === 'object') return '';
  return String(resultado ?? '');
}

function numero(valor, fallback = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : fallback;
}

function statusNormalizado(jogo = {}) {
  return texto(
    jogo.status,
    jogo.status_short,
    jogo.status_jogo,
    jogo.fixture?.status?.short,
    jogo.fixture?.status?.long,
    jogo.situacao,
    '',
  ).toLowerCase();
}

function jogoEncerrado(jogo = {}) {
  const status = statusNormalizado(jogo);
  return (
    status === 'ft' ||
    status === 'aet' ||
    status === 'pen' ||
    status.includes('finished') ||
    status.includes('finalizado') ||
    status.includes('encerrado') ||
    status.includes('fim de jogo')
  );
}

function jogoAoVivo(jogo = {}) {
  if (jogoEncerrado(jogo)) return false;

  const status = statusNormalizado(jogo);
  const tempo = texto(
    jogo.time_elapsed,
    jogo.tempo_jogo,
    jogo.tempo,
    jogo.minuto,
    jogo.fixture?.status?.elapsed,
    '',
  ).toLowerCase();

  return (
    status === 'live' ||
    status === '1h' ||
    status === '2h' ||
    status === 'ht' ||
    status.includes('ao vivo') ||
    status.includes('in play') ||
    status.includes('intervalo') ||
    /^\d{1,3}'?$/.test(tempo.trim())
  );
}

function minutoDoJogo(jogo = {}) {
  const status = statusNormalizado(jogo);
  if (status === 'ht' || status.includes('intervalo')) return 'INT';

  const bruto = primeiroValor(
    jogo.time_elapsed,
    jogo.tempo_jogo,
    jogo.tempo,
    jogo.minuto,
    jogo.fixture?.status?.elapsed,
  );

  const valor = texto(bruto, '').trim();
  if (!valor) return 'LIVE';

  const encontrado = valor.match(/\d{1,3}/)?.[0];
  return encontrado ? `${encontrado}'` : valor.toUpperCase();
}

function normalizarJogo(jogo = {}, indice = 0) {
  const mandante = texto(
    jogo.home_team,
    jogo.time_casa,
    jogo.homeTeam,
    jogo.mandante,
    jogo.teams?.home?.name,
    jogo.equipes?.casa?.nome,
    'Mandante',
  );

  const visitante = texto(
    jogo.away_team,
    jogo.time_fora,
    jogo.awayTeam,
    jogo.visitante,
    jogo.teams?.away?.name,
    jogo.equipes?.fora?.nome,
    'Visitante',
  );

  const id = texto(
    jogo.id,
    jogo.id_jogo,
    jogo.fixture?.id,
    `${mandante}-${visitante}-${indice}`,
  );

  return {
    ...jogo,
    id,
    home_team: mandante,
    time_casa: texto(jogo.time_casa, mandante),
    homeTeam: texto(jogo.homeTeam, mandante),
    away_team: visitante,
    time_fora: texto(jogo.time_fora, visitante),
    awayTeam: texto(jogo.awayTeam, visitante),
    home_image: primeiroValor(
      jogo.home_image,
      jogo.logo_casa,
      jogo.homeLogo,
      jogo.logoHome,
      jogo.teams?.home?.logo,
      jogo.equipes?.casa?.logo,
    ),
    logo_casa: primeiroValor(
      jogo.logo_casa,
      jogo.home_image,
      jogo.homeLogo,
      jogo.teams?.home?.logo,
    ),
    away_image: primeiroValor(
      jogo.away_image,
      jogo.logo_fora,
      jogo.awayLogo,
      jogo.logoAway,
      jogo.teams?.away?.logo,
      jogo.equipes?.fora?.logo,
    ),
    logo_fora: primeiroValor(
      jogo.logo_fora,
      jogo.away_image,
      jogo.awayLogo,
      jogo.teams?.away?.logo,
    ),
    scoreHome: numero(
      primeiroValor(
        jogo.scoreHome,
        jogo.home_score,
        jogo.placar_casa,
        jogo.score_home,
        jogo.goals?.home,
      ),
      0,
    ),
    placar_casa: numero(
      primeiroValor(
        jogo.placar_casa,
        jogo.scoreHome,
        jogo.home_score,
        jogo.goals?.home,
      ),
      0,
    ),
    scoreAway: numero(
      primeiroValor(
        jogo.scoreAway,
        jogo.away_score,
        jogo.placar_fora,
        jogo.score_away,
        jogo.goals?.away,
      ),
      0,
    ),
    placar_fora: numero(
      primeiroValor(
        jogo.placar_fora,
        jogo.scoreAway,
        jogo.away_score,
        jogo.goals?.away,
      ),
      0,
    ),
    league_name: texto(
      jogo.league_name,
      jogo.liga,
      jogo.campeonato,
      jogo.league?.name,
      jogo.league?.league?.name,
      'Outros jogos',
    ),
    league_country: texto(
      jogo.league_country,
      jogo.country_name,
      typeof jogo.country === 'string' ? jogo.country : '',
      jogo.country?.name,
      jogo.area?.name,
      'Mundo',
    ),
    status: texto(jogo.status, jogo.fixture?.status?.short, 'Live'),
    time_elapsed: primeiroValor(
      jogo.time_elapsed,
      jogo.tempo_jogo,
      jogo.tempo,
      jogo.minuto,
      jogo.fixture?.status?.elapsed,
      'LIVE',
    ),
    confianca_ia: numero(
      primeiroValor(jogo.confianca_ia, jogo.confiancaIA, jogo.confianca),
      0,
    ),
    odd_principal: numero(
      primeiroValor(jogo.odd_principal, jogo.odd, jogo.odds?.home),
      0,
    ),
  };
}

function iniciais(nome = '') {
  return String(nome)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

function Escudo({ src, nome, gerarEscudoAutomatico }) {
  const [falhou, setFalhou] = useState(false);
  const automatico =
    typeof gerarEscudoAutomatico === 'function'
      ? gerarEscudoAutomatico(nome)
      : null;
  const imagem = primeiroValor(src, automatico);

  if (imagem && !falhou) {
    return (
      <img
        src={imagem}
        alt={nome}
        onError={() => setFalhou(true)}
        className="h-5 w-5 shrink-0 object-contain"
      />
    );
  }

  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[7px] font-black text-white/70">
      {iniciais(nome)}
    </span>
  );
}

export default function TelaAoVivo({
  jogos = [],
  setMenuAtivo,
  setJogoSelecionado,
  toggleFavorito,
  favoritos = [],
  gerarEscudoAutomatico,
}) {
  const jogosAoVivo = useMemo(() => {
    const reais = (Array.isArray(jogos) ? jogos : [])
      .filter(jogoAoVivo)
      .map(normalizarJogo);

    const origem = reais.length > 0
      ? reais
      : JOGOS_DEMO_AO_VIVO.map(normalizarJogo);

    const unicos = new Map();
    origem.forEach((jogo) => unicos.set(String(jogo.id), jogo));
    return Array.from(unicos.values());
  }, [jogos]);

  const grupos = useMemo(() => {
    return jogosAoVivo.reduce((resultado, jogo) => {
      const liga = jogo.league_name || 'Outros jogos';
      if (!resultado[liga]) resultado[liga] = [];
      resultado[liga].push(jogo);
      return resultado;
    }, {});
  }, [jogosAoVivo]);

  function abrirJogo(jogo) {
    if (typeof setMenuAtivo === 'function') {
      setMenuAtivo('Todos os Jogos');
    }
    if (typeof setJogoSelecionado === 'function') {
      setJogoSelecionado(jogo);
    }
  }

  function favoritar(evento, jogo) {
    evento.stopPropagation();
    if (typeof toggleFavorito === 'function') {
      toggleFavorito(evento, jogo.id);
    }
  }

  return (
    <div className="w-full px-3 pb-28 pt-2 animate-fade-in sm:px-4">
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 via-[#0b0f17] to-[#0b0f17] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10">
            <span className="absolute right-1 top-1 h-2 w-2 animate-ping rounded-full bg-red-400 opacity-70" />
            <Radio className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Jogos ao vivo</h2>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Placar e minuto em tempo real
            </p>
          </div>
        </div>

        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[9px] font-black uppercase text-red-300">
          {jogosAoVivo.length} live
        </span>
      </div>

      {jogosAoVivo.length === 0 ? (
        <div className="rounded-3xl border border-white/[0.07] bg-[#0b0f17] px-5 py-12 text-center">
          <Activity className="mx-auto mb-3 h-9 w-9 text-slate-600" />
          <h3 className="text-sm font-black text-white">Nenhum jogo ao vivo agora</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            As partidas em andamento aparecerÃ£o automaticamente aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grupos).map(([liga, partidas]) => {
            const primeira = partidas[0] || {};
            const logoLiga = primeiroValor(
              primeira.league_logo,
              primeira.league_image,
              primeira.logo_liga,
              primeira.league?.logo,
            );

            return (
              <section
                key={liga}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090c12] shadow-xl shadow-black/20"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c1018] px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                      {logoLiga ? (
                        <img src={logoLiga} alt="" className="h-5 w-5 object-contain" />
                      ) : (
                        <Trophy className="h-4 w-4 text-slate-400" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <h3 className="truncate text-[11px] font-black text-slate-100">
                        {liga}
                      </h3>
                      <p className="mt-0.5 truncate text-[8px] font-bold uppercase tracking-wider text-slate-600">
                        {primeira.league_country || 'Mundo'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[7px] font-black uppercase text-amber-300">
                      {partidas.length} live
                    </span>
                    <span className="text-[8px] font-black text-slate-600">
                      {partidas.length} {partidas.length === 1 ? 'jogo' : 'jogos'}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-white/[0.055]">
                  {partidas.map((jogo) => {
                    const favorito = favoritos.includes(jogo.id);
                    const confianca = numero(jogo.confianca_ia, 0);
                    const odd = numero(jogo.odd_principal, 0);

                    return (
                      <article
                        key={jogo.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => abrirJogo(jogo)}
                        onKeyDown={(evento) => {
                          if (evento.key === 'Enter' || evento.key === ' ') {
                            evento.preventDefault();
                            abrirJogo(jogo);
                          }
                        }}
                        className="group relative cursor-pointer overflow-hidden bg-gradient-to-r from-amber-500/10 via-[#11151b] to-[#0b0f15] transition hover:bg-[#151a22] focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                      >
                        <span className="absolute inset-y-0 left-0 w-1 bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.75)]" />
                        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(245,158,11,0.14),transparent_36%)]" />

                        <div className="relative grid min-h-[74px] grid-cols-[60px_minmax(0,1fr)_30px_34px] items-center gap-2 px-2.5 py-2.5 sm:grid-cols-[68px_minmax(0,1fr)_34px_38px] sm:px-3">
                          <div className="flex min-h-[54px] flex-col items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10 px-1 text-center">
                            <div className="mb-1 flex items-center gap-1">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                              </span>
                              <span className="text-[6px] font-black uppercase tracking-wide text-amber-300">
                                Ao vivo
                              </span>
                            </div>
                            <span className="text-sm font-black leading-none text-amber-100">
                              {minutoDoJogo(jogo)}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2 border-b border-white/[0.05] pb-1.5">
                              <Escudo
                                src={jogo.home_image || jogo.logo_casa}
                                nome={jogo.home_team}
                                gerarEscudoAutomatico={gerarEscudoAutomatico}
                              />
                              <span className="min-w-0 flex-1 truncate text-[10px] font-black text-slate-100 sm:text-xs">
                                {jogo.home_team}
                              </span>
                            </div>

                            <div className="flex min-w-0 items-center gap-2 pt-1.5">
                              <Escudo
                                src={jogo.away_image || jogo.logo_fora}
                                nome={jogo.away_team}
                                gerarEscudoAutomatico={gerarEscudoAutomatico}
                              />
                              <span className="min-w-0 flex-1 truncate text-[10px] font-black text-slate-100 sm:text-xs">
                                {jogo.away_team}
                              </span>
                            </div>

                            {(confianca > 0 || odd > 0) && (
                              <div className="mt-1.5 flex items-center gap-1">
                                {confianca > 0 && (
                                  <span className="rounded-md border border-blue-500/15 bg-blue-500/10 px-1.5 py-0.5 text-[6px] font-black uppercase text-blue-300">
                                    IA {Math.round(confianca)}%
                                  </span>
                                )}
                                {odd > 0 && (
                                  <span className="rounded-md border border-emerald-500/15 bg-emerald-500/10 px-1.5 py-0.5 text-[6px] font-black uppercase text-emerald-300">
                                    Odd {odd.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <span className="flex h-6 min-w-6 items-center justify-center rounded-lg bg-black/55 px-1 text-xs font-black text-white shadow-inner">
                              {jogo.scoreHome}
                            </span>
                            <span className="flex h-6 min-w-6 items-center justify-center rounded-lg bg-black/55 px-1 text-xs font-black text-white shadow-inner">
                              {jogo.scoreAway}
                            </span>
                          </div>

                          <button
                            type="button"
                            aria-label={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            onClick={(evento) => favoritar(evento, jogo)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white/[0.05] hover:text-yellow-300"
                          >
                            <Star
                              className={`h-4 w-4 ${
                                favorito
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* BET_ETAPA_28_AO_VIVO_COMPACTO_FIM */
