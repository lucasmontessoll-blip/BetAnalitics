param(
  [string]$Projeto = "E:\BetAnalytcs"
)

$ErrorActionPreference = "Stop"
Set-Location $Projeto

$SrcPath = Join-Path $Projeto "src"
$IndexPath = Join-Path $Projeto "index.html"
$PublicPath = Join-Path $Projeto "public"

if (-not (Test-Path $SrcPath)) {
  throw "Nao encontrei a pasta src em $Projeto"
}

if (-not (Test-Path (Join-Path $Projeto "package.json"))) {
  throw "Nao encontrei package.json em $Projeto"
}

$Data = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = Join-Path $Projeto "backups_etapas\ETAPA_31_UTF8_$Data"
$PatchFile = Join-Path $Projeto "patch_etapa31_utf8.cjs"

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
Copy-Item $SrcPath (Join-Path $BackupDir "src") -Recurse -Force

if (Test-Path $IndexPath) {
  Copy-Item $IndexPath (Join-Path $BackupDir "index.html") -Force
}

if (Test-Path $PublicPath) {
  Copy-Item $PublicPath (Join-Path $BackupDir "public") -Recurse -Force
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " ETAPA 31 - CORRECAO UTF-8 E TIPOGRAFIA" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Backup criado: $BackupDir" -ForegroundColor DarkGray

try {
@'
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const allowedExt = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md']);
const targets = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'android', '.git', 'backups_etapas'].includes(entry.name)) continue;
      walk(full);
      continue;
    }
    if (allowedExt.has(path.extname(entry.name).toLowerCase())) targets.push(full);
  }
}

walk(path.join(root, 'src'));
walk(path.join(root, 'public'));
const indexFile = path.join(root, 'index.html');
if (fs.existsSync(indexFile)) targets.push(indexFile);

const cp1252 = {
  0x80: '\u20ac', 0x81: '\u0081', 0x82: '\u201a', 0x83: '\u0192',
  0x84: '\u201e', 0x85: '\u2026', 0x86: '\u2020', 0x87: '\u2021',
  0x88: '\u02c6', 0x89: '\u2030', 0x8a: '\u0160', 0x8b: '\u2039',
  0x8c: '\u0152', 0x8d: '\u008d', 0x8e: '\u017d', 0x8f: '\u008f',
  0x90: '\u0090', 0x91: '\u2018', 0x92: '\u2019', 0x93: '\u201c',
  0x94: '\u201d', 0x95: '\u2022', 0x96: '\u2013', 0x97: '\u2014',
  0x98: '\u02dc', 0x99: '\u2122', 0x9a: '\u0161', 0x9b: '\u203a',
  0x9c: '\u0153', 0x9d: '\u009d', 0x9e: '\u017e', 0x9f: '\u0178'
};

function utf8AsWindows1252(value) {
  const bytes = Buffer.from(value, 'utf8');
  let out = '';
  for (const byte of bytes) {
    if (byte >= 0x80 && byte <= 0x9f) out += cp1252[byte];
    else out += String.fromCharCode(byte);
  }
  return out;
}

const correctTokens = [
  '\u00e1', '\u00e0', '\u00e2', '\u00e3', '\u00e4',
  '\u00c1', '\u00c0', '\u00c2', '\u00c3', '\u00c4',
  '\u00e9', '\u00e8', '\u00ea', '\u00eb',
  '\u00c9', '\u00c8', '\u00ca', '\u00cb',
  '\u00ed', '\u00ec', '\u00ee', '\u00ef',
  '\u00cd', '\u00cc', '\u00ce', '\u00cf',
  '\u00f3', '\u00f2', '\u00f4', '\u00f5', '\u00f6',
  '\u00d3', '\u00d2', '\u00d4', '\u00d5', '\u00d6',
  '\u00fa', '\u00f9', '\u00fb', '\u00fc',
  '\u00da', '\u00d9', '\u00db', '\u00dc',
  '\u00e7', '\u00c7', '\u00f1', '\u00d1',
  '\u00b0', '\u00ba', '\u00aa', '\u00a0',
  '\u2013', '\u2014', '\u2026', '\u201c', '\u201d', '\u2018', '\u2019', '\u2022',
  '\u2190', '\u2192', '\u2191', '\u2193',
  '\u2713', '\u2714', '\u2715', '\u2716',
  '\u26bd', '\u2691', '\u2694', '\u2630', '\u2637', '\u265a', '\u303d', '\u2605', '\u2606',
  '\ud83c\udfc6', '\ud83d\udcc5', '\ud83d\uddd3\ufe0f', '\ud83e\udd16', '\ud83d\udcca', '\ud83d\udcc8',
  '\ud83d\udd25', '\u26a1', '\ud83d\udc51', '\ud83d\udd12', '\ud83c\udfaf', '\ud83d\udcb0',
  '\ud83c\udde7\ud83c\uddf7', '\ud83c\udf0d'
];

