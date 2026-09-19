import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2] || 'dist';
const required = [
  'src/components/ErrorBoundary.jsx',
  'src/components/SemConexaoPro.jsx',
  'src/services/qualityMonitor.js',
  'tests/quality-r66.test.js',
  '.github/workflows/verify.yml',
];
const failures = [];
for (const file of required) if (!fs.existsSync(file)) failures.push(`missing:${file}`);

const css = fs.readFileSync('src/App.css', 'utf8');
if (!css.includes(':focus-visible')) failures.push('a11y:focus-visible');
if (!css.includes('prefers-reduced-motion')) failures.push('a11y:reduced-motion');

const main = fs.readFileSync('src/main.jsx', 'utf8');
if (!main.includes('initQualityMonitoring')) failures.push('runtime:quality-monitor');
if (!main.includes('<ErrorBoundary>')) failures.push('runtime:error-boundary');

if (!fs.existsSync(out)) failures.push(`build:missing:${out}`);
else {
  const assets = path.join(out, 'assets');
  if (fs.existsSync(assets)) {
    for (const name of fs.readdirSync(assets)) {
      const size = fs.statSync(path.join(assets, name)).size;
      if (name.endsWith('.js') && size > 1_200_000) failures.push(`bundle:js:${name}:${size}`);
      if (name.endsWith('.css') && size > 250_000) failures.push(`bundle:css:${name}:${size}`);
    }
  }
}

if (failures.length) {
  console.error(`QUALITY_GATE=FAIL\n${failures.join('\n')}`);
  process.exit(1);
}
console.log('QUALITY_GATE=PASS');
console.log('ACCESSIBILITY_BASELINE=PASS');
console.log('BUNDLE_BUDGET=PASS');
console.log('RUNTIME_RESILIENCE=PASS');