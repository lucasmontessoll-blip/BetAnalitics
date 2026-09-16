import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const server=fs.readFileSync(new URL('../server/intelligenceR59.js',import.meta.url),'utf8');
const client=fs.readFileSync(new URL('../src/components/IntelligenceR59Pro.jsx',import.meta.url),'utf8');
const sql=fs.readFileSync(new URL('../supabase/migrations/20260916001749_r59_intelligence_retention.sql',import.meta.url),'utf8');
test('R59 keeps provider secrets server-side and degrades safely',()=>{ assert.match(server,/process\.env\.API_FOOTBALL_KEY/); assert.doesNotMatch(client,/API_FOOTBALL_KEY|x-apisports-key/); assert.match(server,/API_NOT_CONFIGURED/); });
test('R59 paid endpoints require authentication and admin retention guard',()=>{ assert.match(server,/briefing', autenticarRequest/); assert.match(server,/compare', autenticarRequest/); assert.match(server,/admin\/retention', exigirAdmin/); });
test('R59 feedback is owner-readable and service-written',()=>{ assert.match(sql,/enable row level security/i); assert.match(sql,/auth\.uid\(\).*user_id/i); assert.doesNotMatch(sql,/for insert to authenticated/i); assert.match(sql,/grant all on public\.product_feedback to service_role/i); });
