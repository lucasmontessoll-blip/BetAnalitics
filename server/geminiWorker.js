import 'dotenv/config';

import {
  configurarFilaGemini,
  fecharFilaGemini,
  geminiQueueStatus,
  inicializarFilaGemini
} from './geminiQueue.js';

import {
  geminiConfigurado,
  processarGeminiJob
} from './geminiProcessor.js';

function falhar(
  mensagem
) {
  console.error(
    `[BetAnalytics Gemini Worker] ${mensagem}`
  );

  process.exitCode =
    1;
}

async function iniciar() {
  if (
    !process.env.REDIS_URL
  ) {
    throw new Error(
      'REDIS_URL nao configurada.'
    );
  }

  if (
    !geminiConfigurado()
  ) {
    throw new Error(
      'GEMINI_API_KEY nao configurada.'
    );
  }

  configurarFilaGemini({
    processar:
      processarGeminiJob,

    role:
      'worker'
  });

  await inicializarFilaGemini();

  const status =
    geminiQueueStatus();

  console.log(
    '[BetAnalytics Gemini Worker] operacional.'
  );

  console.log(
    `[BetAnalytics Gemini Worker] role=${status.role} backend=${status.backend} conexoes=${status.conexoes_redis_ativas}`
  );
}

let encerrando =
  false;

async function encerrar(
  signal
) {
  if (encerrando) {
    return;
  }

  encerrando =
    true;

  console.log(
    `[BetAnalytics Gemini Worker] encerramento: ${signal}`
  );

  try {
    await fecharFilaGemini();

    process.exitCode =
      0;
  }
  catch (error) {
    falhar(
      error?.code ||
      error?.name ||
      'WORKER_SHUTDOWN_ERROR'
    );
  }
}

process.once(
  'SIGTERM',
  () => {
    void encerrar(
      'SIGTERM'
    );
  }
);

process.once(
  'SIGINT',
  () => {
    void encerrar(
      'SIGINT'
    );
  }
);

try {
  await iniciar();
}
catch (error) {
  falhar(
    error?.message ||
    'Falha ao iniciar worker.'
  );
}