const replacements = new Map();
for (const correct of correctTokens) {
  let broken = correct;
  for (let i = 0; i < 3; i += 1) {
    broken = utf8AsWindows1252(broken);
    if (broken !== correct) replacements.set(broken, correct);
  }
}

const fixedPairs = [
  ['\u00c2\u00a0', ' '],
  ['\u00c2\u00b7', '\u00b7'],
  ['\u00c2\u00b0', '\u00b0'],
  ['\u00ef\u00bf\u00bd', ''],
  ['\ufffd', '']
];

function replaceAllLiteral(text, from, to) {
  if (!from || !text.includes(from)) return text;
  return text.split(from).join(to);
}

const reverseCp1252 = new Map();
for (let byte = 0; byte <= 0xff; byte += 1) {
  const char = byte >= 0x80 && byte <= 0x9f
    ? cp1252[byte]
    : String.fromCharCode(byte);
  reverseCp1252.set(char, byte);
}

const utf8Fatal = new TextDecoder('utf-8', { fatal: true });
const suspiciousLeads = new Set(['\u00c3', '\u00c2', '\u00e2', '\u00f0', '\u00ef', '\u00e3']);

function decodeCp1252Candidate(candidate) {
  const bytes = [];
  for (const char of candidate) {
    const byte = reverseCp1252.get(char);
    if (byte === undefined) return null;
    bytes.push(byte);
  }

  try {
    return utf8Fatal.decode(Uint8Array.from(bytes));
  } catch {
    return null;
  }
}

function genericMojibakeRepair(input) {
  let text = input;

  for (let pass = 0; pass < 4; pass += 1) {
    let output = '';
    let changed = false;

    for (let index = 0; index < text.length;) {
      if (!suspiciousLeads.has(text[index])) {
        output += text[index];
        index += 1;
        continue;
      }

      let best = null;
      const maxLength = Math.min(24, text.length - index);

      for (let length = 2; length <= maxLength; length += 1) {
        const candidate = text.slice(index, index + length);
        const decoded = decodeCp1252Candidate(candidate);
        if (!decoded || decoded === candidate || decoded.includes('\ufffd')) continue;

        const startsBetter = !suspiciousLeads.has(decoded[0]) || decoded.length < candidate.length;
        if (!startsBetter) continue;

        best = { length, decoded };
      }

      if (best) {
        output += best.decoded;
        index += best.length;
        changed = true;
      } else {
        output += text[index];
        index += 1;
      }
    }

    text = output;
    if (!changed) break;
  }

  return text;
}

function repairMojibake(input) {
  let text = input.replace(/^\uFEFF/, '');
  for (let pass = 0; pass < 4; pass += 1) {
    const before = text;
    text = genericMojibakeRepair(text);
    for (const [from, to] of replacements) text = replaceAllLiteral(text, from, to);
    for (const [from, to] of fixedPairs) text = replaceAllLiteral(text, from, to);
    if (text === before) break;
  }
  return text;
}

