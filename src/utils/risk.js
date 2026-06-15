export const calcularRisco = (jogo) => {
    if(jogo.confianca_ia >= 90 && jogo.odd_principal <= 2.0) return { nivel: 'BAIXO', cor: 'text-green-400 bg-green-500/10 border-green-500/30' };
    if(jogo.confianca_ia >= 80) return { nivel: 'MÉDIO', cor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    return { nivel: 'ALTO', cor: 'text-red-400 bg-red-500/10 border-red-500/30' };
};

export const calcularStake = (banca, confianca) => {
    if(confianca >= 90) return banca * 0.05;
    if(confianca >= 85) return banca * 0.03;
    if(confianca >= 80) return banca * 0.02;
    return banca * 0.01;
};