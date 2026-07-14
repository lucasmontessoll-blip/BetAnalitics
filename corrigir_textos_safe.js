const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "src");

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

const chr = (code) => String.fromCharCode(code);

const replacements = [
  [/\u00c3\u00a1/g, chr(0x00e1)],
  [/\u00c3\u0081/g, chr(0x00c1)],
  [/\u00c3\u00a0/g, chr(0x00e0)],
  [/\u00c3\u0080/g, chr(0x00c0)],
  [/\u00c3\u00a2/g, chr(0x00e2)],
  [/\u00c3\u0082/g, chr(0x00c2)],
  [/\u00c3\u00a3/g, chr(0x00e3)],
  [/\u00c3\u0083/g, chr(0x00c3)],

  [/\u00c3\u00a9/g, chr(0x00e9)],
  [/\u00c3\u0089/g, chr(0x00c9)],
  [/\u00c3\u00aa/g, chr(0x00ea)],
  [/\u00c3\u008a/g, chr(0x00ca)],

  [/\u00c3\u00ad/g, chr(0x00ed)],
  [/\u00c3\u008d/g, chr(0x00cd)],

  [/\u00c3\u00b3/g, chr(0x00f3)],
  [/\u00c3\u0093/g, chr(0x00d3)],
  [/\u00c3\u00b4/g, chr(0x00f4)],
  [/\u00c3\u0094/g, chr(0x00d4)],
  [/\u00c3\u00b5/g, chr(0x00f5)],
  [/\u00c3\u0095/g, chr(0x00d5)],

  [/\u00c3\u00ba/g, chr(0x00fa)],
  [/\u00c3\u009a/g, chr(0x00da)],

  [/\u00c3\u00a7/g, chr(0x00e7)],
  [/\u00c3\u0087/g, chr(0x00c7)],

  [/\u00c2\u00ba/g, chr(0x00ba)],
  [/\u00c2\u00aa/g, chr(0x00aa)],
  [/\u00c2\u00b7/g, "·"],
  [/\u00c2\u00a0/g, " "],

  [/\u00e2\u20ac\u201c/g, "-"],
  [/\u00e2\u20ac\u201d/g, "-"],
  [/\u00e2\u20ac\u00a6/g, "..."],
  [/\u00e2\u20ac\u2122/g, "'"],
  [/\u00e2\u20ac\u02dc/g, "'"],
  [/\u00e2\u20ac\u0153/g, '"'],
  [/\u00e2\u20ac\u009d/g, '"'],
  [/\u00e2\u20ac\u00a2/g, "•"],
  [/\u00e2\u2030\u00a5/g, "≥"],
  [/\u00e2\u2030\u00a4/g, "≤"],

  [/\u00ef\u00b8\u008f/g, ""],
];

const files = walk(ROOT);
let changed = 0;

for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const original = text;

  for (const [regex, value] of replacements) {
    text = text.replace(regex, value);
  }

  // Remove emojis quebrados que aparecem como ðŸ...
  text = text.replace(/\u00f0[\u0080-\uffff]{1,7}/g, "");

  // Remove caracteres de substituição quebrados.
  text = text.replace(/\uFFFD/g, "");

  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    changed++;
  }
}

console.log(`Arquivos verificados: ${files.length}`);
console.log(`Arquivos corrigidos: ${changed}`);
