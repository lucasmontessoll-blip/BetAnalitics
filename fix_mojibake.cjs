const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "src");

const cp1252 = new Map([
  [0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88],
  [0x2030, 0x89], [0x0160, 0x8A], [0x2039, 0x8B], [0x0152, 0x8C],
  [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92], [0x201C, 0x93],
  [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B],
  [0x0153, 0x9C], [0x017E, 0x9E], [0x0178, 0x9F],
]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full, files);
    } else if (/\.(js|jsx|css|html)$/i.test(full)) {
      files.push(full);
    }
  }

  return files;
}

function byteForChar(ch) {
  const code = ch.charCodeAt(0);

  if (code <= 0xff) return code;
  if (cp1252.has(code)) return cp1252.get(code);

  return null;
}

function decodeMojibake(seg) {
  const bytes = [];

  for (const ch of seg) {
    const b = byteForChar(ch);
    if (b === null) return seg;
    bytes.push(b);
  }

  const decoded = Buffer.from(bytes).toString("utf8");

  if (!decoded || decoded.includes("\uFFFD")) return seg;

  return decoded;
}

function fixText(text) {
  let out = text;

  for (let i = 0; i < 4; i++) {
    // Emojis quebrados: ðŸ...
    out = out.replace(/\u00F0[\u0080-\uFFFF]{3}/g, decodeMojibake);

    // Símbolos quebrados: â€”, âœ…, âš½ etc.
    out = out.replace(/\u00E2[\u0080-\uFFFF]{2}/g, decodeMojibake);

    // Acentos quebrados: Ã£, Ã§, Ã© etc.
    out = out.replace(/\u00C3[\u0080-\uFFFF]/g, decodeMojibake);

    // Espaços/símbolos quebrados: Âº, Âª, Â etc.
    out = out.replace(/\u00C2[\u0080-\uFFFF]/g, decodeMojibake);
  }

  return out;
}

const files = walk(ROOT);
let changed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  const fixed = fixText(original);

  if (fixed !== original) {
    fs.writeFileSync(file, fixed, "utf8");
    changed++;
  }
}

console.log("Arquivos verificados:", files.length);
console.log("Arquivos corrigidos:", changed);
