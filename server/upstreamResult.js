export function resumoDependencias(resultados) {
  const falhas = Object.entries(resultados).filter(([, r]) => r.status === 'rejected').map(([nome]) => nome);
  return { parcial: falhas.length > 0, dependencias_indisponiveis: falhas };
}
export async function fetchJsonComTimeout(url, options = {}, timeoutMs = 15000, fetchImpl = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { ...options, signal: controller.signal });
    const data = await response.json();
    return { response, data };
  } catch {
    const timeout = controller.signal.aborted;
    const error = new Error(timeout ? 'Fornecedor excedeu o tempo limite.' : 'Resposta do fornecedor indisponivel.');
    error.status = timeout ? 504 : 502;
    throw error;
  } finally { clearTimeout(timer); }
}
