function numeroPercentual(valor) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {
    return null;
  }

  const numero = Number(
    String(valor)
      .replace('%', '')
      .replace(',', '.')
      .replace(/[^0-9.-]/g, '')
  );

  if (!Number.isFinite(numero)) {
    return null;
  }

  return Math.max(
    0,
    Math.min(100, numero)
  );
}

function numeroOdd(valor) {
  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {
    return null;
  }

  const numero = Number(
    String(valor)
      .replace(',', '.')
      .replace(/[^0-9.-]/g, '')
  );

  return Number.isFinite(numero) &&
    numero > 1
    ? numero
    : null;
}

function predictionObject(jogo = {}) {
  const fonte =
    jogo?.predictions ||
    jogo?.prediction ||
    jogo?.raw_api_football_detalhes?.predictions ||
    null;

  if (!fonte) {
    return null;
  }

  if (fonte?.predictions) {
    return fonte.predictions;
  }

  return fonte;
}

function listaOdds(jogo = {}) {
  const fonte =
    jogo?.odds_api ||
    jogo?.raw_api_football_detalhes?.odds ||
    [];

  if (Array.isArray(fonte)) {
    return fonte;
  }

  if (Array.isArray(fonte?.response)) {
    return fonte.response;
  }

  return [];
}

function extrairOddsReais(jogo = {}) {
  const lista = listaOdds(jogo);

  for (const item of lista) {
    const bookmakers =
      item?.bookmakers ||
      [];

    for (const bookmaker of bookmakers) {
      const bets =
        bookmaker?.bets ||
        [];

      const mercado = bets.find(
        (bet) =>
          /match winner|1x2|winner/i.test(
            String(bet?.name || '')
          )
      );

      if (!mercado) {
        continue;
      }

      const values =
        mercado?.values ||
        [];

      const home = values.find(
        (value) =>
          /home|^1$/i.test(
            String(value?.value || '')
          )
      );

      const draw = values.find(
        (value) =>
          /draw|^x$/i.test(
            String(value?.value || '')
          )
      );

      const away = values.find(
        (value) =>
          /away|^2$/i.test(
            String(value?.value || '')
          )
      );

      const oddCasa =
        numeroOdd(home?.odd);

      const oddEmpate =
        numeroOdd(draw?.odd);

      const oddFora =
        numeroOdd(away?.odd);

      return {
        casa: oddCasa,
        empate: oddEmpate,
        fora: oddFora,
        principal:
          oddCasa ||
          oddFora ||
          oddEmpate ||
          null,
        bookmaker:
          bookmaker?.name ||
          null,
      };
    }
  }

  return {
    casa: null,
    empate: null,
    fora: null,
    principal: null,
    bookmaker: null,
  };
}

