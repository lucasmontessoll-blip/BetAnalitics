import { createClient } from 'redis';

const memoria = new Map();

let redisClient = null;
let redisConnectPromise = null;
let redisRetryDepois = 0;
let redisUltimoErro = '';

function inteiroPositivo(valor, fallback) {
  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero <= 0) {
    return fallback;
  }

  return Math.floor(numero);
}

function redisUrl() {
  return String(
    process.env.REDIS_URL || ''
  ).trim();
}

function redisPrefixo() {
  return String(
    process.env.REDIS_PREFIX ||
    'betanalytics'
  )
    .trim()
    .replace(/:+$/g, '') ||
    'betanalytics';
}

function memoriaMaximo() {
  return inteiroPositivo(
    process.env.CACHE_FALLBACK_MAX,
    2000
  );
}

function normalizarTtl(ttlMs) {
  const ttl =
    inteiroPositivo(
      ttlMs,
      60000
    );

  return Math.min(
    ttl,
    24 * 60 * 60 * 1000
  );
}

function chaveCompleta(chave) {
  const limpa =
    String(chave || '').trim();

  if (!limpa) {
    throw new Error(
      'Cache: chave vazia.'
    );
  }

  return `${redisPrefixo()}:${limpa}`;
}

function codigoErro(erro) {
  return String(
    erro?.code ||
    erro?.name ||
    'REDIS_ERROR'
  ).slice(0, 80);
}

function memoriaLimparExpirados() {
  const agora = Date.now();

  for (
    const [chave, item]
    of memoria.entries()
  ) {
    if (
      !item ||
      item.expiraEm <= agora
    ) {
      memoria.delete(chave);
    }
  }
}

function memoriaGet(chave) {
  const item =
    memoria.get(chave);

  if (!item) {
    return null;
  }

  if (
    item.expiraEm <= Date.now()
  ) {
    memoria.delete(chave);
    return null;
  }

  return item.valor;
}

function memoriaSet(
  chave,
  valor,
  ttlMs
) {
  memoria.delete(chave);

  memoria.set(
    chave,
    {
      valor,
      expiraEm:
        Date.now() + ttlMs
    }
  );

  while (
    memoria.size >
    memoriaMaximo()
  ) {
    const maisAntiga =
      memoria
        .keys()
        .next()
        .value;

    if (!maisAntiga) {
      break;
    }

    memoria.delete(
      maisAntiga
    );
  }
}

async function obterRedis() {
  const url =
    redisUrl();

  if (!url) {
    return null;
  }

  if (
    redisClient?.isReady
  ) {
    return redisClient;
  }

  if (
    Date.now() <
    redisRetryDepois
  ) {
    return null;
  }

  if (!redisClient) {
    redisClient =
      createClient({
        url,
        socket: {
          connectTimeout: 3000,
          reconnectStrategy: false
        }
      });

    redisClient.on(
      'error',
      (erro) => {
        redisUltimoErro =
          codigoErro(erro);
      }
    );
  }

  if (!redisConnectPromise) {
    redisConnectPromise =
      redisClient
        .connect()
        .then(() => {
          redisUltimoErro = '';
          redisRetryDepois = 0;

          return redisClient;
        })
        .catch((erro) => {
          redisUltimoErro =
            codigoErro(erro);

          redisRetryDepois =
            Date.now() + 30000;

          try {
            redisClient?.destroy?.();
          }
          catch {
          }

          redisClient = null;

          return null;
        })
        .finally(() => {
          redisConnectPromise = null;
        });
  }

  return redisConnectPromise;
}

export async function cacheCompartilhadoGet(
  chave
) {
  const completa =
    chaveCompleta(chave);

  const client =
    await obterRedis();

  if (
    client?.isReady
  ) {
    try {
      const bruto =
        await client.get(
          completa
        );

      if (bruto === null) {
        return null;
      }

      return JSON.parse(bruto);
    }
    catch (erro) {
      redisUltimoErro =
        codigoErro(erro);
    }
  }

  return memoriaGet(
    completa
  );
}

export async function cacheCompartilhadoSet(
  chave,
  valor,
  ttlMs = 60000
) {
  if (
    valor === undefined
  ) {
    throw new Error(
      'Cache: valor undefined.'
    );
  }

  const completa =
    chaveCompleta(chave);

  const ttl =
    normalizarTtl(ttlMs);

  /*
   * Mantemos uma cópia local para permitir
   * fallback caso o Redis fique indisponível.
   */
  memoriaSet(
    completa,
    valor,
    ttl
  );

  const client =
    await obterRedis();

  if (
    client?.isReady
  ) {
    try {
      await client.set(
        completa,
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
    catch (erro) {
      redisUltimoErro =
        codigoErro(erro);
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
  const completa =
    chaveCompleta(chave);

  memoria.delete(
    completa
  );

  const client =
    await obterRedis();

  if (
    client?.isReady
  ) {
    try {
      await client.del(
        completa
      );
    }
    catch (erro) {
      redisUltimoErro =
        codigoErro(erro);
    }
  }

  return true;
}

export function cacheCompartilhadoStatus() {
  memoriaLimparExpirados();

  return {
    redis_configurado:
      Boolean(redisUrl()),

    redis_conectado:
      Boolean(
        redisClient?.isReady
      ),

    fallback_memoria:
      true,

    memoria_entries:
      memoria.size,

    memoria_max:
      memoriaMaximo(),

    retry_em_cooldown:
      Date.now() <
      redisRetryDepois,

    ultimo_erro_codigo:
      redisUltimoErro || null
  };
}

export async function cacheCompartilhadoFechar() {
  if (!redisClient) {
    return;
  }

  try {
    if (
      redisClient.isOpen
    ) {
      await redisClient.quit();
    }
  }
  catch {
    try {
      redisClient?.destroy?.();
    }
    catch {
    }
  }
  finally {
    redisClient = null;
    redisConnectPromise = null;
  }
}
