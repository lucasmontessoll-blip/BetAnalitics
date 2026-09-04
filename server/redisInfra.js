import { createClient } from 'redis';

let client = null;
let connectPromise = null;
let retryAfter = 0;
let lastErrorCode = '';

function texto(valor) {
  return String(valor || '').trim();
}

function redisUrl() {
  return texto(process.env.REDIS_URL);
}

function redisPrefix() {
  return (
    texto(process.env.REDIS_PREFIX) ||
    'betanalytics'
  );
}

function errorCode(error) {
  return String(
    error?.code ||
    error?.name ||
    'REDIS_ERROR'
  ).slice(0, 80);
}

export function redisInfraConfigured() {
  return Boolean(redisUrl());
}

export function redisInfraKey(scope, key) {
  const cleanScope =
    texto(scope) || 'app';

  const cleanKey =
    texto(key);

  return (
    `${redisPrefix()}:` +
    `${cleanScope}:` +
    cleanKey
  );
}

export async function redisInfraClient() {
  const url = redisUrl();

  if (!url) {
    return null;
  }

  if (
    client &&
    client.isReady
  ) {
    return client;
  }

  if (Date.now() < retryAfter) {
    return null;
  }

  if (!client) {
    client = createClient({
      url,

      socket: {
        connectTimeout: 3000,
        reconnectStrategy: false
      }
    });

    client.on(
      'error',
      (error) => {
        lastErrorCode =
          errorCode(error);
      }
    );
  }

  if (!connectPromise) {
    connectPromise =
      (async () => {
        try {
          if (!client.isOpen) {
            await client.connect();
          }

          if (client.isReady) {
            lastErrorCode = '';
            return client;
          }

          return null;
        }
        catch (error) {
          lastErrorCode =
            errorCode(error);

          retryAfter =
            Date.now() + 30000;

          const atual = client;
          client = null;

          try {
            if (atual?.isOpen) {
              atual.destroy();
            }
          }
          catch {
          }

          return null;
        }
        finally {
          connectPromise = null;
        }
      })();
  }

  return connectPromise;
}

export function redisInfraStatus() {
  return {
    configurado:
      redisInfraConfigured(),

    conectado:
      Boolean(
        client &&
        client.isReady
      ),

    cooldown:
      Date.now() < retryAfter,

    ultimo_erro_codigo:
      lastErrorCode || ''
  };
}

export async function redisInfraClose() {
  const atual = client;

  client = null;
  connectPromise = null;
  retryAfter = 0;
  lastErrorCode = '';

  if (!atual) {
    return;
  }

  try {
    if (atual.isOpen) {
      await atual.quit();
    }
  }
  catch {
    try {
      atual.destroy();
    }
    catch {
    }
  }
}
