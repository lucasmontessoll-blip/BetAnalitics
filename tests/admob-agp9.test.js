import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('R63D applies a reproducible AGP 9 compatibility patch after npm install', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const patcher = fs.readFileSync('scripts/patch-admob-gradle.mjs', 'utf8');
  assert.equal(packageJson.scripts.postinstall, 'node scripts/patch-admob-gradle.mjs');
  assert.match(patcher, /proguard-android\.txt/);
  assert.match(patcher, /proguard-android-optimize\.txt/);
});
