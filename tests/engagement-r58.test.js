import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const component = fs.readFileSync(new URL('../src/components/EngajamentoR58Pro.jsx', import.meta.url), 'utf8');
const service = fs.readFileSync(new URL('../src/services/engajamentoR58.js', import.meta.url), 'utf8');
const server = fs.readFileSync(new URL('../server/productExperienceR58.js', import.meta.url), 'utf8');
const sql = fs.readFileSync(new URL('../supabase/migrations/20260915223308_r58_engagement_quality.sql', import.meta.url), 'utf8');

test('R58 completes onboarding, sourced news, calendar, offline and accessibility', () => {
  assert.match(component, /Configure sua experiência/);
  assert.match(component, /Notícias personalizadas/);
  assert.match(component, /Modo offline/);
  assert.match(component, /Acessibilidade/);
  assert.match(service, /text\/calendar/);
  assert.match(service, /bet-reduce-motion/);
});

test('news aggregation uses a fixed HTTPS source and bounded query', () => {
  assert.match(server, /https:\/\/news\.google\.com\/rss\/search/);
  assert.match(server, /slice\(0, max\)/);
  assert.match(server, /AbortSignal\.timeout\(7000\)/);
  assert.doesNotMatch(server, /Math\.random|fake|mock/i);
});

test('quality reports require auth and are owner-readable only', () => {
  assert.match(server, /app\.post\('\/api\/product\/data-quality-report', autenticarRequest/);
  assert.match(server, /app\.get\('\/api\/admin\/data-quality-reports', exigirAdmin/);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /for select to authenticated using \(\(select auth\.uid\(\)\) = user_id\)/i);
  assert.doesNotMatch(sql, /for insert to authenticated/i);
  assert.match(sql, /grant all on public\.data_quality_reports to service_role/i);
});
