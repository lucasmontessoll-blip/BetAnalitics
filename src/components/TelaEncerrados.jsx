import React, { useMemo, useState } from 'react';
import { CheckCircle2, Star, Trophy } from 'lucide-react';

/* BET_ETAPA_29_ENCERRADOS_COMPACTO_INICIO */

const JOGOS_DEMO_ENCERRADOS = [
  {
    id: 'demo-ft-flamengo-palmeiras',
    demo: true,
    league_id: 71,
    league_name: 'BrasileirÃ£o SÃ©rie A',
    league_country: 'Brasil',
    status: 'Finished',
    time_elapsed: 'FT',
    home_team: 'Flamengo',
    away_team: 'Palmeiras',
    scoreHome: 2,
    scoreAway: 1,
    confianca_ia: 92,
    odd_principal: 1.82,
    mercado_principal: 'VitÃ³ria Flamengo',
    comentario: 'Flamengo foi mais eficiente, criou as chances mais perigosas e confirmou a vitÃ³ria por 2 a 1.',
    estatisticas: {
      posseCasa: 57,
      posseFora: 43,
      chutesCasa: 16,
      chutesFora: 9,
      chutesNoAlvoCasa: 7,
      chutesNoAlvoFora: 3,
      escanteiosCasa: 6,
      escanteiosFora: 4,
      ataquesPerigososCasa: 48,
      ataquesPerigososFora: 31,
      passesCasa: 468,
      passesFora: 351,
      faltasCasa: 11,
      faltasFora: 14,
      cartoesCasa: 2,
      cartoesFora: 3,
    },
    escalacoes: {
      casa: ['Rossi', 'Varela', 'LÃ©o Pereira', 'LÃ©o Ortiz', 'Ayrton Lucas', 'Pulgar', 'De la Cruz', 'Arrascaeta'],
      fora: ['Weverton', 'Mayke', 'GÃ³mez', 'Murilo', 'Piquerez', 'AnÃ­bal Moreno', 'Raphael Veiga', 'EstÃªvÃ£o'],
    },
    classificacao: {
      casa_posicao: 2,
      fora_posicao: 4,
      casa_pontos: 38,
      fora_pontos: 34,
    },
    h2h: {
      resumo: 'Ãšltimos 5 confrontos: Flamengo 2 vitÃ³rias, 2 empates e Palmeiras 1 vitÃ³ria.',
      vitorias_casa: 2,
      empates: 2,
      vitorias_fora: 1,
    },
  },
  {
    id: 'demo-ft-real-city',
    demo: true,
    league_id: 2,
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
    comentario: 'Partida equilibrada e intensa. O Real Madrid decidiu nos momentos de maior eficiÃªncia ofensiva.',
    estatisticas: {
      posseCasa: 46,
      posseFora: 54,
      chutesCasa: 14,
      chutesFora: 17,
      chutesNoAlvoCasa: 8,
      chutesNoAlvoFora: 6,
      escanteiosCasa: 5,
      escanteiosFora: 7,
      ataquesPerigososCasa: 44,
      ataquesPerigososFora: 51,
      passesCasa: 432,
      passesFora: 512,
    },
    classificacao: {
      casa_posicao: 1,
      fora_posicao: 2,
      casa_pontos: 18,
      fora_pontos: 16,
    },
    h2h: {
      resumo: 'Confrontos recentes muito equilibrados, com vantagem mÃ­nima do Real Madrid.',
      vitorias_casa: 2,
      empates: 1,
      vitorias_fora: 2,
    },
  },
  {
    id: 'demo-ft-liverpool-arsenal',
    demo: true,
    league_id: 39,
    league_name: 'Premier League',
    league_country: 'Inglaterra',
    status: 'Finished',
    time_elapsed: 'FT',
    home_team: 'Liverpool',
    away_team: 'Arsenal',
    scoreHome: 1,
    scoreAway: 1,
    confianca_ia: 84,
    odd_principal: 1.95,
    mercado_principal: 'Mais de 1.5 gols',
    comentario: 'Empate com domÃ­nio alternado. Liverpool pressionou mais no fim, mas o Arsenal sustentou o resultado.',
    estatisticas: {
      posseCasa: 52,
      posseFora: 48,
      chutesCasa: 13,
      chutesFora: 11,
      chutesNoAlvoCasa: 5,
      chutesNoAlvoFora: 4,
      escanteiosCasa: 7,
      escanteiosFora: 5,
      ataquesPerigososCasa: 42,
      ataquesPerigososFora: 38,
      passesCasa: 481,
      passesFora: 449,
    },
    classificacao: {
      casa_posicao: 3,
      fora_posicao: 1,
      casa_pontos: 36,
      fora_pontos: 41,
    },
    h2h: {
      resumo: 'Nos Ãºltimos 5 jogos, cada time venceu uma vez e ocorreram 3 empates.',
      vitorias_casa: 1,
      empates: 3,
      vitorias_fora: 1,
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

function numeroOuNulo(valor) {
  if (valor === undefined || valor === null || valor === '' || valor === '-') return null;
  const normalizado = typeof valor === 'string'
    ? valor.replace('%', '').replace(',', '.').replace(/[^0-9.-]/g, '')
    : valor;
  const convertido = Number(normalizado);
  return Number.isFinite(convertido) ? convertido : null;
}

function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
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
    status.includes('match finished') ||
    status.includes('finalizado') ||
    status.includes('encerrado') ||
    status.includes('fim de jogo')
  );
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
    mandante: texto(jogo.mandante, mandante),
    away_team: visitante,
    time_fora: texto(jogo.time_fora, visitante),
    awayTeam: texto(jogo.awayTeam, visitante),
    visitante: texto(jogo.visitante, visitante),
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
    score_home: numero(
      primeiroValor(
        jogo.score_home,
        jogo.scoreHome,
        jogo.placar_casa,
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
    score_away: numero(
      primeiroValor(
        jogo.score_away,
        jogo.scoreAway,
        jogo.placar_fora,
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
    liga: texto(
      jogo.liga,
      jogo.league_name,
      jogo.campeonato,
      jogo.league?.name,
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
    status: texto(jogo.status, jogo.fixture?.status?.short, 'Finished'),
    time_elapsed: texto(
      jogo.time_elapsed,
      jogo.tempo_jogo,
      jogo.tempo,
      jogo.minuto,
      'FT',
    ),
    tempo_jogo: texto(
      jogo.tempo_jogo,
      jogo.time_elapsed,
      jogo.tempo,
      jogo.minuto,
      'FT',
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

function compartilhar(casa, fora, fallback = 50) {
  const valorCasa = numeroOuNulo(casa);
  const valorFora = numeroOuNulo(fora);

  if (valorCasa === null && valorFora === null) return { casa: fallback, fora: 100 - fallback };
  if (valorCasa !== null && valorFora === null) {
    const pctCasa = limitar(valorCasa, 0, 100);
    return { casa: pctCasa, fora: 100 - pctCasa };
  }
  if (valorCasa === null && valorFora !== null) {
    const pctFora = limitar(valorFora, 0, 100);
    return { casa: 100 - pctFora, fora: pctFora };
  }

  const total = Math.max(valorCasa + valorFora, 0.0001);
  return {
    casa: limitar((valorCasa / total) * 100, 0, 100),
    fora: limitar((valorFora / total) * 100, 0, 100),
  };
}

function desempenhoDoJogo(jogo = {}) {
  const stats = primeiroValor(jogo.estatisticas, jogo.stats, jogo.statistics, {}) || {};
  const placarCasa = numero(jogo.scoreHome ?? jogo.placar_casa, 0);
  const placarFora = numero(jogo.scoreAway ?? jogo.placar_fora, 0);

  const posse = compartilhar(
    primeiroValor(stats.posseCasa, stats.posse_casa, stats.home?.possession, stats.casa?.posse),
    primeiroValor(stats.posseFora, stats.posse_fora, stats.away?.possession, stats.fora?.posse),
    50,
  );

  const chutes = compartilhar(
    primeiroValor(stats.chutesCasa, stats.chutes_casa, stats.home?.shots, stats.casa?.chutes),
    primeiroValor(stats.chutesFora, stats.chutes_fora, stats.away?.shots, stats.fora?.chutes),
    50,
  );

  const alvo = compartilhar(
    primeiroValor(stats.chutesNoAlvoCasa, stats.chutes_no_alvo_casa, stats.home?.shotsOnGoal),
    primeiroValor(stats.chutesNoAlvoFora, stats.chutes_no_alvo_fora, stats.away?.shotsOnGoal),
    chutes.casa,
  );

  const resultadoCasa = placarCasa > placarFora ? 96 : placarCasa === placarFora ? 72 : 48;
  const resultadoFora = placarFora > placarCasa ? 96 : placarCasa === placarFora ? 72 : 48;

  return {
    casa: limitar(Math.round(resultadoCasa * 0.46 + posse.casa * 0.18 + chutes.casa * 0.18 + alvo.casa * 0.18), 35, 98),
    fora: limitar(Math.round(resultadoFora * 0.46 + posse.fora * 0.18 + chutes.fora * 0.18 + alvo.fora * 0.18), 35, 98),
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

export default function TelaEncerrados({
  jogos = [],
  setJogoSelecionado,
  toggleFavorito,
  favoritos = [],
  gerarEscudoAutomatico,
}) {
  const jogosEncerrados = useMemo(() => {
    const reais = (Array.isArray(jogos) ? jogos : [])
      .filter(jogoEncerrado)
      .map(normalizarJogo);

    const origem = reais.length > 0
      ? reais
      : JOGOS_DEMO_ENCERRADOS.map(normalizarJogo);

    const unicos = new Map();
    origem.forEach((jogo) => unicos.set(String(jogo.id), jogo));
    return Array.from(unicos.values());
  }, [jogos]);

  const grupos = useMemo(() => {
    return jogosEncerrados.reduce((resultado, jogo) => {
      const liga = jogo.league_name || 'Outros jogos';
      if (!resultado[liga]) resultado[liga] = [];
      resultado[liga].push(jogo);
      return resultado;
    }, {});
  }, [jogosEncerrados]);

  function abrirJogo(jogo) {
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
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-[#0b0f17] to-[#0b0f17] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Jogos encerrados</h2>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Placar final e desempenho
            </p>
          </div>
        </div>

        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase text-emerald-300">
          {jogosEncerrados.length} FT
        </span>
      </div>

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

                <span className="text-[8px] font-black text-slate-600">
                  {partidas.length} {partidas.length === 1 ? 'jogo' : 'jogos'}
                </span>
              </div>

              <div className="divide-y divide-white/[0.055]">
                {partidas.map((jogo) => {
                  const favorito = favoritos.includes(jogo.id);
                  const desempenho = desempenhoDoJogo(jogo);

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
                      className="group relative cursor-pointer overflow-hidden bg-[#0d1118] transition hover:bg-[#131923] focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                    >
                      <span className="absolute inset-y-0 left-0 w-1 bg-emerald-400/80" />

                      <div className="relative grid min-h-[78px] grid-cols-[58px_minmax(0,1fr)_30px_34px] items-center gap-2 px-2.5 py-2.5 sm:grid-cols-[66px_minmax(0,1fr)_34px_38px] sm:px-3">
                        <div className="flex min-h-[56px] flex-col items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-500/[0.06] px-1 text-center">
                          <span className="text-sm font-black leading-none text-emerald-200">FT</span>
                          <span className="mt-1 text-[6px] font-black uppercase tracking-wide text-slate-500">
                            Encerrado
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
                            <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[6px] font-black text-blue-300">
                              {desempenho.casa}%
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
                            <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[6px] font-black text-amber-300">
                              {desempenho.fora}%
                            </span>
                          </div>
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
    </div>
  );
}

/* BET_ETAPA_29_ENCERRADOS_COMPACTO_FIM */
