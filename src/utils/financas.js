// Ficheiro: src/utils/financas.js

export const calcularKelly = (odd, probabilidade) => {
  const p = probabilidade / 100;
  const b = odd - 1;
  const kelly = (((b * p) - (1 - p)) / b) * 100;
  return Math.max(kelly, 0);
};

export const calcularDrawdown = (apostas, bancaInicial) => {
  let pico = bancaInicial;
  let maxDD = 0;
  let banca = bancaInicial;

  apostas.forEach(a => {
    if(a.resultado === "green") {
      banca += (a.stake * a.odd) - a.stake;
    } else {
      banca -= a.stake;
    }
    
    if(banca > pico) pico = banca;
    
    const dd = ((pico - banca) / pico) * 100;
    if(dd > maxDD) maxDD = dd;
  });

  return maxDD.toFixed(2);
};

export const executarBacktest = (apostas, bancaInicial) => {
  let banca = bancaInicial;
  apostas.forEach(a => {
    if(a.resultado === "green"){
      banca += (a.stake * a.odd) - a.stake;
    }else{
      banca -= a.stake;
    }
  });

  return {
    bancaFinal: banca,
    lucro: banca - bancaInicial,
    roi: ((banca - bancaInicial) / bancaInicial) * 100
  };
};