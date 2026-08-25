const PREFIXO = 'betanalytics_cache_v1:';

function storageDisponivel() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function chaveFinal(chave) {
  return PREFIXO + String(chave || '');
}

export function salvarCacheJson(chave, dados) {
  if (!storageDisponivel()) return false;

  try {
    const registro = {
      salvoEm: Date.now(),
      dados,
    };

    window.localStorage.setItem(
      chaveFinal(chave),
      JSON.stringify(registro)
    );

    return true;
  } catch {
    return false;
  }
}

export function lerCacheJson(chave) {
  if (!storageDisponivel()) return null;

  try {
    const bruto = window.localStorage.getItem(chaveFinal(chave));

    if (!bruto) return null;

    const registro = JSON.parse(bruto);

    if (
      !registro ||
      typeof registro.salvoEm !== 'number' ||
      !Object.prototype.hasOwnProperty.call(registro, 'dados')
    ) {
      return null;
    }

    return {
      dados: registro.dados,
      salvoEm: registro.salvoEm,
      idadeMs: Math.max(0, Date.now() - registro.salvoEm),
    };
  } catch {
    return null;
  }
}

export function removerCacheJson(chave) {
  if (!storageDisponivel()) return;

  try {
    window.localStorage.removeItem(chaveFinal(chave));
  } catch {
    // Cache nunca deve quebrar a aplicacao.
  }
}
