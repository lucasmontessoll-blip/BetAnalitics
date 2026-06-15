export const calcularEV = (probabilidade, odd) => (((probabilidade / 100) * odd - 1) * 100);

export const calcularHeatScore = (jogo) => {
    const ev = calcularEV(jogo.confianca_ia, jogo.odd_principal);
    return Math.round((jogo.confianca_ia * 0.5) + (ev * 2) + (((jogo.homeStats?.form || 50) - (jogo.awayStats?.form || 50)) * 0.3));
};

export const calcularKelly = (odd, probabilidade) => {
    const p = probabilidade / 100;
    const b = odd - 1;
    return Math.max((((b * p) - (1 - p)) / b) * 100, 0);
};