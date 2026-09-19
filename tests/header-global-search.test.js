import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const header = fs.readFileSync('src/components/HeaderApp.jsx', 'utf8');
const central = fs.readFileSync('src/components/CentralPersonalizadaPro.jsx', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('R64 replaces header branding with native-styled global search', () => {
  assert.ok(header.includes('Liga, time, treinador ou jogador'));
  for (const forbidden of ['logo-topo', 'VIP ativo', 'text-orange', 'border-orange', 'ring-orange']) {
    assert.equal(header.includes(forbidden), false);
  }
  assert.ok(header.includes('border-blue-500'));
  assert.ok(header.includes('golnexa:header-search-selection'));
});

test('R64 searches and opens leagues teams coaches and players', () => {
  assert.ok(server.includes("apiFootballRequest('/coachs'"));
  assert.ok(server.includes("type: 'coach'"));
  assert.ok(central.includes('buscarTreinadorApiFootball'));
  assert.ok(central.includes('results.coaches'));
});

test('R64 protects the provider quota with minimum length and debounce', () => {
  assert.ok(header.includes('term.length < 3'));
  assert.ok(header.includes('setTimeout(async () =>'));
  assert.ok(header.includes('450'));
});
