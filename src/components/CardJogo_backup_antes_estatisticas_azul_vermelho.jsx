import React from 'react';
import EstatisticasJogoPro from './EstatisticasJogoPro.jsx';

function pick(...values) {
  return values.find((v) => v !== undefined && v !== null && v !== '');
}

function asText(value, fallback = '') {
  const v = pick(value, fallback);
  if (typeof v === 'object') return fallback;
  return String(v ?? fallback);
}

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getHome(jogo = {}) {
  return {
    name: asText(
      jogo.time_casa,
      jogo.homeTeam,
      jogo.mandante,
      jogo.casa,
      jogo.teams?.home?.name,
      jogo.teams?.home?.team?.name,
      jogo.equipes?.casa?.nome,
      'Casa'
    ),
    logo: pick(
      jogo.logo_casa,
      jogo.homeLogo,
      jogo.logoHome,
      jogo.teams?.home?.logo,
      jogo.teams?.home?.team?.logo,
      jogo.equipes?.casa?.logo
    ),
    score: pick(
      jogo.placar_casa,
      jogo.gols_casa,
      jogo.score_home,
      jogo.goals?.home,
      jogo.score?.fulltime?.home,
      jogo.score?.halftime?.home,
      jogo.placar?.casa
    )
  };
}

function getAway(jogo = {}) {
  return {
    name: asText(
      jogo.time_fora,
      jogo.awayTeam,
      jogo.visitante,
      jogo.fora,
      jogo.teams?.away?.name,
      jogo.teams?.away?.team?.name,
      jogo.equipes?.fora?.nome,
      'Fora'
    ),
    logo: pick(
      jogo.logo_fora,
      jogo.awayLogo,
      jogo.logoAway,
      jogo.teams?.away?.logo,
      jogo.teams?.away?.team?.logo,
      jogo.equipes?.fora?.logo
    ),
    score: pick(
      jogo.placar_fora,
      jogo.gols_fora,
      jogo.score_away,
      jogo.goals?.away,
      jogo.score?.fulltime?.away,
      jogo.score?.halftime?.away,
      jogo.placar?.fora
    )
  };
}

function getLeague(jogo = {}) {
  return asText(
    jogo.liga,
    jogo.league?.name,
    jogo.league?.league?.name,
    jogo.competition?.name,
    jogo.campeonato,
    typeof jogo.league === 'string' ? jogo.league : '',
    'Liga'
  );
}

function getRound(jogo = {}) {
  return asText(jogo.rodada, jogo.round, jogo.league?.round, jogo.fase, '');
}

function getStatus(jogo = {}) {
  return asText(
    jogo.status,
    jogo.status_jogo,
    jogo.fixture?.status?.short,
    jogo.fixture?.status?.long,
    jogo.situacao,
    ''
  );
}

function getMinute(jogo = {}) {
  return asText(
    jogo.tempo_jogo,
    jogo.tempo,
    jogo.minuto,
    jogo.fixture?.status?.elapsed ? `${jogo.fixture.status.elapsed}'` : '',
    ''
  );
}

