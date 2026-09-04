import { randomUUID } from 'crypto';

import {
  redisInfraClient,
  redisInfraConfigured,
  redisInfraKey,
  redisInfraStatus
} from './redisInfra.js';

const localInflight = new Map();
const localMinute = new Map();
const localDaily = new Map();

let ultimoLockBackend = 'memoria';
let ultimaQuotaBackend = 'memoria';
let ultimaQuotaMinuteUsed = 0;
let ultimaQuotaDailyUsed = 0;

function inteiroPositivo(
  valor,
  fallback
) {
  const numero = Number(valor);

  if (
    !Number.isFinite(numero) ||
    numero <= 0
  ) {
    return fallback;
  }

  return Math.floor(numero);
}

function sleep(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}

function erroQuota(motivo) {
  const erro =
    new Error(
      motivo === 'daily'
        ? 'Orcamento diario da API-Football atingido.'
        : 'Limite temporario da API-Football atingido.'
    );

  erro.status = 429;

  erro.code =
    motivo === 'daily'
      ? 'API_FOOTBALL_DAILY_BUDGET'
      : 'API_FOOTBALL_RATE_LIMIT';

  return erro;
}

function erroRedisCoordenacao(tipo) {
  const erro =
    new Error(
      'Coordenacao distribuida temporariamente indisponivel.'
    );

  erro.status = 503;

  erro.code =
    tipo === 'quota'
      ? 'DISTRIBUTED_QUOTA_UNAVAILABLE'
      : 'DISTRIBUTED_LOCK_UNAVAILABLE';

  return erro;
}

function limparContadoresLocais() {
  const minutoAtual =
    Math.floor(
      Date.now() / 60000
    );

  for (
    const key
    of localMinute.keys()
  ) {
    const partes =
      key.split(':');

    const bucket =
      Number(
        partes[
          partes.length - 1
        ]
      );

    if (
      Number.isFinite(bucket) &&
      bucket < minutoAtual - 2
    ) {
      localMinute.delete(key);
    }
  }

  const hoje =
    new Date()
      .toISOString()
      .slice(0, 10);

  for (
    const key
    of localDaily.keys()
  ) {
    if (
      !key.endsWith(
        `:${hoje}`
      )
    ) {
      localDaily.delete(key);
    }
  }
}

function consumirQuotaLocal({
  namespace,
  minuteLimit,
  dailyLimit
}) {
  limparContadoresLocais();

  const agora = Date.now();

  const minuteBucket =
    Math.floor(
      agora / 60000
    );

  const day =
    new Date(agora)
      .toISOString()
      .slice(0, 10);

  const minuteKey =
    `${namespace}:${minuteBucket}`;

  const dailyKey =
    `${namespace}:${day}`;

  const minuteUsed =
    localMinute.get(minuteKey) || 0;

  const dailyUsed =
    localDaily.get(dailyKey) || 0;

  if (
    minuteUsed >= minuteLimit
  ) {
    throw erroQuota('minute');
  }

  if (
    dailyUsed >= dailyLimit
  ) {
    throw erroQuota('daily');
  }

  const novoMinute =
    minuteUsed + 1;

  const novoDaily =
    dailyUsed + 1;

  localMinute.set(
    minuteKey,
    novoMinute
  );

  localDaily.set(
    dailyKey,
    novoDaily
  );

  ultimaQuotaBackend =
    'memoria';

  ultimaQuotaMinuteUsed =
    novoMinute;

  ultimaQuotaDailyUsed =
    novoDaily;

  return {
    backend: 'memoria',
    minute_used: novoMinute,
    daily_used: novoDaily
  };
}

const QUOTA_LUA = `
local minute = tonumber(redis.call('GET', KEYS[1]) or '0')
local daily = tonumber(redis.call('GET', KEYS[2]) or '0')
local minuteLimit = tonumber(ARGV[1])
local dailyLimit = tonumber(ARGV[2])
local minuteTtl = tonumber(ARGV[3])
local dailyTtl = tonumber(ARGV[4])

if minute >= minuteLimit then
  return {0, minute, daily, 1}
end

if daily >= dailyLimit then
  return {0, minute, daily, 2}
end

minute = redis.call('INCR', KEYS[1])

if minute == 1 then
  redis.call(
    'PEXPIRE',
    KEYS[1],
    minuteTtl
  )
end

daily = redis.call('INCR', KEYS[2])

if daily == 1 then
  redis.call(
    'PEXPIRE',
    KEYS[2],
    dailyTtl
  )
end

return {1, minute, daily, 0}
`;

