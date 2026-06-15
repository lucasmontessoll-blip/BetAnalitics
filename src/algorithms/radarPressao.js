export const radarPressao = (stats) => {
    let score = 0;
    score += (stats.shotsOnGoal || 0) * 3;
    score += (stats.corners || 0) * 2;
    score += (stats.possession || 0) * 0.2;

    if(stats.redCardsOpponent > 0) score += 15;

    return Math.round(score);
};