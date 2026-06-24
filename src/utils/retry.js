export async function retry(fn, tentativas = 3){
  for(let i = 0; i < tentativas; i++){
    try {
      return await fn();
    } catch(err) {
      if(i === tentativas - 1) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}