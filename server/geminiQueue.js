import {
  Queue,
  QueueEvents,
  Worker
} from 'bullmq';

import IORedis
  from 'ioredis';

const QUEUE_NAME =
  'betanalytics-gemini-chat';

let processarGemini =
  null;

let queue =
  null;

let queueEvents =
  null;

let worker =
  null;

let queueConnection =
  null;

let eventsConnection =
  null;

let workerConnection =
  null;

let initPromise =
  null;

let ultimoBackend =
  'direto-local';

let ultimoErro =
  null;

function env(nome) {
  return String(
    process.env[nome] ||
    ''
  ).trim();
}

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

function redisUrl() {
  return env(
    'REDIS_URL'
  );
}

function redisConfigurado() {
  return Boolean(
    redisUrl()
  );
}

function erroFila(
  mensagem,
  code =
    'GEMINI_QUEUE_UNAVAILABLE'
) {
  const erro =
    new Error(mensagem);

  erro.status = 503;
  erro.code = code;

  return erro;
}

function criarConexao() {
  const url =
    redisUrl();

  if (!url) {
    return null;
  }

  return new IORedis(
    url,
    {
      maxRetriesPerRequest:
        null,

      enableReadyCheck:
        true,

      lazyConnect:
        true,

      connectTimeout:
        3000,

      retryStrategy() {
        return null;
      }
    }
  );
}

async function conectar(
  conexao
) {
  if (!conexao) {
    return;
  }

  if (
    conexao.status ===
    'wait'
  ) {
    await conexao.connect();
  }
}