function getDateTime(jogo = {}) {
  const raw = pick(jogo.horario, jogo.data_hora, jogo.dataHora, jogo.fixture?.date, jogo.date, jogo.inicio);

  if (!raw) return '';

  const d = new Date(raw);

  if (!Number.isNaN(d.getTime())) {
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} - ${hora}:${min}`;
  }

  return String(raw);
}

function isFinished(jogo = {}) {
  const s = getStatus(jogo).toLowerCase();
  return ['ft', 'aet', 'pen', 'encerrado', 'fim de jogo', 'finished', 'finalizado'].some((x) => s.includes(x));
}

function isLive(jogo = {}) {
  const s = getStatus(jogo).toLowerCase();
  return Boolean(getMinute(jogo)) || ['live', '1h', '2h', 'ht', 'ao vivo', 'intervalo'].some((x) => s.includes(x));
}

function initials(name = '') {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function LogoTeam({ src, name }) {
  const [error, setError] = React.useState(false);

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setError(true)}
        className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-lg"
      />
    );
  }

  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs font-black text-white/80">
      {initials(name)}
    </div>
  );
}

function getGoals(jogo = {}) {
  const list = pick(jogo.gols, jogo.scorers, jogo.eventos_gols, jogo.events, []);

  if (!Array.isArray(list)) return [];

  return list
    .filter((e) => {
      const type = String(e?.type || e?.tipo || e?.detail || '').toLowerCase();
      return type.includes('goal') || type.includes('gol') || e?.jogador || e?.player;
    })
    .slice(0, 6)
    .map((e) => ({
      player: asText(e.jogador, e.player?.name, e.player, e.nome, 'Gol'),
      minute: asText(e.minuto, e.time?.elapsed ? `${e.time.elapsed}'` : '', e.elapsed ? `${e.elapsed}'` : '')
    }));
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`shrink-0 px-3 py-2 rounded-full text-[11px] font-black border transition-all ${
        active
          ? 'bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-500/20'
          : 'bg-white/[0.04] text-white/75 border-white/10 hover:bg-white/[0.08]'
      }`}
    >
      {children}
    </button>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/25 border border-white/10 px-3 py-2">
      <span className="text-[11px] text-white/45 font-bold">{label}</span>
      <span className="text-xs text-white font-black text-right">{value}</span>
    </div>
  );
}

function DetailsPanel({ jogo, home, away }) {
  const odd = pick(jogo.odd_principal, jogo.odd, jogo.odds?.principal, jogo.odds?.home);
  const confidence = asNumber(pick(jogo.confianca_ia, jogo.confiancaIA, jogo.ia?.confianca), 0);

  return (
    <div className="grid grid-cols-2 gap-2">
      <InfoLine label="Status" value={getStatus(jogo) || (isFinished(jogo) ? 'Fim de jogo' : 'Pré-jogo')} />
      <InfoLine label="Tempo" value={getMinute(jogo) || getDateTime(jogo) || '-'} />
      <InfoLine label="Mandante" value={home.name} />
      <InfoLine label="Visitante" value={away.name} />
      <InfoLine label="Odd principal" value={odd ? Number(odd).toFixed(2) : '-'} />
      <InfoLine label="Confiança IA" value={`${confidence}%`} />
    </div>
  );
}

function LineupsPanel({ jogo, home, away }) {
  const homeList = pick(jogo.escalacoes?.casa, jogo.lineups?.home, jogo.lineup_home, []);
  const awayList = pick(jogo.escalacoes?.fora, jogo.lineups?.away, jogo.lineup_away, []);

  const renderList = (list) => {
    if (!Array.isArray(list) || list.length === 0) {
      return <p className="text-xs text-white/45">Escalação será carregada pela API.</p>;
    }

    return (
      <div className="space-y-1">
        {list.slice(0, 8).map((p, i) => (
          <p key={i} className="text-xs text-white/70">
            {asText(p.numero, p.number, '')} {asText(p.nome, p.player?.name, p.name, p)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-black/25 border border-white/10 p-3">
        <p className="text-xs font-black text-white mb-2">{home.name}</p>
        {renderList(homeList)}
      </div>

      <div className="rounded-2xl bg-black/25 border border-white/10 p-3">
        <p className="text-xs font-black text-white mb-2">{away.name}</p>
        {renderList(awayList)}
      </div>
    </div>
  );
}

function PredictionPanel({ jogo }) {
  const confidence = asNumber(pick(jogo.confianca_ia, jogo.confiancaIA, jogo.ia?.confianca), 87);
  const market = asText(jogo.mercado_principal, jogo.mercadoIA, jogo.ia?.mercado, 'Mercado principal será definido pela IA');
  const ev = pick(jogo.ev, jogo.valor_esperado, jogo.ia?.ev);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-yellow-400/10 to-blue-500/10 border border-yellow-400/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-yellow-300 font-black uppercase tracking-[0.16em]">Previsão IA</p>
          <p className="text-sm text-white font-black mt-1">{market}</p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-black text-yellow-300">{confidence}%</p>
          <p className="text-[10px] text-white/45 font-bold">confiança</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-white/65 leading-relaxed">
        Quando a API estiver conectada, este bloco exibirá forma, odds, pressão, estatísticas, histórico e leitura do mercado.
      </p>

      {ev !== undefined && ev !== null && ev !== '' && (
        <p className="mt-2 text-xs text-emerald-300 font-black">EV estimado: {Number(ev).toFixed(1)}%</p>
      )}
    </div>
  );
}

function StatsPanel({ jogo, home, away }) {
  const stats = pick(jogo.estatisticas, jogo.stats, jogo.statistics, {});
  const posseHome = pick(stats.posse_casa, stats.home?.possession, stats.casa?.posse, jogo.posse_casa, '-');
  const posseAway = pick(stats.posse_fora, stats.away?.possession, stats.fora?.posse, jogo.posse_fora, '-');
  const shotsHome = pick(stats.chutes_casa, stats.home?.shots, stats.casa?.chutes, jogo.chutes_casa, '-');
  const shotsAway = pick(stats.chutes_fora, stats.away?.shots, stats.fora?.chutes, jogo.chutes_fora, '-');
  const cornersHome = pick(stats.cantos_casa, stats.home?.corners, stats.casa?.cantos, jogo.cantos_casa, '-');
  const cornersAway = pick(stats.cantos_fora, stats.away?.corners, stats.fora?.cantos, jogo.cantos_fora, '-');

  return (
    <div className="space-y-2">
      <InfoLine label="Posse" value={`${home.name}: ${posseHome} | ${away.name}: ${posseAway}`} />
      <InfoLine label="Chutes" value={`${home.name}: ${shotsHome} | ${away.name}: ${shotsAway}`} />
      <InfoLine label="Cantos" value={`${home.name}: ${cornersHome} | ${away.name}: ${cornersAway}`} />
    </div>
  );
}

function StandingsPanel({ jogo }) {
  const table = pick(jogo.classificacao, jogo.standings, jogo.tabela, {});

  return (
    <div className="grid grid-cols-2 gap-2">
      <InfoLine label="Casa posição" value={pick(table.casa_posicao, table.home?.rank, '-')} />
      <InfoLine label="Fora posição" value={pick(table.fora_posicao, table.away?.rank, '-')} />
      <InfoLine label="Casa pontos" value={pick(table.casa_pontos, table.home?.points, '-')} />
      <InfoLine label="Fora pontos" value={pick(table.fora_pontos, table.away?.points, '-')} />
    </div>
  );
}

function H2HPanel({ jogo, home, away }) {
  const h2h = pick(jogo.h2h, jogo.confronto_direto, jogo.cd, {});

  return (
    <div className="rounded-2xl bg-black/25 border border-white/10 p-3">
      <p className="text-xs text-white/45 font-bold mb-2">Confronto direto</p>
      <p className="text-sm text-white/80 font-bold">
        {asText(h2h.resumo, h2h.summary, `${home.name} x ${away.name}`)}
      </p>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <InfoLine label="Casa" value={pick(h2h.vitorias_casa, h2h.homeWins, '-')} />
        <InfoLine label="Empates" value={pick(h2h.empates, h2h.draws, '-')} />
        <InfoLine label="Fora" value={pick(h2h.vitorias_fora, h2h.awayWins, '-')} />
      </div>
    </div>
  );
}

function CommentaryPanel({ jogo }) {
  const comment = asText(
    jogo.comentario,
    jogo.commentary,
    jogo.narracao,
    jogo.analise,
    'Comentário em tempo real será exibido quando a API enviar eventos, gols, cartões e mudanças importantes.'
  );

  return (
    <div className="rounded-2xl bg-black/25 border border-white/10 p-3">
      <p className="text-xs text-white/45 font-bold mb-2">Comentário</p>
      <p className="text-sm text-white/75 leading-relaxed">{comment}</p>
    </div>
  );
}

export default function CardJogo({ jogo = {}, onClick, onSelect, selecionado = false, compacto = false }) {
  const [tab, setTab] = React.useState('detalhes');

  const home = getHome(jogo);
  const away = getAway(jogo);
  const league = getLeague(jogo);
  const round = getRound(jogo);
  const goals = getGoals(jogo);
  const dateTime = getDateTime(jogo);
  const minute = getMinute(jogo);

  const homeScore = home.score ?? '-';
  const awayScore = away.score ?? '-';

  const statusText = isFinished(jogo)
    ? 'Fim de jogo'
    : isLive(jogo)
      ? minute || 'Ao vivo'
      : getStatus(jogo) || 'Pré-jogo';

  function openCard() {
    if (typeof onClick === 'function') onClick(jogo);
    if (typeof onSelect === 'function') onSelect(jogo);
  }

  function renderPanel() {
    if (tab === 'detalhes') return <DetailsPanel jogo={jogo} home={home} away={away} />;
    if (tab === 'escalacoes') return <LineupsPanel jogo={jogo} home={home} away={away} />;
    if (tab === 'ia') return <PredictionPanel jogo={jogo} />;
    if (tab === 'estatisticas') return <EstatisticasJogoPro jogo={jogo} casa={home} fora={away} />;
    if (tab === 'classificacao') return <StandingsPanel jogo={jogo} />;
    if (tab === 'cd') return <H2HPanel jogo={jogo} home={home} away={away} />;
    return <CommentaryPanel jogo={jogo} />;
  }

  return (
    <article
      onClick={openCard}
      className={`w-full overflow-hidden rounded-[28px] border bg-gradient-to-b from-[#302315] via-[#161616] to-[#080808] shadow-xl transition-all ${
        selecionado ? 'border-yellow-400/60 shadow-yellow-500/10' : 'border-white/10'
      }`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-5 h-5 rounded-full bg-yellow-400/15 border border-yellow-400/25 flex items-center justify-center text-[11px]">
              🏆
            </span>

            <p className="text-xs text-white/75 font-black truncate">
              {league}
              {round ? <span className="text-white/35"> • {round}</span> : null}
            </p>
          </div>

          {isLive(jogo) && (
            <span className="shrink-0 rounded-full bg-red-500/15 border border-red-400/25 px-2 py-1 text-[10px] font-black text-red-300">
              AO VIVO
            </span>
          )}
        </div>

        <div className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 ${compacto ? 'mt-3' : 'mt-5'}`}>
          <div className="flex flex-col items-center text-center min-w-0">
            <p className="text-[11px] sm:text-xs text-white font-black truncate w-full">{home.name}</p>

            <div className="mt-2">
              <LogoTeam src={home.logo} name={home.name} />
            </div>

            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 text-white/30 hover:text-yellow-300 transition-colors"
              title="Favoritar"
            >
              ☆
            </button>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-[11px] text-white/35 font-bold h-4">{dateTime || minute || 'Hoje'}</p>

            <div className="mt-1 rounded-2xl bg-black border border-yellow-400/20 px-4 py-2 shadow-lg shadow-black/40">
              <div className="flex items-center gap-2 text-4xl sm:text-5xl font-black leading-none tracking-tight">
                <span className="text-yellow-400">{homeScore}</span>
                <span className="text-white/45">-</span>
                <span className="text-white">{awayScore}</span>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-white/45 font-bold">{statusText}</p>
          </div>

          <div className="flex flex-col items-center text-center min-w-0">
            <p className="text-[11px] sm:text-xs text-white font-black truncate w-full">{away.name}</p>

            <div className="mt-2">
              <LogoTeam src={away.logo} name={away.name} />
            </div>

            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 text-white/30 hover:text-yellow-300 transition-colors"
              title="Favoritar"
            >
              ☆
            </button>
          </div>
        </div>

        <div className="mt-3 min-h-[18px] flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {goals.length > 0 ? (
            goals.map((g, i) => (
              <span key={i} className="text-[11px] text-white/70 font-bold">
                {g.minute ? `${g.minute} ` : ''}{g.player}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-white/35 font-bold">
              Gols e eventos serão exibidos automaticamente pela API
            </span>
          )}
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <TabButton active={tab === 'detalhes'} onClick={() => setTab('detalhes')}>☰ Detalhes</TabButton>
          <TabButton active={tab === 'escalacoes'} onClick={() => setTab('escalacoes')}>⚑ Escalações</TabButton>
          <TabButton active={tab === 'ia'} onClick={() => setTab('ia')}>🤖 Previsão IA</TabButton>
          <TabButton active={tab === 'estatisticas'} onClick={() => setTab('estatisticas')}>〽 Estatísticas</TabButton>
          <TabButton active={tab === 'classificacao'} onClick={() => setTab('classificacao')}>♚ Classificações</TabButton>
          <TabButton active={tab === 'cd'} onClick={() => setTab('cd')}>⚔ CD</TabButton>
          <TabButton active={tab === 'comentario'} onClick={() => setTab('comentario')}>☷ Comentário</TabButton>
        </div>

        <div onClick={(e) => e.stopPropagation()} className="mt-2 rounded-3xl border border-white/10 bg-black/20 p-3">
          {renderPanel()}
        </div>
      </div>
    </article>
  );
}
