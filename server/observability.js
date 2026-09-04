import {
  randomUUID
} from 'crypto';

import {
  monitorEventLoopDelay,
  performance
} from 'perf_hooks';

const INICIADO_EM =
  Date.now();

const LATENCIAS_MAX =
  2000;

const ROTAS_MAX =
  120;

const eventLoopDelay =
  monitorEventLoopDelay({
    resolution: 20
  });

eventLoopDelay.enable();

const latenciasRecentes =
  [];

const rotas =
  new Map();

const metricas = {
  requests_total: 0,

  requests_inflight: 0,

  responses_2xx: 0,
  responses_3xx: 0,
  responses_4xx: 0,
  responses_5xx: 0,

  requests_lentas: 0
};

function numero(
  valor,
  fallback = 0
) {
  const n =
    Number(valor);

  return Number.isFinite(n)
    ? n
    : fallback;
}

function arredondar(
  valor,
  casas = 2
) {
  const fator =
    10 ** casas;

  return Math.round(
    numero(valor) *
    fator
  ) / fator;
}

function emMb(
  bytes
) {
  return arredondar(
    numero(bytes) /
    1024 /
    1024
  );
}

function normalizarCaminho(
  req
) {
  let caminho =
    String(
      req?.path ||
      req?.originalUrl ||
      req?.url ||
      '/'
    )
      .split('?')[0]
      .trim();

  if (!caminho) {
    caminho = '/';
  }

  /*
   * UUID
   */
  caminho =
    caminho.replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?=\/|$)/gi,
      '/:id'
    );

  /*
   * IDs numericos.
   */
  caminho =
    caminho.replace(
      /\/\d+(?=\/|$)/g,
      '/:id'
    );

  /*
   * IDs/tokens longos em paths.
   * Nunca guardamos o valor real.
   */
  caminho =
    caminho.replace(
      /\/[A-Za-z0-9_-]{24,}(?=\/|$)/g,
      '/:id'
    );

  return caminho
    .slice(
      0,
      220
    );
}

function registrarLatencia(
  valor
) {
  latenciasRecentes.push(
    Math.max(
      0,
      numero(valor)
    )
  );

  if (
    latenciasRecentes.length >
    LATENCIAS_MAX
  ) {
    latenciasRecentes.splice(
      0,
      latenciasRecentes.length -
      LATENCIAS_MAX
    );
  }
}

function percentil(
  valores,
  percentual
) {
  if (
    !Array.isArray(valores) ||
    valores.length === 0
  ) {
    return 0;
  }

  const lista =
    [...valores]
      .sort(
        (a, b) =>
          a - b
      );

  const indice =
    Math.min(
      lista.length - 1,

      Math.max(
        0,

        Math.ceil(
          (
            percentual /
            100
          ) *
          lista.length
        ) - 1
      )
    );

  return arredondar(
    lista[indice]
  );
}

function statusClasse(
  status
) {
  const codigo =
    numero(status);

  if (
    codigo >= 200 &&
    codigo < 300
  ) {
    return 'responses_2xx';
  }

  if (
    codigo >= 300 &&
    codigo < 400
  ) {
    return 'responses_3xx';
  }

  if (
    codigo >= 400 &&
    codigo < 500
  ) {
    return 'responses_4xx';
  }

  if (
    codigo >= 500
  ) {
    return 'responses_5xx';
  }

  return null;
}

function obterRota(
  method,
  caminho
) {
  let chave =
    `${method} ${caminho}`;

  if (
    !rotas.has(chave) &&
    rotas.size >= ROTAS_MAX
  ) {
    chave =
      `${method} /_other`;
  }

  let item =
    rotas.get(chave);

  if (!item) {
    item = {
      method,
      path:
        chave.substring(
          method.length + 1
        ),

      requests: 0,

      errors_5xx: 0,

      total_ms: 0,

      max_ms: 0
    };

    rotas.set(
      chave,
      item
    );
  }

  return item;
}

function registrarRota({
  method,
  path,
  status,
  durationMs
}) {
  const item =
    obterRota(
      method,
      path
    );

  item.requests += 1;

  item.total_ms +=
    durationMs;

  item.max_ms =
    Math.max(
      item.max_ms,
      durationMs
    );

  if (
    status >= 500
  ) {
    item.errors_5xx += 1;
  }
}

