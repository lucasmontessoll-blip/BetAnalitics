import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Star,
  Trophy,
} from 'lucide-react';

const NOMES_DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

function inicioDoDia(valor = new Date()) {
  const data = new Date(valor);
  data.setHours(0, 0, 0, 0);
  return data;
}

function adicionarDias(valor, quantidade) {
  const data = new Date(valor);
  data.setDate(data.getDate() + quantidade);
  return data;
}

function paraISO(valor) {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function textoStatus(jogo = {}) {
  return [
    jogo.status,
    jogo.status_short,
    jogo.status_jogo,
    jogo.fixture?.status?.short,
    jogo.fixture?.status?.long,
    jogo.situacao,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .trim();
}

function jogoAoVivo(jogo = {}) {
  const status = textoStatus(jogo);
  const tempo = String(
    jogo.time_elapsed ??
      jogo.tempo_jogo ??
      jogo.fixture?.status?.elapsed ??
      ''
  ).toLowerCase();

  return (
    status === 'live' ||
    status === '1h' ||
    status === '2h' ||
    status === 'ht' ||
    status.includes('ao vivo') ||
    status.includes('in play') ||
    status.includes('intervalo') ||
    /\d{1,3}'/.test(tempo)
  );
}

function jogoEncerrado(jogo = {}) {
  const status = textoStatus(jogo);
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

function dataDoJogo(jogo = {}) {
  const origem =
    jogo.starting_at ??
    jogo.data_hora ??
    jogo.dataHora ??
    jogo.fixture?.date ??
    jogo.date ??
    jogo.data ??
    jogo.inicio ??
    jogo.horario;

  if (!origem) return null;
  const data = new Date(origem);
  return Number.isNaN(data.getTime()) ? null : data;
}

function jogoPreJogo(jogo = {}) {
  if (jogoAoVivo(jogo) || jogoEncerrado(jogo)) return false;

  const status = textoStatus(jogo);
  const data = dataDoJogo(jogo);
  const inicioHoje = inicioDoDia();

  const statusAgendado =
    status === 'ns' ||
    status === 'tbd' ||
    status === 'scheduled' ||
    status.includes('not started') ||
    status.includes('nao iniciado') ||
    status.includes('não iniciado') ||
    status.includes('agendado') ||
    status.includes('pre-game') ||
    status.includes('pré-jogo');

  if (data && data.getTime() >= inicioHoje.getTime()) return true;
  return statusAgendado;
}

function horarioDoJogo(jogo = {}) {
  const data = dataDoJogo(jogo);
  if (data) {
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const horario = String(jogo.horario ?? jogo.time ?? '').match(/\b\d{1,2}:\d{2}\b/);
  return horario ? horario[0] : '--:--';
}

function nomeCasa(jogo = {}) {
  return (
    jogo.home_team ??
    jogo.time_casa ??
    jogo.homeTeam ??
    jogo.mandante ??
    jogo.teams?.home?.name ??
    'Mandante'
  );
}

function nomeFora(jogo = {}) {
  return (
    jogo.away_team ??
    jogo.time_fora ??
    jogo.awayTeam ??
    jogo.visitante ??
    jogo.teams?.away?.name ??
    'Visitante'
  );
}

function nomeLiga(jogo = {}) {
  return (
    jogo.league_name ??
    jogo.liga ??
    jogo.campeonato ??
    jogo.league?.name ??
    jogo.league?.league?.name ??
    jogo.competition?.name ??
    'Outros jogos'
  );
}

function paisLiga(jogo = {}) {
  return (
    jogo.league_country ||
    jogo.country_name ||
    jogo.country?.name ||
    (typeof jogo.country === 'string' ? jogo.country : '') ||
    jogo.area?.name ||
    'Internacional'
  );
}

function idJogo(jogo = {}, index = 0) {
  return String(
    jogo.id ??
      jogo.id_jogo ??
      jogo.fixture?.id ??
      `${nomeCasa(jogo)}-${nomeFora(jogo)}-${index}`
  );
}

function criarData(dias, hora, minuto = 0) {
  const data = adicionarDias(inicioDoDia(), dias);
  data.setHours(hora, minuto, 0, 0);
  return data.toISOString();
}

function jogosDemonstracao() {
  const baseEstatistica = {
    posse_casa: 56,
    posse_fora: 44,
    chutes_casa: 14,
    chutes_fora: 10,
    cantos_casa: 6,
    cantos_fora: 4,
    ataques_casa: 78,
    ataques_fora: 62,
  };

  return [
    {
      id: 'pre-chelsea-tottenham',
      demo: true,
      league_name: 'Amistoso internacional de clubes',
      league_country: 'Internacional',
      status: 'Not Started',
      starting_at: criarData(1, 6, 45),
      home_team: 'Chelsea',
      away_team: 'Tottenham',
      scoreHome: '-',
      scoreAway: '-',
      confianca_ia: 84,
      odd_principal: 1.95,
      odds: { home: 1.95, draw: 3.45, away: 3.8 },
      mercado_principal: 'Mais de 1.5 gols',
      probabilidades: { casa: 47, empate: 28, fora: 25 },
      estatisticas: baseEstatistica,
      classificacao: { casa_posicao: 4, fora_posicao: 7, casa_pontos: 68, fora_pontos: 59 },
      h2h: { vitorias_casa: 4, empates: 2, vitorias_fora: 2, resumo: 'Chelsea leva vantagem nos últimos confrontos.' },
      comentario: 'Pré-jogo com tendência de ritmo alto e chances para os dois lados.',
    },
    {
      id: 'pre-new-york-toronto',
      demo: true,
      league_name: 'Major League Soccer',
      league_country: 'Estados Unidos',
      status: 'NS',
      starting_at: criarData(1, 20, 30),
      home_team: 'New York City',
      away_team: 'Toronto',
      scoreHome: '-',
      scoreAway: '-',
      confianca_ia: 81,
      odd_principal: 1.78,
      odds: { home: 1.78, draw: 3.6, away: 4.2 },
      mercado_principal: 'Vitória New York City',
      probabilidades: { casa: 55, empate: 25, fora: 20 },
      estatisticas: { ...baseEstatistica, posse_casa: 59, posse_fora: 41 },
      classificacao: { casa_posicao: 5, fora_posicao: 11, casa_pontos: 36, fora_pontos: 25 },
    },
    {
      id: 'pre-leverkusen-essen',
      demo: true,
      league_name: 'Amistoso internacional de clubes',
      league_country: 'Internacional',
      status: 'Scheduled',
      starting_at: criarData(2, 6, 0),
      home_team: 'Leverkusen',
      away_team: 'Rot-Weiss Essen',
      scoreHome: '-',
      scoreAway: '-',
      confianca_ia: 89,
      odd_principal: 1.42,
      odds: { home: 1.42, draw: 4.4, away: 6.8 },
      mercado_principal: 'Vitória Leverkusen',
      probabilidades: { casa: 67, empate: 20, fora: 13 },
      estatisticas: { ...baseEstatistica, chutes_casa: 17, chutes_fora: 7 },
    },
    {
      id: 'pre-tokyo-dortmund',
      demo: true,
      league_name: 'Amistoso internacional de clubes',
      league_country: 'Internacional',
      status: 'Not Started',
      starting_at: criarData(2, 7, 0),
      home_team: 'FC Tokyo',
      away_team: 'Dortmund',
      scoreHome: '-',
      scoreAway: '-',
      confianca_ia: 86,
      odd_principal: 1.66,
      odds: { home: 4.8, draw: 3.9, away: 1.66 },
      mercado_principal: 'Dortmund ou empate',
      probabilidades: { casa: 19, empate: 25, fora: 56 },
      estatisticas: { ...baseEstatistica, posse_casa: 42, posse_fora: 58 },
    },
    {
      id: 'pre-libertad-orense',
      demo: true,
      league_name: 'LigaPro Serie A',
      league_country: 'Equador',
      status: 'NS',
      starting_at: criarData(2, 21, 0),
      home_team: 'Libertad',
      away_team: 'Orense SC',
      scoreHome: '-',
      scoreAway: '-',
      confianca_ia: 78,
      odd_principal: 2.05,
      odds: { home: 2.05, draw: 3.05, away: 3.55 },
      mercado_principal: 'Menos de 3.5 gols',
      probabilidades: { casa: 43, empate: 31, fora: 26 },
      estatisticas: { ...baseEstatistica, chutes_casa: 11, chutes_fora: 9 },
    },
    {
      id: 'pre-fortaleza-pereira',
      demo: true,
      league_name: 'Primera A',
      league_country: 'Colômbia',
      status: 'TBD',
      starting_at: criarData(2, 22, 0),
      home_team: 'Fortaleza',
      away_team: 'Dep. Pereira',
      scoreHome: '-',
      scoreAway: '-',
      confianca_ia: 80,
      odd_principal: 2.12,
      odds: { home: 2.12, draw: 3.1, away: 3.35 },
      mercado_principal: 'Dupla chance Fortaleza',
      probabilidades: { casa: 42, empate: 32, fora: 26 },
      estatisticas: { ...baseEstatistica, cantos_casa: 5, cantos_fora: 5 },
    },
  ];
}

function iniciais(nome = '') {
  return String(nome)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

function Escudo({ src, nome }) {
  const [falhou, setFalhou] = useState(false);

  if (src && !falhou) {
    return (
      <img
        src={src}
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

export default function TelaPreJogo({
  jogos = [],
  setJogoSelecionado,
  toggleFavorito,
  favoritos = [],
  escudoTime,
  gerarEscudoAutomatico,
}) {
  const hoje = useMemo(() => inicioDoDia(), []);
  const [inicioSemana, setInicioSemana] = useState(hoje);
  const [dataSelecionada, setDataSelecionada] = useState(paraISO(hoje));
  const ajustouDataInicial = useRef(false);

  const jogosFuturos = useMemo(() => {
    const reais = (Array.isArray(jogos) ? jogos : [])
      .filter(jogoPreJogo)
      .sort((a, b) => {
        const dataA = dataDoJogo(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const dataB = dataDoJogo(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return dataA - dataB;
      });

    return reais.length > 0 ? reais : jogosDemonstracao();
  }, [jogos]);

  const datasDisponiveis = useMemo(() => {
    return Array.from(
      new Set(jogosFuturos.map((jogo) => paraISO(dataDoJogo(jogo))).filter(Boolean))
    ).sort();
  }, [jogosFuturos]);

  useEffect(() => {
    if (ajustouDataInicial.current || datasDisponiveis.length === 0) return;

    const hojeISO = paraISO(hoje);
    const primeiraData = datasDisponiveis.includes(hojeISO)
      ? hojeISO
      : datasDisponiveis[0];

    setDataSelecionada(primeiraData);
    const data = inicioDoDia(`${primeiraData}T12:00:00`);
    setInicioSemana(data);
    ajustouDataInicial.current = true;
  }, [datasDisponiveis, hoje]);

  const diasSemana = useMemo(() => {
    return Array.from({ length: 7 }, (_, indice) => {
      const data = adicionarDias(inicioSemana, indice);
      return {
        data,
        iso: paraISO(data),
        semana: NOMES_DIAS[data.getDay()],
        dia: String(data.getDate()).padStart(2, '0'),
        mes: String(data.getMonth() + 1).padStart(2, '0'),
      };
    });
  }, [inicioSemana]);

  const jogosDoDia = useMemo(() => {
    return jogosFuturos.filter((jogo) => paraISO(dataDoJogo(jogo)) === dataSelecionada);
  }, [jogosFuturos, dataSelecionada]);

  const grupos = useMemo(() => {
    return jogosDoDia.reduce((resultado, jogo) => {
      const liga = nomeLiga(jogo);
      if (!resultado[liga]) resultado[liga] = [];
      resultado[liga].push(jogo);
      return resultado;
    }, {});
  }, [jogosDoDia]);

  function resolverEscudo(jogo, lado) {
    const casa = lado === 'casa';
    const nome = casa ? nomeCasa(jogo) : nomeFora(jogo);
    const direto = casa
      ? jogo.home_image ?? jogo.logo_casa ?? jogo.homeLogo ?? jogo.teams?.home?.logo
      : jogo.away_image ?? jogo.logo_fora ?? jogo.awayLogo ?? jogo.teams?.away?.logo;

    if (direto) return direto;

    try {
      const encontrado = typeof escudoTime === 'function' ? escudoTime(nome) : null;
      if (encontrado) return encontrado;
    } catch {}

    try {
      return typeof gerarEscudoAutomatico === 'function'
        ? gerarEscudoAutomatico(nome)
        : null;
    } catch {
      return null;
    }
  }

  function abrirJogo(jogo) {
    if (typeof setJogoSelecionado !== 'function') return;

    setJogoSelecionado({
      ...jogo,
      _origemTela: 'prejogo',
      status: jogo.status ?? 'Not Started',
      time_elapsed: '',
      placar_casa: jogo.placar_casa ?? jogo.scoreHome ?? '-',
      placar_fora: jogo.placar_fora ?? jogo.scoreAway ?? '-',
      scoreHome: jogo.scoreHome ?? jogo.placar_casa ?? '-',
      scoreAway: jogo.scoreAway ?? jogo.placar_fora ?? '-',
    });

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  }

  function favoritar(evento, jogo) {
    evento.stopPropagation();
    if (typeof toggleFavorito !== 'function') return;

    try {
      toggleFavorito(evento, jogo.id ?? jogo.fixture?.id);
    } catch {
      try {
        toggleFavorito(jogo.id ?? jogo.fixture?.id);
      } catch {}
    }
  }

  return (
    <div className="w-full px-4 pb-28 animate-fade-in">
      <section className="mb-5 rounded-[30px] border border-blue-500/25 bg-gradient-to-br from-blue-600/20 via-[#0f172a] to-cyan-500/10 p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/15">
            <Clock3 className="h-6 w-6 text-blue-300" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
              Agenda de partidas
            </p>
            <h2 className="text-2xl font-black text-white">Pré-jogo</h2>
          </div>
        </div>
        <p className="mt-3 text-xs font-bold leading-relaxed text-slate-400">
          Calendário dos próximos jogos com horários, odds e análise antes da bola rolar.
        </p>
      </section>

      <section className="mb-5 rounded-[28px] border border-white/10 bg-[#0f172a] p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
              <CalendarDays className="h-4 w-4" /> Calendário
            </div>
            <h3 className="mt-1 text-lg font-black text-white">Semana de jogos</h3>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setInicioSemana((data) => adicionarDias(data, -7))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#050816] active:scale-95"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-4 w-4 text-slate-300" />
            </button>
            <button
              type="button"
              onClick={() => setInicioSemana((data) => adicionarDias(data, 7))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#050816] active:scale-95"
              aria-label="Próxima semana"
            >
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {diasSemana.map((dia) => {
            const ativo = dia.iso === dataSelecionada;
            const quantidade = jogosFuturos.filter(
              (jogo) => paraISO(dataDoJogo(jogo)) === dia.iso
            ).length;

            return (
              <button
                key={dia.iso}
                type="button"
                onClick={() => setDataSelecionada(dia.iso)}
                className={`flex min-h-[74px] min-w-0 flex-col items-center justify-center rounded-2xl border px-1 py-2 transition active:scale-95 ${
                  ativo
                    ? 'border-blue-400 bg-blue-600 text-white shadow-[0_0_22px_rgba(37,99,235,0.35)]'
                    : 'border-white/10 bg-[#050816] text-slate-400'
                }`}
              >
                <span className="text-[7px] font-black uppercase sm:text-[9px]">{dia.semana}</span>
                <span className="mt-1 text-base font-black sm:text-lg">{dia.dia}</span>
                <span className="text-[7px] font-black opacity-70">
                  {dia.iso === paraISO(hoje) ? 'Hoje' : quantidade > 0 ? `${quantidade}J` : dia.mes}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#050816] p-3">
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500">Data selecionada</p>
            <p className="mt-0.5 text-sm font-black text-white">
              {dataSelecionada.split('-').reverse().join('/')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-emerald-400">Jogos do dia</p>
            <p className="mt-0.5 text-xs font-bold text-slate-400">
              {jogosDoDia.length} {jogosDoDia.length === 1 ? 'partida' : 'partidas'}
            </p>
          </div>
        </div>
      </section>

      {Object.keys(grupos).length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#0f172a] px-5 py-12 text-center">
          <CalendarDays className="mx-auto mb-3 h-9 w-9 text-slate-600" />
          <h3 className="text-base font-black text-white">Nenhum jogo nesta data</h3>
          <p className="mt-1 text-xs font-bold text-slate-500">
            Selecione outro dia no calendário para ver as próximas partidas.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grupos).map(([liga, partidas]) => {
            const primeiro = partidas[0] ?? {};
            const logoLiga =
              primeiro.league_logo ??
              primeiro.league_image ??
              primeiro.logo_liga ??
              primeiro.league?.logo;

            return (
              <section key={liga} className="overflow-hidden rounded-2xl border border-white/[0.07] bg-black/40">
                <header className="flex items-center justify-between border-b border-white/[0.06] bg-black px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                      {logoLiga ? (
                        <img src={logoLiga} alt="" className="h-5 w-5 object-contain" />
                      ) : (
                        <Trophy className="h-4 w-4 text-blue-400" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-[11px] font-black text-white sm:text-xs">{liga}</h3>
                      <p className="truncate text-[8px] font-bold text-slate-500">🌐 {paisLiga(primeiro)}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase text-slate-600">
                    {partidas.length} {partidas.length === 1 ? 'jogo' : 'jogos'}
                  </span>
                </header>

                <div className="divide-y divide-white/[0.055]">
                  {partidas.map((jogo, indice) => {
                    const casa = nomeCasa(jogo);
                    const fora = nomeFora(jogo);
                    const jogoId = idJogo(jogo, indice);
                    const favorito = favoritos.includes(jogo.id ?? jogo.fixture?.id);
                    const confianca = Number(jogo.confianca_ia ?? jogo.confiancaIA ?? 0);
                    const odd = Number(jogo.odd_principal ?? jogo.odd ?? jogo.odds?.home ?? 0);

                    return (
                      <button
                        key={jogoId}
                        type="button"
                        onClick={() => abrirJogo(jogo)}
                        className="grid w-full grid-cols-[58px_minmax(0,1fr)_34px] items-center gap-2 bg-[#111111] px-2.5 py-3 text-left transition hover:bg-[#171717] active:bg-[#1b1b1b] sm:grid-cols-[70px_minmax(0,1fr)_38px] sm:px-3"
                      >
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-300">
                            {dataDoJogo(jogo)?.toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                            }) ?? '--/--'}
                          </p>
                          <p className="mt-0.5 text-[11px] font-black text-white">{horarioDoJogo(jogo)}</p>
                        </div>

                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2 pb-1.5">
                            <Escudo src={resolverEscudo(jogo, 'casa')} nome={casa} />
                            <span className="min-w-0 flex-1 truncate text-[10px] font-black text-slate-100 sm:text-xs">{casa}</span>
                          </div>
                          <div className="flex min-w-0 items-center gap-2 pt-1.5">
                            <Escudo src={resolverEscudo(jogo, 'fora')} nome={fora} />
                            <span className="min-w-0 flex-1 truncate text-[10px] font-black text-slate-100 sm:text-xs">{fora}</span>
                          </div>

                          {(confianca > 0 || odd > 0) && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {confianca > 0 && (
                                <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[7px] font-black uppercase text-blue-300">
                                  IA {Math.round(confianca)}%
                                </span>
                              )}
                              {odd > 0 && (
                                <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[7px] font-black uppercase text-emerald-300">
                                  Odd {odd.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(evento) => favoritar(evento, jogo)}
                          onKeyDown={(evento) => {
                            if (evento.key === 'Enter' || evento.key === ' ') favoritar(evento, jogo);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white/[0.05] hover:text-yellow-300"
                          aria-label="Favoritar jogo"
                        >
                          <Star className={`h-4 w-4 ${favorito ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </span>
                      </button>
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