function normalizeCardTabs(text, file) {
  if (!/CardJogo\.jsx$/i.test(file)) return text;

  const labels = {
    detalhes: 'Detalhes',
    escalacoes: 'Escala\u00e7\u00f5es',
    ia: 'Previs\u00e3o IA',
    estatisticas: 'Estat\u00edsticas',
    classificacao: 'Classifica\u00e7\u00f5es',
    cd: 'Confronto direto',
    comentario: 'Coment\u00e1rios',
    odds: 'Odds'
  };

  for (const [id, label] of Object.entries(labels)) {
    const rx = new RegExp(
      '((?:setTab|setAba)\\(\\s*[\\"\\\']' + id + '[\\"\\\']\\s*\\)\\s*\\}\\s*>)[^<]*(<\\/TabButton>)',
      'g'
    );
    text = text.replace(rx, '$1' + label + '$2');
  }

  text = text.replace(
    /className=\{`shrink-0\s+/g,
    'className={`shrink-0 font-sans '
  );

  return text;
}

function normalizeIndex(text, file) {
  if (path.basename(file).toLowerCase() !== 'index.html') return text;

  if (!/<meta\s+charset=/i.test(text)) {
    text = text.replace(/<head>/i, '<head>\n    <meta charset="UTF-8" />');
  }

  text = text.replace(/^\s*<link[^>]+data:image\/svg\+xml[^>]*>\s*$/gim, '');
  return text;
}

let changedFiles = 0;
let repairedOccurrences = 0;

for (const file of [...new Set(targets)]) {
  const original = fs.readFileSync(file, 'utf8');
  let updated = repairMojibake(original);
  updated = normalizeCardTabs(updated, file);
  updated = normalizeIndex(updated, file);

  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changedFiles += 1;
  } else if (original.charCodeAt(0) === 0xfeff) {
    fs.writeFileSync(file, original.replace(/^\uFEFF/, ''), 'utf8');
    changedFiles += 1;
  }

  const suspiciousBefore = (original.match(/(?:\u00c3|\u00c2|\u00e2|\u00f0\u0178|\ufffd)/g) || []).length;
  const suspiciousAfter = (updated.match(/(?:\u00c3|\u00c2|\u00e2|\u00f0\u0178|\ufffd)/g) || []).length;
  repairedOccurrences += Math.max(0, suspiciousBefore - suspiciousAfter);
}

console.log('Arquivos verificados: ' + targets.length);
console.log('Arquivos corrigidos: ' + changedFiles);
console.log('Ocorrencias suspeitas removidas: ' + repairedOccurrences);
console.log('UTF-8 normalizado e icones de texto das abas removidos.');
'@ | Set-Content -Encoding ASCII $PatchFile

  node $PatchFile
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao executar a correcao UTF-8 (codigo $LASTEXITCODE)"
  }

  Remove-Item $PatchFile -Force -ErrorAction SilentlyContinue

  Write-Host "Arquivos corrigidos. Executando build..." -ForegroundColor Yellow
  npm run build
  if ($LASTEXITCODE -ne 0) {
    throw "O build retornou o codigo $LASTEXITCODE"
  }

  Write-Host ""
  Write-Host "ETAPA 31 INSTALADA COM SUCESSO!" -ForegroundColor Green
  Write-Host "- Letras acentuadas corrigidas" -ForegroundColor Green
  Write-Host "- Caracteres estranhos e mojibake corrigidos" -ForegroundColor Green
  Write-Host "- Abas com tipografia uniforme" -ForegroundColor Green
  Write-Host "- Arquivos salvos em UTF-8 sem BOM" -ForegroundColor Green
  Write-Host "- Build concluido sem erro" -ForegroundColor Green
}
catch {
  Write-Host ""
  Write-Host "ERRO NA ETAPA 31: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Restaurando os arquivos anteriores..." -ForegroundColor Yellow

  if (Test-Path $SrcPath) {
    Remove-Item $SrcPath -Recurse -Force
  }
  Copy-Item (Join-Path $BackupDir "src") $SrcPath -Recurse -Force

  if (Test-Path (Join-Path $BackupDir "index.html")) {
    Copy-Item (Join-Path $BackupDir "index.html") $IndexPath -Force
  }

  if (Test-Path (Join-Path $BackupDir "public")) {
    if (Test-Path $PublicPath) {
      Remove-Item $PublicPath -Recurse -Force
    }
    Copy-Item (Join-Path $BackupDir "public") $PublicPath -Recurse -Force
  }

  Remove-Item $PatchFile -Force -ErrorAction SilentlyContinue
  Write-Host "Arquivos restaurados. O aplicativo ficou como estava antes." -ForegroundColor Green
  throw
}
