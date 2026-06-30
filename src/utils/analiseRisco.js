export const calcularNivelRisco=(jogo)=>{
  const confianca=Number(jogo?.confianca_ia||0);
  const odd=Number(jogo?.odd_principal||0);

  if(!confianca||!odd){
    return{nivel:'Indefinido',cor:'bg-slate-600',texto:'Dados insuficientes',descricao:'A IA ainda não possui dados suficientes para classificar este jogo.'};
  }

  if(confianca>=88&&odd>=1.4&&odd<=2.2){
    return{nivel:'Baixo',cor:'bg-emerald-500',texto:'Risco baixo',descricao:'Boa combinação entre confiança da IA e odd equilibrada.'};
  }

  if(confianca>=78&&odd>=1.3&&odd<=2.8){
    return{nivel:'Médio',cor:'bg-yellow-500',texto:'Risco médio',descricao:'O jogo possui oportunidade, mas exige cautela.'};
  }

  if(confianca<70||odd>3.2){
    return{nivel:'Alto',cor:'bg-red-500',texto:'Risco alto',descricao:'Jogo com instabilidade ou odd muito elevada para a confiança atual.'};
  }

  return{nivel:'Moderado',cor:'bg-orange-500',texto:'Risco moderado',descricao:'Análise equilibrada, sem vantagem clara suficiente.'};
};

export const calcularScoreOportunidade=(jogo)=>{
  const confianca=Number(jogo?.confianca_ia||0);
  const odd=Number(jogo?.odd_principal||1);
  const scoreOdd=odd>=1.4&&odd<=2.4?10:0;
  const bonus=jogo?.status==='Live'?3:0;
  return Math.min(99,Math.round(confianca+scoreOdd+bonus));
};
