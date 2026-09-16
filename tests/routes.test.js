import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('critical paid routes retain auth and server-side PRO checks', async () => {
  const server=await readFile(new URL('../server.js',import.meta.url),'utf8');
  for(const route of ['/api/football/radar-odds','/api/football/pacote-completo/:fixtureId','/api/chat-ia']) {
    const i=server.indexOf("'"+route+"'");
    assert.ok(i>0); assert.match(server.slice(i,i+160),/autenticarRequest,\s+exigirPro,/);
  }
  assert.match(server,/exigirPro\(req, res, \(\) => limiter/);
  const history=await readFile(new URL('../server/historicoIA.js',import.meta.url),'utf8');
  assert.match(history,/app\.post\('\/api\/historico-ia', autenticarRequest, exigirPro/);
});
test('SQL retains service-only guards and does not execute deletion during installation', async()=>{
  const sql=await readFile(new URL('../supabase/migrations/20260913225002_r48_final_hardening.sql',import.meta.url),'utf8');
  assert.match(sql,/begin;/); assert.match(sql,/commit;/);
  assert.match(sql,/revoke all on function public.bet_session_active_r48\(uuid,uuid\) from public, anon, authenticated/);
  assert.match(sql,/revoke all on function public.bet_delete_app_data_r48\(uuid\) from public, anon, authenticated/);
  assert.match(sql,/s.id=p_session_id and s.user_id=p_user_id/);
});
