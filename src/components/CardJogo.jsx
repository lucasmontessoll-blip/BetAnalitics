import React, { useEffect, useMemo } from 'react';

import CardJogoBase from './CardJogoBase.jsx';

import {
  normalizarEstatisticas,
} from '../services/apiFootballMapper.js';

import {
  useDetalhesJogo,
} from '../hooks/useDetalhesJogo.js';

import {
  enriquecerJogoComAnaliseReal,
} from '../utils/iaExplicavel.js';

import {
  salvarAnaliseIA,
} from '../utils/historicoIA.js';

/* BET_ETAPA_37B_CARD_DETALHADO */

function statusAplicacao(short = '', long = '') {
  const status = String(short || '')
    .trim()
    .toUpperCase();

  if (
    [
      '1H',
      '2H',
      'HT',
      'ET',
      'BT',
      'P',
      'LIVE',
    ].includes(status)
  ) {
    return 'Live';
  }

  if (
    [
      'FT',
      'AET',
      'PEN',
    ].includes(status)
  ) {
    return 'Finished';
  }

  if (
    [
      'NS',
      'TBD',
    ].includes(status)
  ) {
    return 'Not Started';
  }

  return long || short || '';
}

function encontrarEscalacao(
  lineups,
  {
    id,
    nome,
  }
) {
  if (!Array.isArray(lineups)) {
    return null;
  }

  const nomeNormalizado = String(
    nome || ''
  )
    .trim()
    .toLowerCase();

  return (
    lineups.find((item) => {
      const teamId = Number(
        item?.team?.id
      );

      if (
        id &&
        Number(id) === teamId
      ) {
        return true;
      }

      const teamName = String(
        item?.team?.name || ''
      )
        .trim()
        .toLowerCase();

      return (
        nomeNormalizado &&
        teamName === nomeNormalizado
      );
    }) ||
    null
  );
}

function resumoEventos(eventos = []) {
  if (!Array.isArray(eventos) || eventos.length === 0) {
    return '';
  }

  return eventos
    .slice(-8)
    .map((evento) => {
      const minuto =
        evento?.time?.elapsed !== undefined &&
        evento?.time?.elapsed !== null
          ? `${evento.time.elapsed}'`
          : '';

      const tipo =
        evento?.detail ||
        evento?.type ||
        'Evento';

      const jogador =
        evento?.player?.name ||
        '';

      const time =
        evento?.team?.name ||
        '';

      return [
        minuto,
        tipo,
        jogador,
        time,
      ]
        .filter(Boolean)
        .join(' · ');
    })
    .filter(Boolean)
    .join(' | ');
}

