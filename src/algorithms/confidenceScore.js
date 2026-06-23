export function confidenceScore({ forma = 50, h2h = 50, ataque = 50, defesa = 50, odds = 1.85 }) {
  // Converte odd para probabilidade baseada no mercado (ex: odd 2.0 = 50%)
  const probMercado = (1 / odds) * 100; 
  return Math.round(
    (forma * 0.25) +
    (h2h * 0.20) +
    (ataque * 0.25) +
    (defesa * 0.20) +
    (probMercado * 0.10)
  );
}