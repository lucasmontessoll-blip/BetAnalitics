import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validarEventoAnalytics } from '../server/growthAnalytics.js';

const sql = [
  '../supabase/migrations/20260914012702_r51_growth_analytics.sql',
  '../supabase/migrations/20260914012739_r51_analytics_advisor_hardening.sql'
].map((path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n');
const server = fs.readFileSync(new URL('../server/growthAnalytics.js', import.meta.url), 'utf8');

test('R51 analytics is RLS protected and service-only', () => {
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /revoke all on public\.analytics_events from public, anon, authenticated/i);
  assert.match(sql, /grant execute .* to service_role/i);
  const eventTable = sql.slice(sql.indexOf('create table if not exists public.analytics_events'), sql.indexOf('create table if not exists public.analytics_campaign_costs'));
  assert.doesNotMatch(eventTable, /\b(ip_address|email|cpf|access_token|user_agent)\b/i);
});

test('admin analytics routes require the admin guard', () => {
  assert.match(server, /app\.get\('\/api\/admin\/analytics', exigirAdmin/);
  assert.match(server, /app\.post\('\/api\/admin\/analytics\/costs', exigirAdmin/);
});

test('event validator allowlists names and properties', () => {
  const event = validarEventoAnalytics({ event_name:'page_view', anonymous_id:crypto.randomUUID(), session_id:crypto.randomUUID(), properties:{ location:'/inicio', email:'discard', token:'discard' } });
  assert.deepEqual(event.properties, { location:'/inicio' });
  assert.throws(() => validarEventoAnalytics({ event_name:'arbitrary_event' }), /Evento invalido/);
});
