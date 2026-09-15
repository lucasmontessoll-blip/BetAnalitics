import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const component = fs.readFileSync(new URL('../src/components/CentralPersonalizadaPro.jsx', import.meta.url), 'utf8');
const service = fs.readFileSync(new URL('../src/services/personalizacao.js', import.meta.url), 'utf8');
const server = fs.readFileSync(new URL('../server.js', import.meta.url), 'utf8');
const sql = fs.readFileSync(new URL('../supabase/migrations/20260915023241_r53_r56_product_experience.sql', import.meta.url), 'utf8');

test('R53-R56 central is reachable and consumes real product data', () => {
  assert.match(app, /viewMode === 'central-personalizada'/);
  assert.match(app, /jogos=\{jogos\}/);
  assert.match(component, /pesquisarFutebol/);
  assert.match(component, /nunca usamos valores simulados/i);
  assert.doesNotMatch(component, /Math\.random/);
});

test('global search is sanitized, bounded and partial-failure tolerant', () => {
  assert.match(server, /app\.get\('\/api\/football\/pesquisa'/);
  assert.match(server, /slice\(0, 50\)/);
  assert.match(server, /Promise\.allSettled/);
  assert.match(server, /players\/profiles/);
});

test('preferences are owner-only with complete RLS write checks', () => {
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /to authenticated using \(\(select auth\.uid\(\)\) = user_id\)/i);
  assert.match(sql, /for update to authenticated[\s\S]*using[\s\S]*with check/i);
  assert.doesNotMatch(sql, /security definer/i);
  assert.match(service, /onConflict: 'user_id'/);
});

test('responsible-use copy forbids misleading betting claims', () => {
  assert.match(component, /não realiza apostas e não garante lucro/i);
  assert.match(component, /limite diário de uso/i);
  assert.match(component, /ocultar informações de odds/i);
});
