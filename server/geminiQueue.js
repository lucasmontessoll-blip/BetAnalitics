import {
  Queue,
  QueueEvents,
  Worker
} from 'bullmq';

import IORedis
  from 'ioredis';

const QUEUE_NAME =
  'betanalytics-gemini-chat';

const ROLES_VALIDOS =
  new Set([
    'embedded',
    'producer',
    'worker'
  ]);

let processarGemini =
  null;

let queueRole =
  'embedded';

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

function normalizarRole(
  valor
) {
  const role =
    String(
      valor ||
      'embedded'
    )
      .trim()
      .toLowerCase();

  if (
    !ROLES_VALIDOS.has(
      role
    )
  ) {
    const erro =
      new Error(
        'Role da fila Gemini invalida.'
      );

    erro.code =
      'GEMINI_QUEUE_ROLE_INVALID';

    throw erro;
  }

  return role;
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

function usaProducer() {
  return (
    queueRole ===
      'embedded' ||
    queueRole ===
      'producer'
  );
}

function usaWorker() {
  return (
    queueRole ===
      'embedded' ||
    queueRole ===
      'worker'
  );
}

function conexoesPrevistasRole(
  role
) {
  if (
    role ===
    'embedded'
  ) {
    return 3;
  }

  if (
    role ===
    'producer'
  ) {
    return 2;
  }

  if (
    role ===
    'worker'
  ) {
    return 1;
  }

  return 0;
}

function conexaoAtiva(
  conexao
) {
  return Boolean(
    conexao &&
    (
      conexao.status ===
        'ready' ||
      conexao.status ===
        'connecting' ||
      conexao.status ===
        'connect'
    )
  );
}

function conexoesAtivas() {
  return [
    queueConnection,
    eventsConnection,
    workerConnection
  ]
    .filter(
      conexaoAtiva
    )
    .length;
}

function backendRole() {
  if (
    queueRole ===
    'producer'
  ) {
    return 'redis-bullmq-producer';
  }

  if (
    queueRole ===
    'worker'
  ) {
    return 'redis-bullmq-worker';
  }

  return 'redis-bullmq';
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

function recursosProntos() {
  const producerPronto =
    !usaProducer() ||
    (
      Boolean(queue) &&
      Boolean(queueEvents)
    );

  const workerPronto =
    !usaWorker() ||
    Boolean(worker);

  return (
    producerPronto &&
    workerPronto
  );
}

async function inicializarFila() {
  if (
    !redisConfigurado()
  ) {
    if (
      queueRole ===
      'embedded'
    ) {
      return false;
    }

    throw erroFila(
      'Redis obrigatorio para role distribuido da fila Gemini.',
      'GEMINI_QUEUE_REDIS_REQUIRED'
    );
  }

  if (
    recursosProntos()
  ) {
    return true;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise =
    (async () => {
      try {
        if (
          usaProducer()
        ) {
          if (
            !queueConnection
          ) {
            queueConnection =
              criarConexao();
          }

          if (
            !eventsConnection
          ) {
            eventsConnection =
              criarConexao();
          }

          await Promise.all([
            conectar(
              queueConnection
            ),

            conectar(
              eventsConnection
            )
          ]);

          if (!queue) {
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
          }

          if (!queueEvents) {
            queueEvents =
              new QueueEvents(
                QUEUE_NAME,
                {
                  connection:
                    eventsConnection
                }
              );
          }
        }

        if (
          usaWorker()
        ) {
          if (
            typeof processarGemini !==
            'function'
          ) {
            throw new Error(
              'Processador Gemini nao configurado para worker.'
            );
          }

          if (
            !workerConnection
          ) {
            workerConnection =
              criarConexao();
          }

          await conectar(
            workerConnection
          );

          if (!worker) {
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
          }
        }

        const aguardas =
          [];

        if (queue) {
          aguardas.push(
            queue.waitUntilReady()
          );
        }

        if (queueEvents) {
          aguardas.push(
            queueEvents
              .waitUntilReady()
          );
        }

        if (worker) {
          aguardas.push(
            worker.waitUntilReady()
          );
        }

        await Promise.all(
          aguardas
        );

        ultimoBackend =
          backendRole();

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
  processar,
  role =
    process.env
      .GEMINI_QUEUE_ROLE ||
    'embedded'
} = {}) {
  const novoRole =
    normalizarRole(
      role
    );

  if (
    (
      queue ||
      queueEvents ||
      worker
    ) &&
    novoRole !==
      queueRole
  ) {
    const erro =
      new Error(
        'Nao e permitido trocar role da fila depois da inicializacao.'
      );

    erro.code =
      'GEMINI_QUEUE_ROLE_ALREADY_ACTIVE';

    throw erro;
  }

  if (
    typeof processar ===
    'function'
  ) {
    processarGemini =
      processar;
  }

  if (
    (
      novoRole ===
        'embedded' ||
      novoRole ===
        'worker'
    ) &&
    typeof processarGemini !==
      'function'
  ) {
    throw new Error(
      'Fila Gemini: processador invalido.'
    );
  }

  queueRole =
    novoRole;

  return geminiQueueStatus();
}

export async function inicializarFilaGemini() {
  await inicializarFila();

  return geminiQueueStatus();
}

export async function executarGeminiEnfileirado(
  payload = {}
) {
  if (
    queueRole ===
    'worker'
  ) {
    throw erroFila(
      'Processo worker nao aceita submissao HTTP.',
      'GEMINI_QUEUE_WORKER_ONLY'
    );
  }

  /*
   * Compatibilidade local:
   * embedded sem Redis continua direto.
   */
  if (
    !redisConfigurado()
  ) {
    if (
      queueRole !==
      'embedded'
    ) {
      throw erroFila(
        'Redis obrigatorio para producer Gemini.',
        'GEMINI_QUEUE_REDIS_REQUIRED'
      );
    }

    if (
      typeof processarGemini !==
      'function'
    ) {
      throw new Error(
        'Fila Gemini nao configurada.'
      );
    }

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
      'Producer da fila Gemini nao inicializado.'
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
      backendRole();

    ultimoErro =
      null;

    return {
      backend:
        ultimoBackend,

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
  if (
    !redisConfigurado()
  ) {
    return {
      ok: false,

      backend:
        queueRole ===
          'embedded'
          ? 'direto-local'
          : 'redis-ausente',

      redis_configurado:
        false,

      role:
        queueRole,

      fila_pronta:
        false,

      worker_pronto:
        false
    };
  }

  await inicializarFila();

  /*
   * Worker-only nao possui Queue para
   * publicar um job de probe.
   */
  if (
    queueRole ===
    'worker'
  ) {
    const ok =
      Boolean(worker);

    return {
      ok,

      backend:
        backendRole(),

      redis_configurado:
        true,

      role:
        queueRole,

      fila_pronta:
        false,

      worker_pronto:
        Boolean(worker)
    };
  }

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
      ? backendRole()
      : 'redis-indisponivel';

  return {
    ok,

    backend:
      ultimoBackend,

    redis_configurado:
      true,

    role:
      queueRole,

    fila_pronta:
      Boolean(queue),

    worker_pronto:
      queueRole ===
        'embedded'
        ? Boolean(worker)
        : null
  };
}

export function geminiQueueConnectionBudget({
  webInstances = 1,
  workerInstances = 1,
  architecture =
    'separated'
} = {}) {
  const webs =
    Math.max(
      0,
      inteiroPositivo(
        webInstances,
        1
      )
    );

  const workers =
    Math.max(
      0,
      inteiroPositivo(
        workerInstances,
        1
      )
    );

  const modo =
    String(
      architecture ||
      'separated'
    )
      .trim()
      .toLowerCase();

  if (
    modo ===
    'embedded'
  ) {
    const bullmqWeb =
      webs * 3;

    const sharedRedisWeb =
      webs;

    return {
      architecture:
        'embedded',

      web_instances:
        webs,

      worker_instances:
        0,

      bullmq_web:
        bullmqWeb,

      bullmq_worker:
        0,

      redis_shared_web_estimado:
        sharedRedisWeb,

      total_estimado:
        bullmqWeb +
        sharedRedisWeb
    };
  }

  const bullmqWeb =
    webs * 2;

  const bullmqWorker =
    workers;

  const sharedRedisWeb =
    webs;

  return {
    architecture:
      'separated',

    web_instances:
      webs,

    worker_instances:
      workers,

    bullmq_web:
      bullmqWeb,

    bullmq_worker:
      bullmqWorker,

    redis_shared_web_estimado:
      sharedRedisWeb,

    total_estimado:
      bullmqWeb +
      bullmqWorker +
      sharedRedisWeb
  };
}

export function geminiQueueStatus() {
  return {
    backend:
      ultimoBackend,

    role:
      queueRole,

    redis_configurado:
      redisConfigurado(),

    fila_pronta:
      Boolean(queue),

    events_pronto:
      Boolean(queueEvents),

    worker_pronto:
      Boolean(worker),

    producer_habilitado:
      usaProducer(),

    worker_habilitado:
      usaWorker(),

    conexoes_redis_previstas:
      conexoesPrevistasRole(
        queueRole
      ),

    conexoes_redis_ativas:
      conexoesAtivas(),

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

  initPromise =
    null;
}