function mesclarDetalhes(
  jogo = {},
  detalhes = null
) {
  if (!detalhes) {
    return jogo;
  }

  const item =
    detalhes?.fixture ||
    null;

  const fixture =
    item?.fixture ||
    null;

  const league =
    item?.league ||
    null;

  const teams =
    item?.teams ||
    null;

  const goals =
    item?.goals ||
    null;

  const status =
    fixture?.status ||
    null;

  const statistics =
    Array.isArray(detalhes?.statistics)
      ? detalhes.statistics
      : [];

  const events =
    Array.isArray(detalhes?.events)
      ? detalhes.events
      : [];

  const lineupsApi =
    Array.isArray(detalhes?.lineups)
      ? detalhes.lineups
      : [];

  const playersApi =
    Array.isArray(detalhes?.players)
      ? detalhes.players
      : [];

  const homeId =
    teams?.home?.id ??
    jogo?.home_id ??
    null;

  const awayId =
    teams?.away?.id ??
    jogo?.away_id ??
    null;

  const homeName =
    teams?.home?.name ??
    jogo?.home_team ??
    jogo?.time_casa ??
    '';

  const awayName =
    teams?.away?.name ??
    jogo?.away_team ??
    jogo?.time_fora ??
    '';

  const lineupHome =
    encontrarEscalacao(
      lineupsApi,
      {
        id: homeId,
        nome: homeName,
      }
    );

  const lineupAway =
    encontrarEscalacao(
      lineupsApi,
      {
        id: awayId,
        nome: awayName,
      }
    );

  const possuiLineup =
    Boolean(lineupHome) ||
    Boolean(lineupAway);

  const estatisticasNormalizadas =
    statistics.length > 0
      ? normalizarEstatisticas(statistics)
      : jogo?.estatisticas;

  const statusNovo =
    status
      ? statusAplicacao(
          status?.short,
          status?.long
        )
      : jogo?.status;

  const elapsed =
    status?.elapsed;

  const comentarioApi =
    resumoEventos(events);

  return {
    ...jogo,

    api_football_id:
      fixture?.id ??
      jogo?.api_football_id,

    fonte_dados:
      jogo?.fonte_dados ||
      'api-football',

    fixture:
      fixture ||
      jogo?.fixture,

    league:
      league ||
      jogo?.league,

    teams:
      teams ||
      jogo?.teams,

    goals:
      goals ||
      jogo?.goals,

    home_id:
      homeId,

    away_id:
      awayId,

    home_team:
      homeName ||
      jogo?.home_team,

    away_team:
      awayName ||
      jogo?.away_team,

    home_image:
      teams?.home?.logo ??
      jogo?.home_image,

    away_image:
      teams?.away?.logo ??
      jogo?.away_image,

    league_id:
      league?.id ??
      jogo?.league_id,

    league_name:
      league?.name ??
      jogo?.league_name,

    league_country:
      league?.country ??
      jogo?.league_country,

    league_logo:
      league?.logo ??
      jogo?.league_logo,

    starting_at:
      fixture?.date ??
      jogo?.starting_at,

    venue:
      fixture?.venue?.name ??
      jogo?.venue,

    city:
      fixture?.venue?.city ??
      jogo?.city,

    referee:
      fixture?.referee ??
      jogo?.referee,

    status:
      statusNovo,

    status_short:
      status?.short ??
      jogo?.status_short,

    status_long:
      status?.long ??
      jogo?.status_long,

    time_elapsed:
      statusNovo === 'Live' &&
      elapsed !== undefined &&
      elapsed !== null
        ? `${elapsed}'`
        : jogo?.time_elapsed,

    scoreHome:
      goals?.home ??
      jogo?.scoreHome,

    scoreAway:
      goals?.away ??
      jogo?.scoreAway,

    placar_casa:
      goals?.home ??
      jogo?.placar_casa,

    placar_fora:
      goals?.away ??
      jogo?.placar_fora,

    estatisticas:
      estatisticasNormalizadas,

    statistics:
      statistics.length > 0
        ? statistics
        : jogo?.statistics,

    estatisticas_api:
      statistics.length > 0
        ? statistics
        : jogo?.estatisticas_api,

    lineups:
      possuiLineup
        ? {
            home:
              lineupHome?.startXI ||
              [],
            away:
              lineupAway?.startXI ||
              [],
          }
        : jogo?.lineups,

    lineups_api:
      lineupsApi.length > 0
        ? lineupsApi
        : jogo?.lineups_api,

    players_api:
      playersApi.length > 0
        ? playersApi
        : jogo?.players_api,

    events:
      events.length > 0
        ? events
        : jogo?.events,

    eventos:
      events.length > 0
        ? events
        : jogo?.eventos,

    comentario:
      comentarioApi ||
      jogo?.comentario,

    odds_api:
      Array.isArray(detalhes?.odds) &&
      detalhes.odds.length > 0
        ? detalhes.odds
        : jogo?.odds_api,

    odds_live_api:
      Array.isArray(detalhes?.oddsLive) &&
      detalhes.oddsLive.length > 0
        ? detalhes.oddsLive
        : jogo?.odds_live_api,

    injuries:
      Array.isArray(detalhes?.injuries) &&
      detalhes.injuries.length > 0
        ? detalhes.injuries
        : jogo?.injuries,

    h2h:
      Array.isArray(detalhes?.h2h) &&
      detalhes.h2h.length > 0
        ? detalhes.h2h
        : jogo?.h2h,

    predictions:
      detalhes?.predictions ??
      jogo?.predictions,

    detalhes_api_carregados: true,

    raw_api_football_detalhes:
      detalhes,
  };
}

export default function CardJogo(props) {
  const {
    jogo = {},
    selecionado = false,
    compacto = false,
  } = props;

  const carregarDetalhes =
    Boolean(selecionado) &&
    !Boolean(compacto);

  const {
    detalhes,
    loading,
    erro,
    disponivel,
  } = useDetalhesJogo(
    jogo,
    {
      ativo: carregarDetalhes,
    }
  );

  const jogoFinal = useMemo(
    () => enriquecerJogoComAnaliseReal(
      mesclarDetalhes(
        jogo,
        detalhes
      )
    ),
    [jogo, detalhes]
  );

  useEffect(() => {
    if (!carregarDetalhes) return;
    if (!disponivel) return;
    if (loading) return;
    if (erro) return;
    if (!detalhes) return;

    if (
      jogoFinal?.confianca_fonte !==
      'api-football-predictions'
    ) {
      return;
    }

    void salvarAnaliseIA(jogoFinal);
  }, [
    carregarDetalhes,
    disponivel,
    loading,
    erro,
    detalhes,
    jogoFinal,
  ]);
  if (!carregarDetalhes || !disponivel) {
    return (
      <CardJogoBase
        {...props}
        jogo={jogo}
      />
    );
  }

  return (
    <>
      {loading && (
        <div className="mb-2 rounded-xl bg-blue-500/[0.07] px-3 py-2 text-center text-[8px] font-black uppercase tracking-wider text-blue-300 ring-1 ring-inset ring-blue-500/15">
          Atualizando dados da partida...
        </div>
      )}

      {!loading && erro && (
        <div className="mb-2 rounded-xl bg-amber-500/[0.06] px-3 py-2 text-center text-[8px] font-black text-amber-300 ring-1 ring-inset ring-amber-500/15">
          {erro}
        </div>
      )}

      {!loading &&
        !erro &&
        detalhes?.cache &&
        detalhes?.stale && (
          <div className="mb-2 rounded-xl bg-white/[0.035] px-3 py-2 text-center text-[8px] font-black text-slate-500 ring-1 ring-inset ring-white/[0.05]">
            Exibindo os últimos dados disponíveis
          </div>
        )}

      <CardJogoBase
        {...props}
        jogo={jogoFinal}
      />
    </>
  );
}
