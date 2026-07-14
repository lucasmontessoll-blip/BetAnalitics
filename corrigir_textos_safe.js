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

const R = [
  ["Ã¡", "á"], ["Ã ", "à"], ["Ã¢", "â"], ["Ã£", "ã"],
  ["Ã©", "é"], ["Ãª", "ê"],
  ["Ã­", "í"],
  ["Ã³", "ó"], ["Ã´", "ô"], ["Ãµ", "õ"],
  ["Ãº", "ú"],
  ["Ã§", "ç"],

  ["Ã", "Á"], ["Ã‰", "É"], ["Ã", "Í"], ["Ã“", "Ó"], ["Ãš", "Ú"], ["Ã‡", "Ç"],

  ["Âº", "º"], ["Âª", "ª"], ["Â·", "·"], ["Â ", " "],

  ["â€“", "-"], ["â€”", "-"], ["â€¦", "..."],
  ["â€˜", "'"], ["â€™", "'"], ["â€œ", '"'], ["â€", '"'],
  ["â€¢", "•"], ["â‰¥", "≥"], ["â‰¤", "≤"],

  ["ðŸ”Ž", ""], ["ðŸ”¥", ""], ["ðŸ“Š", ""], ["ðŸ“ˆ", ""],
  ["ðŸ¤–", "IA"], ["ðŸ†", ""], ["ðŸŽ¯", ""],
  ["âš½", ""], ["âš¡", ""], ["âœ…", ""], ["âŒ", ""],
  ["ï¸", ""],

  ["ðŸ‡§ðŸ‡·", ""], ["ðŸ‡¦ðŸ‡·", ""], ["ðŸ‡ºðŸ‡¾", ""],
  ["ðŸ‡¨ðŸ‡´", ""], ["ðŸ‡ªðŸ‡¨", ""], ["ðŸ‡µðŸ‡¾", ""],
  ["ðŸ‡µðŸ‡ª", ""], ["ðŸ‡¸ðŸ‡ª", ""], ["ðŸ‡®ðŸ‡¸", ""],
  ["ðŸ‡®ðŸ‡³", ""], ["ðŸ‡±ðŸ‡§", ""], ["ðŸ‡²ðŸ‡²", ""],
  ["ðŸ‡»ðŸ‡³", ""], ["ðŸ‡¦ðŸ‡º", ""], ["ðŸ‡¨ðŸ‡¦", ""],
  ["ðŸ‡¨ðŸ‡³", ""], ["ðŸ‡°ðŸ‡·", ""],
];

const files = walk(ROOT);
let changed = 0;

for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const original = text;

  for (let rodada = 0; rodada < 3; rodada++) {
    for (const [a, b] of R) {
      text = text.split(a).join(b);
    }
  }

  text = text.replace(/ðŸ.{0,6}/g, "");
  text = text.replace(/â€.{0,2}/g, "");
  text = text.replace(/âš./g, "");
  text = text.replace(/ï¸./g, "");
  text = text.replace(/Â/g, "");

  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    changed++;
  }
}

console.log("Arquivos verificados:", files.length);
console.log("Arquivos corrigidos:", changed);
