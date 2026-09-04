const PREFIXO =
  'betanalytics_payment_attempt_v1:';

const memoria =
  new Map();

function tipoSeguro(
  valor
) {
  const tipo =
    String(
      valor ||
      'pagamento'
    )
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9_-]/g,
        ''
      );

  return tipo ||
    'pagamento';
}

function storageKey(
  tipo
) {
  return (
    PREFIXO +
    tipoSeguro(tipo)
  );
}

function chaveValida(
  valor
) {
  const chave =
    String(
      valor ||
      ''
    ).trim();

  return (
    chave.length >= 16 &&
    chave.length <= 128 &&
    /^[A-Za-z0-9._:-]+$/
      .test(chave)
  );
}

function gerarChave() {
  try {
    const uuid =
      globalThis
        ?.crypto
        ?.randomUUID
        ?.();

    if (
      chaveValida(uuid)
    ) {
      return uuid;
    }
  }
  catch {
  }

  return (
    'bet-' +
    Date.now()
      .toString(36) +
    '-' +
    Math.random()
      .toString(36)
      .slice(2) +
    '-' +
    Math.random()
      .toString(36)
      .slice(2)
  );
}

export function obterTentativaPagamento(
  tipo
) {
  const key =
    storageKey(
      tipo
    );

  try {
    const salva =
      globalThis
        ?.sessionStorage
        ?.getItem(key);

    if (
      chaveValida(
        salva
      )
    ) {
      memoria.set(
        key,
        salva
      );

      return salva;
    }
  }
  catch {
  }

  const local =
    memoria.get(
      key
    );

  if (
    chaveValida(
      local
    )
  ) {
    return local;
  }

  const nova =
    gerarChave();

  memoria.set(
    key,
    nova
  );

  try {
    globalThis
      ?.sessionStorage
      ?.setItem(
        key,
        nova
      );
  }
  catch {
  }

  return nova;
}

export function encerrarTentativaPagamento(
  tipo
) {
  const key =
    storageKey(
      tipo
    );

  memoria.delete(
    key
  );

  try {
    globalThis
      ?.sessionStorage
      ?.removeItem(
        key
      );
  }
  catch {
  }

  return true;
}
