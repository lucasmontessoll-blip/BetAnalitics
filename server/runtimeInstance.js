import {
  createHash,
  randomUUID
} from 'crypto';

const INICIADO_EM =
  Date.now();

/*
 * O identificador representa este processo/boot.
 *
 * Nao expomos hostname, PID, service id
 * ou qualquer valor interno do provedor.
 */
const INSTANCE_ID =
  createHash(
    'sha256'
  )
    .update(
      [
        String(
          process.env
            .RENDER_INSTANCE_ID ||
          ''
        ),

        String(
          process.env.HOSTNAME ||
          ''
        ),

        String(
          process.pid
        ),

        randomUUID()
      ].join(':')
    )
    .digest('hex')
    .slice(
      0,
      16
    );

let encerramentoSolicitado =
  false;

let sinalEncerramento =
  '';

function uptimeSegundos() {
  return Math.max(
    0,
    Math.floor(
      (
        Date.now() -
        INICIADO_EM
      ) /
      1000
    )
  );
}

export function runtimeInstanceStatus() {
  return {
    instance_id:
      INSTANCE_ID,

    role:
      'web',

    iniciado_em:
      new Date(
        INICIADO_EM
      ).toISOString(),

    uptime_s:
      uptimeSegundos(),

    shutdown_requested:
      encerramentoSolicitado,

    shutdown_signal:
      sinalEncerramento
  };
}

export function runtimeReadiness() {
  return {
    ok:
      !encerramentoSolicitado,

    instance_id:
      INSTANCE_ID,

    role:
      'web',

    uptime_s:
      uptimeSegundos(),

    shutdown_requested:
      encerramentoSolicitado
  };
}

export function runtimeInstanceMiddleware(
  _req,
  res,
  next
) {
  try {
    res.setHeader(
      'X-BetAnalytics-Instance',
      INSTANCE_ID
    );
  }
  catch {
  }

  return next();
}

export function runtimeBeginShutdown(
  signal = 'UNKNOWN'
) {
  encerramentoSolicitado =
    true;

  sinalEncerramento =
    String(
      signal ||
      'UNKNOWN'
    )
      .trim()
      .slice(
        0,
        32
      );

  return runtimeReadiness();
}
