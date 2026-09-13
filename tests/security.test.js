import test from 'node:test';
import assert from 'node:assert/strict';
import { criarGuardaPro, perfilTemPro } from '../server/accessPolicy.js';
import { criarAutenticador } from '../server/authSupabase.js';
import { fetchJsonComTimeout, resumoDependencias } from '../server/upstreamResult.js';

function response() { return { statusCode: 200, status(n) { this.statusCode=n; return this; }, json(b) { this.body=b; return this; } }; }
test('PRO: free, expired, missing date, manipulated strings fail closed', () => {
  for (const p of [{}, { plano:'PRO' }, {is_vip:'true',vip_expira:'2099-01-01'}, {is_vip:true}, {is_vip:true,vip_expira:'2000-01-01'}]) assert.equal(perfilTemPro(p),false);
  assert.equal(perfilTemPro({is_admin:true}),true);
  assert.equal(perfilTemPro({is_vip:true,vip_expira:'2099-01-01'}),true);
  assert.equal(perfilTemPro({is_vip:true,vip_expira:'2026-01-01'},Date.parse('2026-01-01')),false);
});
test('PRO guard ignores client metadata and fails on database error', async () => {
  const req={betUser:{id:'u',user_metadata:{is_admin:true}}};
  const res=response(); await criarGuardaPro(async()=>({}))(req,res,()=>assert.fail()); assert.equal(res.statusCode,403);
  const bad=response(); await criarGuardaPro(async()=>{throw Error('secret');})(req,bad,()=>assert.fail());
  assert.equal(bad.statusCode,503); assert.ok(!JSON.stringify(bad.body).includes('secret'));
});
test('PRO permits active profile only', async () => {
  let passed=false; await criarGuardaPro(async()=>({is_admin:true}))({betUser:{id:'u'}},response(),()=>passed=true); assert.equal(passed,true);
});
test('authentication rejects missing token before provider calls', async () => {
  const res=response(); await criarAutenticador({})({headers:{}},res,()=>assert.fail()); assert.equal(res.statusCode,401);
});
test('valid signed claims require active server-side session', async () => {
  for (const active of [true,false]) {
    const client={auth:{getClaims:async()=>({data:{claims:{sub:'u',session_id:'s',role:'authenticated'}}})},rpc:async(name,args)=>{
      assert.equal(name,'bet_session_active_r48'); assert.deepEqual(args,{p_user_id:'u',p_session_id:'s'}); return {data:active};
    }};
    const res=response(); let passed=false;
    await criarAutenticador(client)({headers:{authorization:'Bearer test'}},res,()=>passed=true);
    assert.equal(passed,active); if(!active) assert.equal(res.statusCode,401);
  }
});
test('session RPC error does not permit access', async () => {
  const client={auth:{getClaims:async()=>({data:{claims:{sub:'u',session_id:'s',role:'authenticated'}}})},rpc:async()=>({error:{message:'internal'}})};
  const res=response(); await criarAutenticador(client)({headers:{authorization:'Bearer test'}},res,()=>assert.fail()); assert.equal(res.statusCode,503);
});
test('partial responses contain dependency names, never error secrets', () => {
  assert.deepEqual(resumoDependencias({odds:{status:'rejected',reason:'secret'},fixture:{status:'fulfilled'}}),{parcial:true,dependencias_indisponiveis:['odds']});
});
test('upstream timeout aborts and returns 504', async () => {
  const fake=(_url,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Error('abort')),{once:true}));
  await assert.rejects(fetchJsonComTimeout('https://example.invalid',{},5,fake),e=>e.status===504);
});
test('upstream malformed JSON returns 502 and hides body', async () => {
  await assert.rejects(fetchJsonComTimeout('x',{},100,async()=>({json:async()=>{throw Error('secret');}})),e=>e.status===502&&!e.message.includes('secret'));
});
