export const calcularConfiancaML = (dados) => {
    let score = 50;
    score += (dados.forma || 0) * 0.3;
    score += (dados.h2h || 0) * 0.2;
    score += (dados.attack || 0) * 0.3;
    score += (dados.possession || 50) * 0.1;
    score += (dados.shotsOnGoal || 0) * 0.5;

    score -= (dados.yellowCards || 0) * 2;
    score -= (dados.redCards || 0) * 10;

    return Math.max(Math.min(Math.round(score), 99), 1);
};