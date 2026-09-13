import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2] || 'dist-play');
async function files(dir) {
  const result=[];
  for(const e of await readdir(dir,{withFileTypes:true})) {
    const p=path.join(dir,e.name);
    if(e.isDirectory()) result.push(...await files(p)); else result.push(p);
  }
  return result;
}
const all=await files(root);
if(!all.some(p=>p.endsWith('index.html'))) throw Error('PLAY_INDEX_MISSING');
const forbidden=['/api/pagamento/pix','/api/pagamento/cartao','https://sdk.mercadopago.com/js/v2'];
const violations=[];
for(const f of all.filter(p=>/\.(js|html)$/.test(p))) {
  const code=await readFile(f,'utf8');
  for(const marker of forbidden) if(code.includes(marker)) violations.push(path.relative(root,f)+': '+marker);
  if(/vendor-payments.*\.js$/.test(f)) violations.push('PAYMENT_CHUNK_PRESENT');
}
if(violations.length) { console.error(violations.join('\n')); process.exitCode=1; }
else console.log('PLAY_STATIC_PAYMENT_CHECK=PASS (nao substitui teste em aparelho)');