export function observabilidadeMiddleware(
  req,
  res,
  next
) {
  const inicio =
    performance.now();

  const method =
    String(
      req?.method ||
      'GET'
    )
      .trim()
      .toUpperCase();

  const path =
    normalizarCaminho(
      req
    );

  const requestId =
    randomUUID();

  metricas.requests_total +=
    1;

  metricas.requests_inflight +=
    1;

  try {
    res.setHeader(
      'X-Request-Id',
      requestId
    );
  }
  catch {
  }

  let finalizado =
    false;

  function finalizar() {
    if (finalizado) {
      return;
    }

    finalizado =
      true;

    metricas.requests_inflight =
      Math.max(
        0,
        metricas.requests_inflight - 1
      );

    const durationMs =
      Math.max(
        0,
        performance.now() -
        inicio
      );

    registrarLatencia(
      durationMs
    );

    const status =
      numero(
        res?.statusCode,
        0
      );

    const classe =
      statusClasse(
        status
      );

    if (classe) {
      metricas[classe] +=
        1;
    }

    if (
      durationMs >= 2000
    ) {
      metricas.requests_lentas +=
        1;
    }

    registrarRota({
      method,
      path,
      status,
      durationMs
    });
  }

  try {
    res.once?.(
      'finish',
      finalizar
    );

    res.once?.(
      'close',
      finalizar
    );
  }
  catch {
  }

  try {
    return next();
  }
  catch (error) {
    finalizar();
    throw error;
  }
}

function snapshotRotas() {
  return [...rotas.values()]
    .map(
      (item) => ({
        method:
          item.method,

        path:
          item.path,

        requests:
          item.requests,

        errors_5xx:
          item.errors_5xx,

        avg_ms:
          item.requests > 0
            ? arredondar(
                item.total_ms /
                item.requests
              )
            : 0,

        max_ms:
          arredondar(
            item.max_ms
          )
      })
    )
    .sort(
      (a, b) =>
        b.requests -
        a.requests
    )
    .slice(
      0,
      20
    );
}

function eventLoopSnapshot() {
  function ms(
    nanos
  ) {
    return arredondar(
      numero(nanos) /
      1_000_000
    );
  }

  return {
    mean_ms:
      ms(
        eventLoopDelay.mean
      ),

    p95_ms:
      ms(
        eventLoopDelay
          .percentile(95)
      ),

    p99_ms:
      ms(
        eventLoopDelay
          .percentile(99)
      ),

    max_ms:
      ms(
        eventLoopDelay.max
      )
  };
}

export function observabilidadeResumo() {
  return {
    ativa: true,

    uptime_s:
      Math.floor(
        process.uptime()
      ),

    requests_total:
      metricas.requests_total,

    requests_inflight:
      metricas.requests_inflight,

    errors_5xx:
      metricas.responses_5xx,

    latency_p95_ms:
      percentil(
        latenciasRecentes,
        95
      ),

    event_loop_p95_ms:
      eventLoopSnapshot()
        .p95_ms
  };
}

export function observabilidadeSnapshot() {
  const memoria =
    process.memoryUsage();

  const cpu =
    process.cpuUsage();

  return {
    ativa: true,

    iniciado_em:
      new Date(
        INICIADO_EM
      ).toISOString(),

    uptime_s:
      Math.floor(
        process.uptime()
      ),

    requests: {
      total:
        metricas.requests_total,

      inflight:
        metricas.requests_inflight,

      responses_2xx:
        metricas.responses_2xx,

      responses_3xx:
        metricas.responses_3xx,

      responses_4xx:
        metricas.responses_4xx,

      responses_5xx:
        metricas.responses_5xx,

      lentas_2s:
        metricas.requests_lentas
    },

    latencia_recente_ms: {
      amostras:
        latenciasRecentes.length,

      p50:
        percentil(
          latenciasRecentes,
          50
        ),

      p95:
        percentil(
          latenciasRecentes,
          95
        ),

      p99:
        percentil(
          latenciasRecentes,
          99
        ),

      max:
        latenciasRecentes.length
          ? arredondar(
              Math.max(
                ...latenciasRecentes
              )
            )
          : 0
    },

    processo: {
      rss_mb:
        emMb(
          memoria.rss
        ),

      heap_used_mb:
        emMb(
          memoria.heapUsed
        ),

      heap_total_mb:
        emMb(
          memoria.heapTotal
        ),

      external_mb:
        emMb(
          memoria.external
        ),

      cpu_user_ms:
        arredondar(
          cpu.user /
          1000
        ),

      cpu_system_ms:
        arredondar(
          cpu.system /
          1000
        )
    },

    event_loop:
      eventLoopSnapshot(),

    rotas_top:
      snapshotRotas(),

    privacidade: {
      ips_armazenados:
        false,

      headers_armazenados:
        false,

      query_strings_armazenadas:
        false,

      bodies_armazenados:
        false,

      usuarios_armazenados:
        false
    }
  };
}

export function fecharObservabilidade() {
  try {
    eventLoopDelay.disable();
  }
  catch {
  }
}
