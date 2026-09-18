import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('R62 removes automatic AdSense injection above the Golnexa header', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.doesNotMatch(html, /pagead2\.googlesyndication\.com/i);
  assert.doesNotMatch(html, /adsbygoogle\.js/i);
  assert.match(html, /Golnexa PRO/);
});

test('R62 preserves Android update identity', () => {
  const config = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
  assert.equal(config.appId, 'com.betanalytics.pro');
  assert.equal(config.appName, 'Golnexa PRO');
});