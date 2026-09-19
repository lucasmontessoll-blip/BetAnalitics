import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const out = process.argv[2] || 'dist';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const gradle = fs.readFileSync('android/app/build.gradle', 'utf8');
const versionCode = Number(gradle.match(/versionCode\s+(\d+)/)?.[1] || 0);
const versionName = gradle.match(/versionName\s+"([^"]+)"/)?.[1] || '';
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const manifest = {
  product: 'Golnexa',
  package: 'com.betanalytics.pro',
  web_version: pkg.version,
  android_version_name: versionName,
  android_version_code: versionCode,
  commit,
  generated_at: new Date().toISOString(),
  payment_free_play_build: true,
};
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(`${out}/release-manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`RELEASE_MANIFEST=PASS;COMMIT=${commit.slice(0, 7)};VERSION_CODE=${versionCode}`);