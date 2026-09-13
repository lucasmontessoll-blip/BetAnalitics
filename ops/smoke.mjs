// Somente GET publico/sem sessao. Nao cria pagamento, usuario nem altera dados.
const base = process.argv[2];
if (!base || !/^https:\/\//.test(base)) throw Error('Informe URL HTTPS do ambiente a validar');
for (const [route, expected] of [['/api/producao/health',200],['/api/producao/readiness',200],['/api/auth/me',401]]) {
  const r=await fetch(new URL(route,base),{signal:AbortSignal.timeout(20000),redirect:'error'});
  const data=await r.json();
  if(r.status!==expected || (expected===200 && data.ok!==true)) throw Error('SMOKE_FAILED '+route+' HTTP '+r.status);
  console.log(route+' HTTP '+r.status+' PASS');
}
console.log('AUTHENTICATED_FLOWS=NOT_TESTED');
