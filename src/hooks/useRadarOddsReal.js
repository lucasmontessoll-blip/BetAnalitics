import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  apiUrl,
} from '../utils/apiBase.js';

import {
  sessaoAtual,
} from '../services/authClient.js';

function numero(valor) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {
    return null;
  }

  const n = Number(
    String(valor)
      .replace('%', '')
      .replace(',', '.')
      .replace(/[^0-9.-]/g, '')
  );

  return Number.isFinite(n)
    ? n
    : null;
}

function fixtureIdApiFootball(jogo = {}) {
  const direto =
    jogo?.api_football_id ??
    jogo?.raw_api_football?.fixture?.id ??
    null;

  if (
    direto !== null &&
    direto !== undefined &&
    /^\d+$/.test(String(direto))
  ) {
    return String(direto);
  }

  const fonte =
    String(
      jogo?.fonte_dados || ''
    )
      .trim()
      .toLowerCase();

  if (
    fonte === 'api-football' &&
    /^\d+$/.test(
      String(
        jogo?.fixture?.id ?? ''
      )
    )
  ) {
    return String(
      jogo.fixture.id
    );
  }

  const id =
    String(jogo?.id || '');

  const match =
    id.match(
      /^api-football-(\d+)$/i
    );

  return match?.[1] || null;
}

function statusJogo(jogo = {}) {
  return String(
    jogo?.status_short ??
    jogo?.fixture?.status?.short ??
    jogo?.status ??
    ''
  )
    .trim()
    .toUpperCase();
}

function ehPreJogo(jogo = {}) {
  const status =
    statusJogo(jogo);

  if (
    [
      'LIVE',
      '1H',
      '2H',
      'HT',
      'ET',
      'BT',
      'P',
      'FT',
      'AET',
      'PEN',
      'CANC',
      'PST',
      'ABD',
      'SUSP',
    ].includes(status)
  ) {
    return false;
  }

  const texto =
    String(jogo?.status || '')
      .trim()
      .toLowerCase();

  if (
    texto.includes('live') ||
    texto.includes('finished') ||
    texto.includes('encerr')
  ) {
    return false;
  }

  return true;
}

function dataInicio(jogo = {}) {
  const valor =
    jogo?.starting_at ??
    jogo?.fixture?.date ??
    '';

  const time =
    new Date(valor).getTime();

  return Number.isFinite(time)
    ? time
    : Number.MAX_SAFE_INTEGER;
}

function percentuais(predictionRaw) {
  const prediction =
    predictionRaw?.predictions ||
    predictionRaw ||
    null;

  const percent =
    prediction?.percent ||
    {};

  const casa =
    numero(percent?.home);

  const empate =
    numero(percent?.draw);

  const fora =
    numero(percent?.away);

  const candidatos = [
    {
      id: 'casa',
      valor: casa,
    },
    {
      id: 'empate',
      valor: empate,
    },
    {
      id: 'fora',
      valor: fora,
    },
  ].filter(
    (item) =>
      item.valor !== null &&
      item.valor >= 0 &&
      item.valor <= 100
  );

  candidatos.sort(
    (a, b) =>
      b.valor - a.valor
  );

  return {
    casa,
    empate,
    fora,
    melhor:
      candidatos[0] ||
      null,
  };
}

function valorMercado(
  values,
  selecao
) {
  const lista =
    Array.isArray(values)
      ? values
      : [];

  const patterns = {
    casa:
      /^(home|1)$/i,

    empate:
      /^(draw|x)$/i,

    fora:
      /^(away|2)$/i,
  };

  const pattern =
    patterns[selecao];

  if (!pattern) {
    return null;
  }

  const entrada =
    lista.find(
      (value) =>
        pattern.test(
          String(
            value?.value || ''
          ).trim()
        )
    );

  const odd =
    numero(entrada?.odd);

  return odd !== null &&
    odd > 1
    ? odd
    : null;
}

function melhorOdd1X2(
  oddsRaw,
  selecao
) {
  const lista =
    Array.isArray(oddsRaw)
      ? oddsRaw
      : [];

  const candidatas = [];

  for (const item of lista) {
    const bookmakers =
      Array.isArray(item?.bookmakers)
        ? item.bookmakers
        : [];

    for (const bookmaker of bookmakers) {
      const bets =
        Array.isArray(bookmaker?.bets)
          ? bookmaker.bets
          : [];

      const mercado =
        bets.find(
          (bet) =>
            /match winner|1x2|winner/i.test(
              String(
                bet?.name || ''
              )
            )
        );

      if (!mercado) {
        continue;
      }

      const odd =
        valorMercado(
          mercado?.values,
          selecao
        );

      if (odd === null) {
        continue;
      }

      candidatas.push({
        odd,
        bookmaker:
          bookmaker?.name ||
          'Bookmaker',
      });
    }
  }

  candidatas.sort(
    (a, b) =>
      b.odd - a.odd
  );

  return (
    candidatas[0] ||
    {
      odd: null,
      bookmaker: null,
    }
  );
}

function nomes(jogo = {}) {
  return {
    casa:
      jogo?.home_team ??
      jogo?.time_casa ??
      jogo?.teams?.home?.name ??
      'Mandante',

    fora:
      jogo?.away_team ??
      jogo?.time_fora ??
      jogo?.teams?.away?.name ??
      'Visitante',
  };
}

