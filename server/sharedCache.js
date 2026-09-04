import {
  redisInfraClient,
  redisInfraConfigured,
  redisInfraKey,
  redisInfraStatus,
  redisInfraClose
} from './redisInfra.js';

const memoria = new Map();

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

function memoriaMaximo() {
  return inteiroPositivo(
    process.env.CACHE_FALLBACK_MAX,
    2000
  );
}

function normalizarTtl(ttlMs) {
  return Math.min(
    inteiroPositivo(
      ttlMs,
      60000
    ),
    24 * 60 * 60 * 1000
  );
}

function limparMemoriaExpirada() {
  const agora = Date.now();

  for (
    const [key, item]
    of memoria.entries()
  ) {
    if (
      !item ||
      item.expiresAt <= agora
    ) {
      memoria.delete(key);
    }
  }
}

function limitarMemoria() {
  const maximo =
    memoriaMaximo();

  while (
    memoria.size > maximo
  ) {
    const primeira =
      memoria.keys().next().value;

    if (!primeira) {
      break;
    }

    memoria.delete(primeira);
  }
}

function memoriaGet(key) {
  limparMemoriaExpirada();

  const item =
    memoria.get(key);

  if (!item) {
    return null;
  }

  if (
    item.expiresAt <= Date.now()
  ) {
    memoria.delete(key);
    return null;
  }

  return item.valor;
}

function memoriaSet(
  key,
  valor,
  ttl
) {
  memoria.set(
    key,
    {
      valor,
      expiresAt:
        Date.now() + ttl
    }
  );

  limitarMemoria();
}

function redisCacheKey(key) {
  return redisInfraKey(
    'cache',
    key
  );
}

export async function cacheCompartilhadoGet(
  chave
) {
  const key =
    String(chave || '').trim();

  if (!key) {
    return null;
  }

  const redis =
    await redisInfraClient();

  if (redis) {
    try {
      const raw =
        await redis.get(
          redisCacheKey(key)
        );

      /*
       * Redis respondeu normalmente
       * e nao possui essa chave.
       * Nao usa copia local potencialmente
       * antiga nesse caso.
       */
      if (raw === null) {
        return null;
      }

      return JSON.parse(raw);
    }
    catch {
      /*
       * Redis falhou de verdade:
       * memoria local vira fallback.
       */
    }
  }

  return memoriaGet(key);
}

export async function cacheCompartilhadoSet(
  chave,
  valor,
  ttlMs = 60000
) {
  const key =
    String(chave || '').trim();

  if (!key) {
    return {
      ok: false,
      backend: 'nenhum'
    };
  }

  const ttl =
    normalizarTtl(ttlMs);

  memoriaSet(
    key,
    valor,
    ttl
  );

  const redis =
    await redisInfraClient();

  if (redis) {
    try {
      await redis.set(
        redisCacheKey(key),
        JSON.stringify(valor),
        {
          PX: ttl
        }
      );

      return {
        ok: true,
        backend: 'redis'
      };
    }
    catch {
    }
  }

  return {
    ok: true,
    backend: 'memoria'
  };
}

export async function cacheCompartilhadoDelete(
  chave
) {
  const key =
    String(chave || '').trim();

  if (!key) {
    return false;
  }

  memoria.delete(key);

  const redis =
    await redisInfraClient();

  if (redis) {
    try {
      await redis.del(
        redisCacheKey(key)
      );
    }
    catch {
    }
  }

  return true;
}

export function cacheCompartilhadoStatus() {
  limparMemoriaExpirada();

  const redis =
    redisInfraStatus();

  return {
    redis_configurado:
      redisInfraConfigured(),

    redis_conectado:
      redis.conectado,

    redis_cooldown:
      redis.cooldown,

    ultimo_erro_codigo:
      redis.ultimo_erro_codigo,

    memoria_entries:
      memoria.size,

    fallback_memoria:
      true
  };
}

export async function cacheCompartilhadoFechar() {
  memoria.clear();

  await redisInfraClose();
}
