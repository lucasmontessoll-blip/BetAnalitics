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
    } else if (/\.(js|jsx|css)$/i.test(full)) {
      files.push(full);
    }
  }

  return files;
}

function limparTexto(text) {
  let out = text;

  // Remove emojis normais e flags.
  out = out.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "");
  out = out.replace(/\p{Extended_Pictographic}/gu, "");

  // Remove emojis quebrados.
  out = out.replace(/ðŸ.{0,10}/g, "");
  out = out.replace(/ðY.{0,10}/g, "");
  out = out.replace(/â€.{0,5}/g, "");
  out = out.replace(/ï¸.{0,3}/g, "");

  // Remove acentos de textos fixos para impedir competições virar competiÃ§Ãµes.
  out = out.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Limpa sobras comuns.
  out = out.replace(/Â/g, "");
  out = out.replace(/Ã/g, "");

  // Remove fallback de emoji nos cards.
  out = out.replace(/emoji\s*:\s*'[^']*'/g, "emoji: ''");
  out = out.replace(/emoji\s*:\s*"[^"]*"/g, 'emoji: ""');
  out = out.replace(/icone\s*:\s*'[^']*'/g, "icone: ''");
  out = out.replace(/icone\s*:\s*"[^"]*"/g, 'icone: ""');

  // Se algum JSX usar item.emoji || 'emoji', remove o fallback.
  out = out.replace(/\{([a-zA-Z0-9_]+)\.emoji\s*\|\|\s*'[^']*'\}/g, "{$1.emoji}");
  out = out.replace(/\{([a-zA-Z0-9_]+)\.emoji\s*\|\|\s*"[^"]*"\}/g, "{$1.emoji}");

  return out;
}

const files = walk(ROOT);
let alterados = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  const novo = limparTexto(original);

  if (novo !== original) {
    fs.writeFileSync(file, novo, "utf8");
    alterados++;
  }
}

// Garante charset no index.html
const indexPath = path.join(process.cwd(), "index.html");

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, "utf8");

  if (!html.toLowerCase().includes("charset")) {
    html = html.replace("<head>", '<head>\n    <meta charset="UTF-8" />');
    fs.writeFileSync(indexPath, html, "utf8");
  }
}

console.log("Arquivos verificados:", files.length);
console.log("Arquivos alterados:", alterados);
console.log("Interface convertida para modo seguro sem emojis/acentos quebraveis.");
