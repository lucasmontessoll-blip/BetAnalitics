export function simularMonteCarlo(probCasa) {
  let casa = 0;
  let empate = 0;
  let fora = 0;

  for(let i = 0; i < 10000; i++){
    const r = Math.random();
    if(r < probCasa){
      casa++;
    }
    else if(r < probCasa + 0.24){
      empate++;
    }
    else{
      fora++;
    }
  }

  return {
    casa: (casa/10000*100).toFixed(1),
    empate: (empate/10000*100).toFixed(1),
    fora: (fora/10000*100).toFixed(1)
  };
}