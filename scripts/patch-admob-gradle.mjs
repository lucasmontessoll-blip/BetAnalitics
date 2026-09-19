import fs from 'node:fs';
import path from 'node:path';

const gradlePath = path.resolve('node_modules/@capacitor-community/admob/android/build.gradle');
if (!fs.existsSync(gradlePath)) {
  console.log('ADMOB_AGP9_PATCH=SKIPPED_PLUGIN_NOT_INSTALLED');
  process.exit(0);
}

const legacy = "getDefaultProguardFile('proguard-android.txt')";
const modern = "getDefaultProguardFile('proguard-android-optimize.txt')";
const original = fs.readFileSync(gradlePath, 'utf8');

if (original.includes(modern) && !original.includes(legacy)) {
  console.log('ADMOB_AGP9_PATCH=ALREADY_APPLIED');
  process.exit(0);
}
if (!original.includes(legacy)) {
  throw new Error('ADMOB_GRADLE_FORA_DO_ESTADO_ESPERADO');
}

const patched = original.split(legacy).join(modern);
fs.writeFileSync(gradlePath, patched, 'utf8');
console.log('ADMOB_AGP9_PATCH=APPLIED');
