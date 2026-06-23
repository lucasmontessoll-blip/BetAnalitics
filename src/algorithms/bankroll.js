export function flatStake(banca, percentual) {
  return banca * (percentual / 100);
}

export function kelly(odd, probabilidade, banca) {
  const p = probabilidade / 100;
  const b = odd - 1;
  const k = ((b * p) - (1 - p)) / b;
  return banca * Math.max(0, k); // Nunca retorna valores negativos
}

export function kellyFracionado(odd, probabilidade, banca) {
  return kelly(odd, probabilidade, banca) / 2; // Maior segurança contra variância
}