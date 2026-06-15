export const detectarValueBetReal = (odd, probabilidadeIA) => {
    const probMercado = 100 / odd;
    const value = probabilidadeIA - probMercado;

    return {
        value: Number(value.toFixed(2)),
        isValue: value > 5
    };
};