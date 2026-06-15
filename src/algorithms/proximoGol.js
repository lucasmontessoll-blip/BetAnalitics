export const probabilidadeProximoGol = (statsCasa, statsFora) => {
    const scoreCasa = (statsCasa.shotsOnGoal * 4) + (statsCasa.possession * 0.2) + (statsCasa.corners * 2);
    const scoreFora = (statsFora.shotsOnGoal * 4) + (statsFora.possession * 0.2) + (statsFora.corners * 2);
    const total = scoreCasa + scoreFora;

    if (total === 0) return { casa: '50.0', fora: '50.0' }; // Evitar divisão por zero

    return {
        casa: ((scoreCasa / total) * 100).toFixed(1),
        fora: ((scoreFora / total) * 100).toFixed(1)
    };
};