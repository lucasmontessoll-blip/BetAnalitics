import {
  createHash
} from 'crypto';

import {
  redisInfraClient,
  redisInfraConfigured,
  redisInfraKey,
  redisInfraStatus
} from './redisInfra.js';

const localBuckets =
  new Map();

let ultimoBackend =
  'memoria';

let ultimoNamespace =
  '';

function inteiroPositivo(
  valor,
  fallback
) {
  const numero =
    Number(valor);

  if (
    !Number.isFinite(numero) ||
    numero <= 0
  ) {
    return fallback;
  }

  return Math.floor(
    numero
  );
}

function identidadeRequest(
  req
) {
  /*
   * Nas rotas protegidas o Supabase
   * ja preenche req.betUser antes
   * deste middleware.
   */
  const userId =
    String(
      req?.betUser?.id ||
      ''
    ).trim();

  if (userId) {
    return (
      'user:' +
      userId
    );
  }

  /*
   * Fallback defensivo.
   * Nao e o caminho normal das
   * rotas caras autenticadas.
   */
  const ip =
    String(
      req?.ip ||
      req?.socket?.remoteAddress ||
      'desconhecido'
    ).trim();

  return (
    'ip:' +
    ip
  );
}

function hashIdentidade(
  valor
) {
  return createHash(
    'sha256'
  )
    .update(
      String(valor)
    )
    .digest('hex')
    .slice(
      0,
      32
    );
}

function limparLocal() {
  const agora =
    Date.now();

  for (
    const [key, item]
    of localBuckets.entries()
  ) {
    if (
      !item ||
      item.expiresAt <= agora
    ) {
      localBuckets.delete(
        key
      );
    }
  }

  while (
    localBuckets.size > 5000
  ) {
    const primeira =
      localBuckets
        .keys()
        .next()
        .value;

    if (!primeira) {
      break;
    }

    localBuckets.delete(
      primeira
    );
  }
}

function consumirLocal({
  key,
  limit,
  expiresAt
}) {
  limparLocal();

  const agora =
    Date.now();

  const atual =
    localBuckets.get(
      key
    );

  let usado = 0;

  if (
    atual &&
    atual.expiresAt > agora
  ) {
    usado =
      atual.usado;
  }

  if (
    usado >= limit
  ) {
    return {
      permitido: false,
      usado,
      backend:
        'memoria'
    };
  }

  usado += 1;

  localBuckets.set(
    key,
    {
      usado,
      expiresAt
    }
  );

  return {
    permitido: true,
    usado,
    backend:
      'memoria'
  };
}

const RATE_LIMIT_LUA = `
local atual =
  tonumber(
    redis.call(
      'GET',
      KEYS[1]
    ) or '0'
  )

local limite =
  tonumber(
    ARGV[1]
  )

local ttl =
  tonumber(
    ARGV[2]
  )

if atual >= limite then
  return {
    0,
    atual
  }
end

atual =
  redis.call(
    'INCR',
    KEYS[1]
  )

if atual == 1 then
  redis.call(
    'PEXPIRE',
    KEYS[1],
    ttl
  )
end

return {
  1,
  atual
}
`;

async function consumir({
  namespace,
  identidade,
  limit,
  windowMs
}) {
  const agora =
    Date.now();

  const bucket =
    Math.floor(
      agora /
      windowMs
    );

  const expiresAt =
    (
      bucket + 1
    ) *
    windowMs;

  const hash =
    hashIdentidade(
      identidade
    );

  const chave =
    `${namespace}:` +
    `${hash}:` +
    `${bucket}`;

  const redis =
    await redisInfraClient();

  if (!redis) {
    ultimoBackend =
      redisInfraConfigured()
        ? 'memoria-degradada'
        : 'memoria';

    ultimoNamespace =
      namespace;

    return consumirLocal({
      key:
        chave,

      limit,
      expiresAt
    });
  }

  try {
    const resultado =
      await redis.eval(
        RATE_LIMIT_LUA,
        {
          keys: [
            redisInfraKey(
              'rate-limit',
              chave
            )
          ],

          arguments: [
            String(limit),

            String(
              windowMs * 2
            )
          ]
        }
      );

    const permitido =
      Number(
        resultado?.[0]
      ) === 1;

    const usado =
      Number(
        resultado?.[1] ||
        0
      );

    ultimoBackend =
      'redis';

    ultimoNamespace =
      namespace;

    return {
      permitido,
      usado,
      backend:
        'redis'
    };
  }
  catch {
    /*
     * Se o Redis ficar temporariamente
     * indisponivel, mantemos protecao
     * local em vez de derrubar a rota.
     */
    ultimoBackend =
      'memoria-degradada';

    ultimoNamespace =
      namespace;

    return consumirLocal({
      key:
        chave,

      limit,
      expiresAt
    });
  }
}

export function criarRateLimitDistribuido({
  namespace,
  limit,
  windowMs = 60000
}) {
  const ns =
    String(
      namespace ||
      'default'
    ).trim();

  const limite =
    inteiroPositivo(
      limit,
      30
    );

  const janela =
    Math.max(
      1000,

      inteiroPositivo(
        windowMs,
        60000
      )
    );

  return async function rateLimitDistribuido(
    req,
    res,
    next
  ) {
    try {
      const agora =
        Date.now();

      const resultado =
        await consumir({
          namespace:
            ns,

          identidade:
            identidadeRequest(
              req
            ),

          limit:
            limite,

          windowMs:
            janela
        });

      const restante =
        Math.max(
          0,
          limite -
          resultado.usado
        );

      const retryAfter =
        Math.max(
          1,

          Math.ceil(
            (
              janela -
              (
                agora %
                janela
              )
            ) /
            1000
          )
        );

      res.setHeader(
        'RateLimit-Limit',
        String(limite)
      );

      res.setHeader(
        'RateLimit-Remaining',
        String(restante)
      );

      if (
        !resultado.permitido
      ) {
        res.setHeader(
          'Retry-After',
          String(retryAfter)
        );

        return res
          .status(429)
          .json({
            ok: false,

            erro:
              'Muitas requisicoes. Aguarde alguns segundos e tente novamente.',

            code:
              'BET_RATE_LIMIT',

            retry_after:
              retryAfter
          });
      }

      return next();
    }
    catch {
      /*
       * Rate limit e uma camada
       * complementar. Uma falha interna
       * nao deve derrubar o aplicativo.
       */
      return next();
    }
  };
}

export async function trafficGuardProbe() {
  const resultado =
    await consumir({
      namespace:
        'infra-probe',

      identidade:
        'betanalytics-infra-probe',

      limit:
        1000000,

      windowMs:
        60000
    });

  const redis =
    redisInfraStatus();

  return {
    ok:
      resultado.backend ===
      'redis',

    backend:
      resultado.backend,

    redis_configurado:
      redis.configurado,

    redis_conectado:
      redis.conectado
  };
}

export function trafficGuardStatus() {
  const redis =
    redisInfraStatus();

  return {
    backend:
      ultimoBackend,

    ultimo_namespace:
      ultimoNamespace,

    redis_configurado:
      redis.configurado,

    redis_conectado:
      redis.conectado,

    local_buckets:
      localBuckets.size
  };
}