export async function consumirQuotaDistribuida({
  namespace = 'default',
  minuteLimit,
  dailyLimit
}) {
  const minuto =
    inteiroPositivo(
      minuteLimit,
      10
    );

  const diario =
    inteiroPositivo(
      dailyLimit,
      90
    );

  const redis =
    await redisInfraClient();

  if (!redis) {
    if (redisInfraConfigured()) {
      ultimaQuotaBackend =
        'redis-indisponivel';

      throw erroRedisCoordenacao(
        'quota'
      );
    }

    return consumirQuotaLocal({
      namespace,
      minuteLimit: minuto,
      dailyLimit: diario
    });
  }

  const agora = Date.now();

  const minuteBucket =
    Math.floor(
      agora / 60000
    );

  const day =
    new Date(agora)
      .toISOString()
      .slice(0, 10);

  const minuteKey =
    redisInfraKey(
      'quota-minute',
      `${namespace}:${minuteBucket}`
    );

  const dailyKey =
    redisInfraKey(
      'quota-day',
      `${namespace}:${day}`
    );

  try {
    const resultado =
      await redis.eval(
        QUOTA_LUA,
        {
          keys: [
            minuteKey,
            dailyKey
          ],

          arguments: [
            String(minuto),
            String(diario),
            '120000',
            String(
              48 * 60 * 60 * 1000
            )
          ]
        }
      );

    const permitido =
      Number(resultado?.[0]) === 1;

    const minuteUsed =
      Number(resultado?.[1] || 0);

    const dailyUsed =
      Number(resultado?.[2] || 0);

    const motivo =
      Number(resultado?.[3] || 0);

    ultimaQuotaBackend =
      'redis';

    ultimaQuotaMinuteUsed =
      minuteUsed;

    ultimaQuotaDailyUsed =
      dailyUsed;

    if (!permitido) {
      throw erroQuota(
        motivo === 2
          ? 'daily'
          : 'minute'
      );
    }

    return {
      backend: 'redis',
      minute_used: minuteUsed,
      daily_used: dailyUsed
    };
  }
  catch (error) {
    if (
      error?.code ===
        'API_FOOTBALL_RATE_LIMIT' ||
      error?.code ===
        'API_FOOTBALL_DAILY_BUDGET'
    ) {
      throw error;
    }

    ultimaQuotaBackend =
      'redis-indisponivel';

    throw erroRedisCoordenacao(
      'quota'
    );
  }
}

const RELEASE_LOCK_LUA = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end

return 0
`;

async function tentarLockRedis(
  redis,
  key,
  ttlMs
) {
  const token =
    randomUUID();

  const lockKey =
    redisInfraKey(
      'lock',
      key
    );

  const resultado =
    await redis.set(
      lockKey,
      token,
      {
        NX: true,
        PX: ttlMs
      }
    );

  if (resultado !== 'OK') {
    return {
      adquirido: false
    };
  }

  return {
    adquirido: true,

    liberar:
      async () => {
        try {
          await redis.eval(
            RELEASE_LOCK_LUA,
            {
              keys: [lockKey],
              arguments: [token]
            }
          );
        }
        catch {
        }
      }
  };
}

export async function executarSingleFlightDistribuido({
  key,
  task,
  readResult,
  lockTtlMs = 30000,
  waitTimeoutMs = 15000,
  pollMs = 100
}) {
  const cleanKey =
    String(key || '').trim();

  if (!cleanKey) {
    return task();
  }

  const localAtual =
    localInflight.get(cleanKey);

  if (localAtual) {
    return localAtual;
  }

  const promessa =
    (async () => {
      const redis =
        await redisInfraClient();

      if (!redis) {
        if (redisInfraConfigured()) {
          ultimoLockBackend =
            'redis-indisponivel';

          throw erroRedisCoordenacao(
            'lock'
          );
        }

        ultimoLockBackend =
          'memoria';

        return task();
      }

      ultimoLockBackend =
        'redis';

      let lock;

      try {
        lock =
          await tentarLockRedis(
            redis,
            cleanKey,
            inteiroPositivo(
              lockTtlMs,
              30000
            )
          );
      }
      catch {
        ultimoLockBackend =
          'redis-indisponivel';

        throw erroRedisCoordenacao(
          'lock'
        );
      }

      if (lock.adquirido) {
        try {
          return await task();
        }
        finally {
          await lock.liberar();
        }
      }

      const limite =
        Date.now() +
        inteiroPositivo(
          waitTimeoutMs,
          15000
        );

      const intervalo =
        Math.max(
          50,
          inteiroPositivo(
            pollMs,
            100
          )
        );

      while (
        Date.now() < limite
      ) {
        if (readResult) {
          const resultado =
            await readResult();

          if (resultado?.found) {
            return resultado.value;
          }
        }

        await sleep(intervalo);
      }

      let segundaTentativa;

      try {
        segundaTentativa =
          await tentarLockRedis(
            redis,
            cleanKey,
            inteiroPositivo(
              lockTtlMs,
              30000
            )
          );
      }
      catch {
        ultimoLockBackend =
          'redis-indisponivel';

        throw erroRedisCoordenacao(
          'lock'
        );
      }

      if (
        segundaTentativa.adquirido
      ) {
        try {
          return await task();
        }
        finally {
          await segundaTentativa
            .liberar();
        }
      }

      const erro =
        new Error(
          'Operacao concorrente ainda em processamento.'
        );

      erro.status = 503;
      erro.code =
        'DISTRIBUTED_LOCK_BUSY';

      throw erro;
    })();

  localInflight.set(
    cleanKey,
    promessa
  );

  try {
    return await promessa;
  }
  finally {
    if (
      localInflight.get(cleanKey) ===
      promessa
    ) {
      localInflight.delete(
        cleanKey
      );
    }
  }
}

export function coordenacaoDistribuidaStatus() {
  const redis =
    redisInfraStatus();

  return {
    redis_configurado:
      redis.configurado,

    redis_conectado:
      redis.conectado,

    lock_backend:
      ultimoLockBackend,

    quota_backend:
      ultimaQuotaBackend,

    quota_minute_used:
      ultimaQuotaMinuteUsed,

    quota_daily_used:
      ultimaQuotaDailyUsed,

    local_inflight:
      localInflight.size
  };
}
