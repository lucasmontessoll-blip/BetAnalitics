const fs = require("fs");

const file = "src/App.jsx";
let text = fs.readFileSync(file, "utf8");

// Remove campos visuais que estão quebrando como ðŸ...
text = text.replace(/emoji\s*:\s*'[^']*'/g, "emoji: ''");
text = text.replace(/emoji\s*:\s*"[^"]*"/g, 'emoji: ""');
text = text.replace(/icone\s*:\s*'[^']*'/g, "icone: ''");
text = text.replace(/icone\s*:\s*"[^"]*"/g, 'icone: ""');

// Corrige textos quebrados mais comuns da Pesquisa
const fixes = [
  ["ðŸ”Ž Pesquisa", "Pesquisa"],
  ["ðŸ”Ž", ""],
  ["ðŸ‘¥ Equipes", "Equipes"],
  ["ðŸ‘¤ Jogadores", "Jogadores"],
  ["ðŸ† Ranking", "Ranking"],
  ["ðŸŒ Ligas Principais", "Ligas Principais"],
  ["Times, jogadores, rankings e competiÃ§Ãµes em um sÃ³ lugar.", "Times, jogadores, rankings e competições em um só lugar."],
  ["competiÃ§Ãµes", "competições"],
  ["competiÃ§Ã£o", "competição"],
  ["seleÃ§Ãµes", "seleções"],
  ["SeleÃ§Ãµes", "Seleções"],
  ["sÃ³", "só"],
  ["SÃ£o", "São"],
  ["Sao Paulo", "São Paulo"],
  ["FrANÃ§a", "França"],
  ["FranÃ§a", "França"],
  ["Noruega", "Noruega"],
  ["MELHORES EQUIPES E SELEÃ‡Ã•ES", "MELHORES EQUIPES E SELEÇÕES"],
  ["MELHORES EQUIPES E SELE..ES", "MELHORES EQUIPES E SELEÇÕES"],
];

for (const [from, to] of fixes) {
  text = text.split(from).join(to);
}

// Remove qualquer emoji quebrado restante dentro do App.jsx
text = text.replace(/ðŸ.{0,8}/g, "");
text = text.replace(/ðY.{0,8}/g, "");
text = text.replace(/â€.{0,4}/g, "");
text = text.replace(/ï¸.{0,2}/g, "");

// Corrige acentos comuns restantes
const accentFixes = [
  ["Ã¡", "á"], ["Ã©", "é"], ["Ã­", "í"], ["Ã³", "ó"], ["Ãº", "ú"],
  ["Ã£", "ã"], ["Ãµ", "õ"], ["Ã§", "ç"],
  ["Ã¢", "â"], ["Ãª", "ê"], ["Ã´", "ô"],
  ["Ã", "Á"], ["Ã‰", "É"], ["Ã", "Í"], ["Ã“", "Ó"], ["Ãš", "Ú"],
  ["Ã‡", "Ç"],
  ["Â", ""],
];

for (const [from, to] of accentFixes) {
  text = text.split(from).join(to);
}

fs.writeFileSync(file, text, "utf8");
console.log("App.jsx corrigido para remover emojis/textos quebrados da Pesquisa.");
