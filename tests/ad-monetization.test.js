import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('R63 ads remain opt-in, test-first and PRO-safe', () => {
  const service = fs.readFileSync('src/services/adMonetization.js', 'utf8');
  const app = fs.readFileSync('src/App.jsx', 'utf8');
  const manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
  assert.match(service, /VITE_ADS_ENABLED \|\| 'false'/);
  assert.match(service, /VITE_ADS_TEST_MODE \|\| 'true'/);
  assert.match(service, /proAtivo/);
  assert.match(service, /menuAtivo === 'assinar pro'/);
  assert.match(service, /blockedViews/);
  assert.match(service, /minimumIntervalMs/);
  assert.match(app, /AdMonetizationController/);
  assert.match(manifest, /com\.google\.android\.gms\.ads\.APPLICATION_ID/);
});
