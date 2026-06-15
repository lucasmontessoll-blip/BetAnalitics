export const compararOdds = (odds) => {
    const casas = [
        { nome: "Bet365", odd: odds.bet365 },
        { nome: "Pinnacle", odd: odds.pinnacle },
        { nome: "Betano", odd: odds.betano },
        { nome: "1xBet", odd: odds.xbet }
    ];

    casas.sort((a,b) => b.odd - a.odd);

    return {
        melhorCasa: casas[0],
        piorCasa: casas[casas.length-1],
        diferenca: (((casas[0].odd - casas[casas.length-1].odd) / casas[casas.length-1].odd) * 100).toFixed(2)
    };
};