async function inicializarFila() {
  if (!redisConfigurado()) {
    return false;
  }

  if (
    queue &&
    queueEvents &&
    worker
  ) {
    return true;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise =
    (async () => {
      try {
        queueConnection =
          criarConexao();

        eventsConnection =
          criarConexao();

        workerConnection =
          criarConexao();

        await Promise.all([
          conectar(
            queueConnection
          ),

          conectar(
            eventsConnection
          ),

          conectar(
            workerConnection
          )
        ]);

        queue =
          new Queue(
            QUEUE_NAME,
            {
              connection:
                queueConnection,

              defaultJobOptions: {
                removeOnComplete: {
                  age: 300,
                  count: 100
                },

                removeOnFail: {
                  age: 900,
                  count: 200
                }
              }
            }
          );

        queueEvents =
          new QueueEvents(
            QUEUE_NAME,
            {
              connection:
                eventsConnection
            }
          );

        worker =
          new Worker(
            QUEUE_NAME,

            async (job) => {
              if (
                job.name ===
                'probe'
              ) {
                return {
                  ok: true,
                  tipo:
                    'probe'
                };
              }

              if (
                job.name !==
                'chat'
              ) {
                throw new Error(
                  'Tipo de job Gemini invalido.'
                );
              }

              if (
                typeof processarGemini !==
                'function'
              ) {
                throw new Error(
                  'Processador Gemini nao configurado.'
                );
              }

              return processarGemini(
                job.data || {}
              );
            },

            {
              connection:
                workerConnection,

              concurrency:
                inteiroPositivo(
                  process.env
                    .GEMINI_QUEUE_CONCURRENCY,
                  3
                ),

              limiter: {
                max:
                  inteiroPositivo(
                    process.env
                      .GEMINI_QUEUE_RATE_MAX,
                    10
                  ),

                duration:
                  1000
              }
            }
          );

        worker.on(
          'error',
          (error) => {
            ultimoErro =
              String(
                error?.code ||
                error?.name ||
                'WORKER_ERROR'
              );
          }
        );

        await Promise.all([
          queue.waitUntilReady(),
          queueEvents
            .waitUntilReady(),
          worker.waitUntilReady()
        ]);

        ultimoBackend =
          'redis-bullmq';

        ultimoErro =
          null;

        return true;
      }
      catch (error) {
        ultimoBackend =
          'redis-indisponivel';

        ultimoErro =
          String(
            error?.code ||
            error?.name ||
            'QUEUE_INIT_ERROR'
          );

        throw erroFila(
          'Fila da IA temporariamente indisponivel.'
        );
      }
      finally {
        initPromise =
          null;
      }
    })();

  return initPromise;
}

export function configurarFilaGemini({
  processar
} = {}) {
  if (
    typeof processar !==
    'function'
  ) {
    throw new Error(
      'Fila Gemini: processador invalido.'
    );
  }

  processarGemini =
    processar;
}

export async function executarGeminiEnfileirado(
  payload = {}
) {
  if (
    typeof processarGemini !==
    'function'
  ) {
    throw new Error(
      'Fila Gemini nao configurada.'
    );
  }

  /*
   * Desenvolvimento/local:
   * sem REDIS_URL, preserva funcionamento
   * direto para nao exigir Redis local.
   */
  if (!redisConfigurado()) {
    ultimoBackend =
      'direto-local';

    const resultado =
      await processarGemini(
        payload
      );

    return {
      backend:
        'direto-local',

      ...resultado
    };
  }

  await inicializarFila();

  if (
    !queue ||
    !queueEvents
  ) {
    throw erroFila(
      'Fila da IA nao inicializada.'
    );
  }

  const job =
    await queue.add(
      'chat',
      payload,
      {
        attempts: 1
      }
    );

  const esperaMs =
    inteiroPositivo(
      process.env
        .GEMINI_QUEUE_WAIT_MS,
      55000
    );

  try {
    const resultado =
      await job.waitUntilFinished(
        queueEvents,
        esperaMs
      );

    ultimoBackend =
      'redis-bullmq';

    ultimoErro =
      null;

    return {
      backend:
        'redis-bullmq',

      ...(resultado || {})
    };
  }
  catch (error) {
    ultimoErro =
      String(
        error?.code ||
        error?.name ||
        'QUEUE_JOB_ERROR'
      );

    throw erroFila(
      'A fila da IA esta ocupada. Tente novamente em instantes.',
      'GEMINI_QUEUE_BUSY'
    );
  }
}

export async function probeFilaGemini() {
  if (!redisConfigurado()) {
    return {
      ok: false,
      backend:
        'direto-local',
      redis_configurado:
        false,
      fila_pronta:
        false,
      worker_pronto:
        false
    };
  }

  await inicializarFila();

  const job =
    await queue.add(
      'probe',
      {
        criado_em:
          Date.now()
      },
      {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: true
      }
    );

  const resultado =
    await job.waitUntilFinished(
      queueEvents,
      10000
    );

  const ok =
    resultado?.ok ===
      true;

  ultimoBackend =
    ok
      ? 'redis-bullmq'
      : 'redis-indisponivel';

  return {
    ok,

    backend:
      ultimoBackend,

    redis_configurado:
      true,

    fila_pronta:
      Boolean(queue),

    worker_pronto:
      Boolean(worker)
  };
}

export function geminiQueueStatus() {
  return {
    backend:
      ultimoBackend,

    redis_configurado:
      redisConfigurado(),

    fila_pronta:
      Boolean(queue),

    worker_pronto:
      Boolean(worker),

    concorrencia:
      inteiroPositivo(
        process.env
          .GEMINI_QUEUE_CONCURRENCY,
        3
      ),

    rate_max_por_segundo:
      inteiroPositivo(
        process.env
          .GEMINI_QUEUE_RATE_MAX,
        10
      ),

    ultimo_erro:
      ultimoErro
  };
}

export async function fecharFilaGemini() {
  const recursos = [
    worker,
    queueEvents,
    queue
  ];

  for (
    const recurso
    of recursos
  ) {
    try {
      await recurso?.close();
    }
    catch {
    }
  }

  const conexoes = [
    workerConnection,
    eventsConnection,
    queueConnection
  ];

  for (
    const conexao
    of conexoes
  ) {
    try {
      conexao?.disconnect();
    }
    catch {
    }
  }

  worker =
    null;

  queueEvents =
    null;

  queue =
    null;

  workerConnection =
    null;

  eventsConnection =
    null;

  queueConnection =
    null;
}
