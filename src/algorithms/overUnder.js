export const preverOver = (gols, chutes, posse) => {
    let score = 0;
    score += gols * 20;
    score += chutes * 2;
    score += posse * 0.2;

    return {
        over15: score > 50,
        over25: score > 75,
        score: Math.round(score)
    };
};