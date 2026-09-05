/*
 * BetAnalytics
 * Observabilidade HTTP/TCP do processo Node.
 *
 * Privacidade:
 * - nao armazena IP
 * - nao armazena URL
 * - nao armazena headers
 * - nao armazena query string
 * - nao armazena body
 * - nao armazena usuario
 */

const estado = {
  instalado: false,

  requests_total: 0,
  requests_inflight: 0,
  requests_peak: 0,

  responses_completed: 0,
  responses_closed_before_finish: 0,

  requests_aborted: 0,

  connections_total: 0,
  connections_current: 0,
  connections_peak: 0,
  connections_closed: 0,

  socket_errors: 0,
  socket_timeouts: 0,

  drop_requests: 0
};

let servidor =
  null;

function numeroSeguro(
  valor,
  fallback = 0
) {
  const numero =
    Number(valor);

  return Number.isFinite(numero)
    ? numero
    : fallback;
}

function numeroOuNull(
  valor
) {
  const numero =
    Number(valor);

  return Number.isFinite(numero)
    ? numero
    : null;
}

function registrarRequest(
  req,
  res
) {
  estado.requests_total +=
    1;

  estado.requests_inflight +=
    1;

  estado.requests_peak =
    Math.max(
      estado.requests_peak,
      estado.requests_inflight
    );

  let finalizado =
    false;

  let terminou =
    false;

  const finalizar = (
    motivo
  ) => {
    if (finalizado) {
      return;
    }

    finalizado =
      true;

    estado.requests_inflight =
      Math.max(
        0,
        estado.requests_inflight - 1
      );

    if (
      motivo ===
      'finish'
    ) {
      estado.responses_completed +=
        1;
    }
    else {
      estado.responses_closed_before_finish +=
        1;
    }
  };

  res.once(
    'finish',
    () => {
      terminou =
        true;

      finalizar(
        'finish'
      );
    }
  );

  res.once(
    'close',
    () => {
      if (!terminou) {
        finalizar(
          'close'
        );
      }
    }
  );

  req.once(
    'aborted',
    () => {
      estado.requests_aborted +=
        1;
    }
  );
}

function registrarConexao(
  socket
) {
  estado.connections_total +=
    1;

  estado.connections_current +=
    1;

  estado.connections_peak =
    Math.max(
      estado.connections_peak,
      estado.connections_current
    );

  let fechada =
    false;

  socket.once(
    'close',
    () => {
      if (fechada) {
        return;
      }

      fechada =
        true;

      estado.connections_current =
        Math.max(
          0,
          estado.connections_current - 1
        );

      estado.connections_closed +=
        1;
    }
  );

  socket.on(
    'error',
    () => {
      estado.socket_errors +=
        1;
    }
  );

  socket.on(
    'timeout',
    () => {
      estado.socket_timeouts +=
        1;
    }
  );
}

export function instalarHttpTransportObservability(
  httpServer
) {
  if (
    estado.instalado &&
    servidor === httpServer
  ) {
    return httpTransportStatus();
  }

  if (
    estado.instalado
  ) {
    throw new Error(
      'Observabilidade HTTP/TCP ja instalada em outro servidor.'
    );
  }

  if (
    !httpServer ||
    typeof httpServer.on !==
      'function' ||
    typeof httpServer.prependListener !==
      'function'
  ) {
    throw new Error(
      'HTTP Server invalido para observabilidade.'
    );
  }

  servidor =
    httpServer;

  estado.instalado =
    true;

  /*
   * prependListener faz o contador de request
   * executar antes do listener Express.
   */
  httpServer.prependListener(
    'request',
    registrarRequest
  );

  httpServer.on(
    'connection',
    registrarConexao
  );

  /*
   * Node emite dropRequest quando
   * maxRequestsPerSocket e atingido.
   * Nao altera o comportamento do servidor.
   */
  httpServer.on(
    'dropRequest',
    () => {
      estado.drop_requests +=
        1;
    }
  );

  return httpTransportStatus();
}

export function httpTransportStatus() {
  const requestTimeout =
    numeroSeguro(
      servidor?.requestTimeout
    );

  const headersTimeout =
    numeroSeguro(
      servidor?.headersTimeout
    );

  const keepAliveTimeout =
    numeroSeguro(
      servidor?.keepAliveTimeout
    );

  const maxRequestsPerSocket =
    numeroSeguro(
      servidor?.maxRequestsPerSocket
    );

  return {
    ativa:
      estado.instalado,

    requests: {
      total:
        estado.requests_total,

      inflight:
        estado.requests_inflight,

      peak:
        estado.requests_peak,

      completed:
        estado.responses_completed,

      closed_before_finish:
        estado.responses_closed_before_finish,

      aborted:
        estado.requests_aborted,

      dropped:
        estado.drop_requests
    },

    connections: {
      total:
        estado.connections_total,

      current:
        estado.connections_current,

      peak:
        estado.connections_peak,

      closed:
        estado.connections_closed,

      socket_errors:
        estado.socket_errors,

      socket_timeouts:
        estado.socket_timeouts
    },

    server: {
      request_timeout_ms:
        requestTimeout,

      headers_timeout_ms:
        headersTimeout,

      keep_alive_timeout_ms:
        keepAliveTimeout,

      max_requests_per_socket:
        maxRequestsPerSocket,

      max_connections:
        numeroOuNull(
          servidor?.maxConnections
        )
    },

    privacidade: {
      ips_armazenados:
        false,

      urls_armazenadas:
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