export function gerarAnaliseExplicavel(
  jogo = {}
) {
  const prediction =
    predictionObject(jogo);

  if (!prediction) {
    return {
      disponivel: false,
      confianca: null,
      mercado: null,
      risco: null,
      probabilidades: {
        casa: null,
        empate: null,
        fora: null,
      },
      fatores: [],
      fonte:
        'API-Football /predictions',
    };
  }

  const percent =
    prediction?.percent ||
    {};

  const casa =
    numeroPercentual(percent?.home);

  const empate =
    numeroPercentual(percent?.draw);

  const fora =
    numeroPercentual(percent?.away);

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
      item.valor !== null
  );

  if (candidatos.length === 0) {
    return {
      disponivel: false,
      confianca: null,
      mercado: null,
      risco: null,
      probabilidades: {
        casa,
        empate,
        fora,
      },
      fatores: [],
      fonte:
        'API-Football /predictions',
    };
  }

  candidatos.sort(
    (a, b) =>
      b.valor - a.valor
  );

  const melhor =
    candidatos[0];

  const segundo =
    candidatos[1] ||
    null;

  const diferenca =
    segundo
      ? melhor.valor - segundo.valor
      : melhor.valor;

  const homeName =
    jogo?.home_team ||
    jogo?.time_casa ||
    'Mandante';

  const awayName =
    jogo?.away_team ||
    jogo?.time_fora ||
    'Visitante';

  const winnerName =
    prediction?.winner?.name ||
    '';

  let mercado;

  if (melhor.id === 'casa') {
    mercado = `Vitória ${homeName}`;
  }
  else if (melhor.id === 'fora') {
    mercado = `Vitória ${awayName}`;
  }
  else {
    mercado = 'Empate';
  }

  if (winnerName) {
    const winnerLower =
      String(winnerName)
        .trim()
        .toLowerCase();

    if (
      winnerLower ===
      String(homeName)
        .trim()
        .toLowerCase()
    ) {
      mercado =
        `Vitória ${homeName}`;
    }
    else if (
      winnerLower ===
      String(awayName)
        .trim()
        .toLowerCase()
    ) {
      mercado =
        `Vitória ${awayName}`;
    }
  }

  const fatores = [];

  fatores.push(
    `Probabilidades da API: casa ${
      casa !== null ? `${casa}%` : '-'
    }, empate ${
      empate !== null ? `${empate}%` : '-'
    }, fora ${
      fora !== null ? `${fora}%` : '-'
    }.`
  );

  if (prediction?.advice) {
    fatores.push(
      `Recomendação da fonte: ${prediction.advice}`
    );
  }

  if (prediction?.winner?.comment) {
    fatores.push(
      `Leitura do vencedor: ${prediction.winner.comment}`
    );
  }

  const golsCasa =
    prediction?.goals?.home;

  const golsFora =
    prediction?.goals?.away;

  if (
    golsCasa !== undefined ||
    golsFora !== undefined
  ) {
    fatores.push(
      `Faixa projetada de gols: ${homeName} ${
        golsCasa ?? '-'
      } · ${awayName} ${
        golsFora ?? '-'
      }.`
    );
  }

  let risco;

  if (diferenca >= 25) {
    risco = 'Separação alta';
  }
  else if (diferenca >= 12) {
    risco = 'Separação moderada';
  }
  else {
    risco = 'Cenário equilibrado';
  }

  return {
    disponivel: true,

    confianca:
      melhor.valor,

    mercado,

    risco,

    probabilidades: {
      casa,
      empate,
      fora,
    },

    fatores,

    fonte:
      'API-Football /predictions',

    advice:
      prediction?.advice ||
      null,

    winner:
      prediction?.winner ||
      null,
  };
}

export function enriquecerJogoComAnaliseReal(
  jogo = {}
) {
  const analise =
    gerarAnaliseExplicavel(jogo);

  const oddsReais =
    extrairOddsReais(jogo);

  const apiFootball =
    String(
      jogo?.fonte_dados || ''
    )
      .trim()
      .toLowerCase() ===
    'api-football';

  return {
    ...jogo,

    confianca_ia:
      analise.disponivel
        ? analise.confianca
        : apiFootball
          ? null
          : jogo?.confianca_ia,

    confiancaIA:
      analise.disponivel
        ? analise.confianca
        : apiFootball
          ? null
          : jogo?.confiancaIA,

    mercado_principal:
      analise.disponivel
        ? analise.mercado
        : jogo?.mercado_principal,

    probabilidades:
      analise.disponivel
        ? analise.probabilidades
        : jogo?.probabilidades,

    odd_casa:
      oddsReais.casa ??
      (
        apiFootball
          ? null
          : jogo?.odd_casa
      ),

    odd_empate:
      oddsReais.empate ??
      (
        apiFootball
          ? null
          : jogo?.odd_empate
      ),

    odd_fora:
      oddsReais.fora ??
      (
        apiFootball
          ? null
          : jogo?.odd_fora
      ),

    odd_principal:
      oddsReais.principal ??
      (
        apiFootball
          ? null
          : jogo?.odd_principal
      ),

    bookmaker:
      oddsReais.bookmaker ??
      jogo?.bookmaker,

    odds: {
      home:
        oddsReais.casa ??
        (
          apiFootball
            ? null
            : jogo?.odds?.home
        ),

      draw:
        oddsReais.empate ??
        (
          apiFootball
            ? null
            : jogo?.odds?.draw
        ),

      away:
        oddsReais.fora ??
        (
          apiFootball
            ? null
            : jogo?.odds?.away
        ),
    },

    explicacao_ia:
      analise,

    confianca_fonte:
      analise.disponivel
        ? 'api-football-predictions'
        : null,

    odds_fonte:
      oddsReais.principal !== null
        ? 'api-football-odds'
        : null,
  };
}
