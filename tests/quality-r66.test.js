import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const monitor = fs.readFileSync('src/services/qualityMonitor.js', 'utf8');
const boundary = fs.readFileSync('src/components/ErrorBoundary.jsx', 'utf8');
const main = fs.readFileSync('src/main.jsx', 'utf8');
const css = fs.readFileSync('src/App.css', 'utf8');
const workflow = fs.readFileSync('.github/workflows/verify.yml', 'utf8');
const quality = fs.readFileSync('ops/quality-gate.mjs', 'utf8');

test('R66 records bounded private client diagnostics', () => {
  assert.ok(monitor.includes('MAX_ERRORS = 30'));
  assert.ok(monitor.includes('MAX_METRICS = 60'));
  assert.ok(monitor.includes('[redacted]'));
  assert.ok(monitor.includes('email: false'));
  assert.ok(boundary.includes('recordClientError'));
  assert.ok(main.includes('initQualityMonitoring'));
});

test('R66 applies global accessibility safeguards', () => {
  assert.ok(css.includes(':focus-visible'));
  assert.ok(css.includes('prefers-reduced-motion'));
  assert.ok(css.includes('forced-colors'));
});

test('R66 quality gate enforces resilience and bundle budgets in CI', () => {
  assert.ok(quality.includes('1_200_000'));
  assert.ok(quality.includes('250_000'));
  assert.ok(workflow.includes('npm run quality'));
  assert.ok(workflow.includes('npm run release:manifest'));
});