import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { androidUpdateConfig } from '../server/appUpdate.js';

const manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
const nativePlugin = fs.readFileSync('android/app/src/main/java/com/betanalytics/pro/OnlineUpdatePlugin.java', 'utf8');
const client = fs.readFileSync('src/services/appUpdate.js', 'utf8');

test('R67 update endpoint is disabled unless complete secure metadata exists', () => {
  assert.equal(androidUpdateConfig({}).enabled, false);
  assert.equal(androidUpdateConfig({ ANDROID_UPDATE_ENABLED: 'true', ANDROID_UPDATE_APK_URL: 'http://unsafe.test/a.apk', ANDROID_UPDATE_APK_SHA256: 'a'.repeat(64), ANDROID_UPDATE_VERSION_CODE: '4', ANDROID_UPDATE_VERSION_NAME: '1.0.1' }).enabled, false);
  assert.equal(androidUpdateConfig({ ANDROID_UPDATE_ENABLED: 'true', ANDROID_UPDATE_APK_URL: 'https://download.example/a.apk', ANDROID_UPDATE_APK_SHA256: 'a'.repeat(64), ANDROID_UPDATE_VERSION_CODE: '4', ANDROID_UPDATE_VERSION_NAME: '1.0.1' }).enabled, true);
});

test('R67 verifies APK hash and uses the Android package installer', () => {
  assert.match(nativePlugin, /MessageDigest\.getInstance\("SHA-256"\)/);
  assert.match(nativePlugin, /FileProvider\.getUriForFile/);
  assert.match(nativePlugin, /MAX_APK_BYTES/);
  assert.match(manifest, /REQUEST_INSTALL_PACKAGES/);
});

test('R67 only offers versions newer than the installed Android build', () => {
  assert.match(client, /remoteCode > installedCode/);
  assert.match(client, /Capacitor\.isNativePlatform/);
});