function mercadoSelecao(
  selecao,
  jogo
) {
  const times =
    nomes(jogo);

  if (selecao === 'casa') {
    return `Vitória ${times.casa}`;
  }

  if (selecao === 'fora') {
    return `Vitória ${times.fora}`;
  }

  if (selecao === 'empate') {
    return 'Empate';
  }

  return null;
}

function montarRadarItem(
  jogo,
  detalhe
) {
  const probs =
    percentuais(
      detalhe?.predictions
    );

  const melhor =
    probs.melhor;

  if (!melhor) {
    return null;
  }

  const odds =
    melhorOdd1X2(
      detalhe?.odds,
      melhor.id
    );

  if (
    odds.odd === null ||
    !odds.bookmaker
  ) {
    return null;
  }

  const ev =
    (
      (
        melhor.valor /
        100
      ) *
      odds.odd -
      1
    ) *
    100;

  const times =
    nomes(jogo);

  return {
    id:
      jogo?.id ||
      `api-football-${fixtureIdApiFootball(jogo)}`,

    fixture_id:
      Number(
        fixtureIdApiFootball(
          jogo
        )
      ),

    casa:
      times.casa,

    fora:
      times.fora,

    liga:
      jogo?.league_name ??
      jogo?.liga ??
      jogo?.league?.name ??
      'Competição',

    partida_em:
      jogo?.starting_at ??
      jogo?.fixture?.date ??
      null,

    selecao:
      melhor.id,

    mercado:
      mercadoSelecao(
        melhor.id,
        jogo
      ),

    probabilidade:
      Number(
        melhor.valor.toFixed(1)
      ),

    odd:
      Number(
        odds.odd.toFixed(2)
      ),

    bookmaker:
      odds.bookmaker,

    ev:
      Number(
        ev.toFixed(1)
      ),

    probabilidades: {
      casa:
        probs.casa,

      empate:
        probs.empate,

      fora:
        probs.fora,
    },

    fonte_probabilidade:
      'api-football-predictions',

    fonte_odds:
      'api-football-odds',

    raw:
      jogo,
  };
}

export function useRadarOddsReal(
  jogos = []
) {
  const [dados, setDados] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [erro, setErro] =
    useState('');

  const [atualizacao, setAtualizacao] =
    useState(0);

  const candidatos =
    useMemo(
      () =>
        (
          Array.isArray(jogos)
            ? jogos
            : []
        )
          .filter(
            (jogo) =>
              Boolean(
                fixtureIdApiFootball(
                  jogo
                )
              ) &&
              ehPreJogo(jogo)
          )
          .sort(
            (a, b) =>
              dataInicio(a) -
              dataInicio(b)
          )
          .slice(0, 5),
      [jogos]
    );

  const ids =
    useMemo(
      () =>
        candidatos
          .map(
            fixtureIdApiFootball
          )
          .filter(Boolean)
          .join(','),
      [candidatos]
    );

  const recarregar =
    useCallback(
      () =>
        setAtualizacao(
          (valor) =>
            valor + 1
        ),
      []
    );

  useEffect(() => {
    if (!ids) {
      setDados([]);
      setErro('');
      setLoading(false);
      return undefined;
    }

    const controller =
      new AbortController();

    let ativo = true;

    async function carregar() {
      setLoading(true);
      setErro('');

      try {
        const sessao =
          await sessaoAtual()
            .catch(() => null);

        const token =
          String(
            sessao?.access_token || ''
          ).trim();

        const resp =
          await fetch(
            apiUrl(
              `/api/football/radar-odds?ids=${encodeURIComponent(ids)}`
            ),
            {
              signal:
                controller.signal,

              headers: {
                Accept:
                  'application/json',

                ...(
                  token
                    ? {
                        Authorization:
                          `Bearer ${token}`,
                      }
                    : {}
                ),
              },
            }
          );

        const data =
          await resp
            .json()
            .catch(() => null);

        if (
          !resp.ok ||
          !data?.ok
        ) {
          throw new Error(
            data?.erro ||
            `HTTP ${resp.status}`
          );
        }

        const mapa =
          new Map(
            (
              Array.isArray(data.itens)
                ? data.itens
                : []
            ).map(
              (item) => [
                String(
                  item.fixture_id
                ),
                item,
              ]
            )
          );

        const lista =
          candidatos
            .map(
              (jogo) =>
                montarRadarItem(
                  jogo,
                  mapa.get(
                    String(
                      fixtureIdApiFootball(
                        jogo
                      )
                    )
                  )
                )
            )
            .filter(Boolean)
            .sort(
              (a, b) => {
                if (
                  b.ev !==
                  a.ev
                ) {
                  return (
                    b.ev -
                    a.ev
                  );
                }

                return (
                  b.probabilidade -
                  a.probabilidade
                );
              }
            );

        if (ativo) {
          setDados(lista);
        }
      }
      catch (e) {
        if (
          e?.name ===
          'AbortError'
        ) {
          return;
        }

        if (ativo) {
          setDados([]);
          setErro(
            e?.message ||
            'Radar real indisponível.'
          );
        }
      }
      finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
      controller.abort();
    };
  }, [
    ids,
    candidatos,
    atualizacao,
  ]);

  return {
    oportunidades:
      dados,

    loading,

    erro,

    analisados:
      candidatos.length,

    recarregar,
  };
}
