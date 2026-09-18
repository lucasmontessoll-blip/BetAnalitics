import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => fs.readFileSync(p, 'utf8');
test('R61 exposes Golnexa and preserves Android identity', () => {
  assert.match(read('index.html'), /Golnexa PRO/);
  assert.match(read('public/manifest.json'), /Golnexa/);
  assert.match(read('android/app/src/main/res/values/strings.xml'), />Golnexa PRO</);
  const cap = JSON.parse(read('capacitor.config.json'));
  assert.equal(cap.appName, 'Golnexa PRO');
  assert.equal(cap.appId, 'com.betanalytics.pro');
});
test('R61 brand assets exist and are populated', () => {
  for (const p of ['public/logo-oficial.png','public/logo-topo.png','public/golnexa-icon.png','public/favicon.png','public/icon-192.png','public/icon-512.png']) {
    assert.ok(fs.statSync(p).size > 1000, p);
  }
});