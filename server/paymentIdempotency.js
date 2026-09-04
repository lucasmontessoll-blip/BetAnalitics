import {
  createHash
} from 'crypto';

import {
  cacheCompartilhadoGet,
  cacheCompartilhadoSet
} from './sharedCache.js';

import {
  executarSingleFlightDistribuido
} from './distributedCoordination.js';

const CACHE_TTL_MS =
  24 * 60 * 60 * 1000;

const COMPAT_WINDOW_MS =
  5 * 60 * 1000;

const localClaims =
  new Map();

function hash(valor) {
  return createHash(
    'sha256'
  )
    .update(
      String(
        valor ?? ''
      )
    )
    .digest('hex');
}

function metodoValido(
  valor
) {
  const metodo =
    String(
      valor || ''
    )
      .trim()
      .toLowerCase();

  if (
    metodo !== 'pix' &&
    metodo !== 'cartao'
  ) {
    const erro =
      new Error(
        'Metodo de pagamento invalido.'
      );

    erro.status = 400;
    erro.code =
      'PAYMENT_METHOD_INVALID';

    throw erro;
  }

  return metodo;
}

function canonicalizar(
  valor
) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return null;
  }

  if (
    Array.isArray(valor)
  ) {
    return valor.map(
      canonicalizar
    );
  }

  if (
    typeof valor ===
    'object'
  ) {
    const resultado = {};

    for (
      const chave
      of Object.keys(valor)
        .sort()
    ) {
      resultado[chave] =
        canonicalizar(
          valor[chave]
        );
    }

    return resultado;
  }

  return valor;
}

function fingerprintDados(
  dados
) {
  return hash(
    JSON.stringify(
      canonicalizar(
        dados || {}
      )
    )
  );
}

function chaveInformada(
  req
) {
  let valor = '';

  try {
    valor =
      req?.get?.(
        'Idempotency-Key'
      ) ||
      '';
  }
  catch {
  }

  if (!valor) {
    valor =
      req?.headers
        ?.[
          'idempotency-key'
        ] ||
      req?.headers
        ?.[
          'Idempotency-Key'
        ] ||
      req?.body
        ?.idempotency_key ||
      '';
  }

  return String(valor)
    .trim();
}

function erroConflito() {
  const erro =
    new Error(
      'A mesma tentativa de pagamento foi reutilizada com dados diferentes.'
    );

  erro.status = 409;
  erro.code =
    'PAYMENT_IDEMPOTENCY_CONFLICT';

  return erro;
}

function validarRegistro(
  registro,
  fingerprint
) {
  if (
    registro?.fingerprint &&
    registro.fingerprint !==
      fingerprint
  ) {
    throw erroConflito();
  }
}

function limparClaimsLocais() {
  const agora =
    Date.now();

  for (
    const [key, item]
    of localClaims.entries()
  ) {
    if (
      !item ||
      item.expiresAt <= agora
    ) {
      localClaims.delete(
        key
      );
    }
  }

  while (
    localClaims.size > 5000
  ) {
    const primeira =
      localClaims.keys()
        .next()
        .value;

    if (!primeira) {
      break;
    }

    localClaims.delete(
      primeira
    );
  }
}

function registrarClaimLocal(
  key,
  fingerprint
) {
  limparClaimsLocais();

  const existente =
    localClaims.get(
      key
    );

  if (
    existente &&
    existente.fingerprint !==
      fingerprint
  ) {
    throw erroConflito();
  }

  if (!existente) {
    localClaims.set(
      key,
      {
        fingerprint,

        expiresAt:
          Date.now() +
          CACHE_TTL_MS
      }
    );
  }
}

export function prepararIdempotenciaPagamento(
  req,
  {
    metodo,
    dados
  } = {}
) {
  const metodoLimpo =
    metodoValido(
      metodo
    );

  const fingerprint =
    fingerprintDados(
      dados
    );

  const informada =
    chaveInformada(
      req
    );

  if (informada) {
    if (
      informada.length < 16 ||
      informada.length > 128 ||
      !/^[A-Za-z0-9._:-]+$/
        .test(informada)
    ) {
      const erro =
        new Error(
          'Chave de idempotencia invalida.'
        );

      erro.status = 400;
      erro.code =
        'PAYMENT_IDEMPOTENCY_INVALID';

      throw erro;
    }

    return {
      chaveCliente:
        informada,

      fingerprint,

      modo:
        'client-stable'
    };
  }

  /*
   * Compatibilidade com APKs antigos:
   *
   * requests iguais dentro de uma janela
   * de 5 minutos recebem a mesma chave.
   *
   * O novo frontend usa client-stable.
   */
  const bucket =
    Math.floor(
      Date.now() /
      COMPAT_WINDOW_MS
    );

  const chaveCompat =
    'compat-' +
    hash(
      `${metodoLimpo}:` +
      `${fingerprint}:` +
      `${bucket}`
    ).slice(
      0,
      48
    );

  return {
    chaveCliente:
      chaveCompat,

    fingerprint,

    modo:
      'compat-window'
  };
}

export function mercadoPagoIdempotencyKey(
  metodo,
  chaveCliente
) {
  const metodoLimpo =
    metodoValido(
      metodo
    );

  const chave =
    String(
      chaveCliente ||
      ''
    ).trim();

  if (!chave) {
    throw new Error(
      'Chave de idempotencia ausente.'
    );
  }

  return (
    `betanalytics-${metodoLimpo}-` +
    hash(chave)
      .slice(
        0,
        48
      )
  );
}

export async function executarPagamentoIdempotente({
  metodo,
  chaveCliente,
  fingerprint,
  executar
}) {
  const metodoLimpo =
    metodoValido(
      metodo
    );

  const chave =
    String(
      chaveCliente ||
      ''
    ).trim();

  const fp =
    String(
      fingerprint ||
      ''
    ).trim();

  if (
    !chave ||
    !fp ||
    typeof executar !==
      'function'
  ) {
    const erro =
      new Error(
        'Tentativa de pagamento invalida.'
      );

    erro.status = 400;
    erro.code =
      'PAYMENT_IDEMPOTENCY_INVALID';

    throw erro;
  }

  const idHash =
    hash(
      `${metodoLimpo}:${chave}`
    ).slice(
      0,
      48
    );

  const cacheKey =
    `payment-idem:` +
    `${metodoLimpo}:` +
    `${idHash}`;

  const lockKey =
    `payment-idem:` +
    `${metodoLimpo}:` +
    `${idHash}`;

  /*
   * Evita corrida dentro do mesmo
   * processo até antes do lock Redis.
   */
  registrarClaimLocal(
    lockKey,
    fp
  );

  const existente =
    await cacheCompartilhadoGet(
      cacheKey
    );

  validarRegistro(
    existente,
    fp
  );

  if (
    existente?.resultado
  ) {
    return {
      ...existente.resultado,

      replay:
        true
    };
  }

  const mpKey =
    mercadoPagoIdempotencyKey(
      metodoLimpo,
      chave
    );

  return executarSingleFlightDistribuido({
    key:
      lockKey,

    lockTtlMs:
      35000,

    waitTimeoutMs:
      30000,

    pollMs:
      100,

    readResult:
      async () => {
        const item =
          await cacheCompartilhadoGet(
            cacheKey
          );

        if (!item) {
          return {
            found:
              false
          };
        }

        validarRegistro(
          item,
          fp
        );

        if (
          item.resultado
        ) {
          return {
            found:
              true,

            value: {
              ...item.resultado,

              replay:
                true
            }
          };
        }

        return {
          found:
            false
        };
      },

    task:
      async () => {
        const depoisDoLock =
          await cacheCompartilhadoGet(
            cacheKey
          );

        validarRegistro(
          depoisDoLock,
          fp
        );

        if (
          depoisDoLock?.resultado
        ) {
          return {
            ...depoisDoLock
              .resultado,

            replay:
              true
          };
        }

        /*
         * Registra o fingerprint ANTES
         * de chamar o meio financeiro.
         *
         * Nunca armazenamos CPF, email
         * ou token do cartao no cache.
         */
        await cacheCompartilhadoSet(
          cacheKey,
          {
            fingerprint:
              fp,

            resultado:
              null,

            criado_em:
              Date.now()
          },
          CACHE_TTL_MS
        );

        const executado =
          await executar({
            mercadoPagoKey:
              mpKey
          });

        const status =
          Number(
            executado?.status
          ) || 500;

        const body =
          executado?.body &&
          typeof executado.body ===
            'object'
            ? executado.body
            : {};

        const resultado =
          {
            status,
            body
          };

        if (
          executado?.cacheable ===
            true &&
          status >= 200 &&
          status < 300
        ) {
          await cacheCompartilhadoSet(
            cacheKey,
            {
              fingerprint:
                fp,

              resultado,

              criado_em:
                Date.now()
            },
            CACHE_TTL_MS
          );
        }

        return {
          ...resultado,

          replay:
            false
        };
      }
  });
}

export function pagamentoIdempotenciaStatus() {
  return {
    modo:
      'client-stable+compat-window',

    cache_ttl_ms:
      CACHE_TTL_MS,

    compat_window_ms:
      COMPAT_WINDOW_MS,

    lock_distribuido:
      true,

    chave_mp_derivada:
      true,

    claims_locais:
      localClaims.size
  };
}
