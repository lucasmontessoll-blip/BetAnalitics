const fs = require("fs");

const file = "src/App.jsx";
let s = fs.readFileSync(file, "utf8");

// Corrige titulo Pesquisa se ele existir sem emoji
s = s.replace(/title="Pesquisa"/g, "title={'\\u{1F50E} Pesquisa'}");
s = s.replace(/title=\{"Pesquisa"\}/g, "title={'\\u{1F50E} Pesquisa'}");

// Restaura os emojis dos cards principais usando Unicode seguro
s = s.replace(
  /const BUSCA_Equipes = \[[\s\S]*?\];/,
`const BUSCA_Equipes = [
  { tipo: 'time', nome: 'Brasil', sub: 'Sele\\u00e7\\u00e3o Brasileira', emoji: '\\u{1F1E7}\\u{1F1F7}' },
  { tipo: 'time', nome: 'Fran\\u00e7a', sub: 'Sele\\u00e7\\u00e3o Francesa', emoji: '\\u{1F1EB}\\u{1F1F7}' },
  { tipo: 'time', nome: 'Noruega', sub: 'Sele\\u00e7\\u00e3o Norueguesa', emoji: '\\u{1F1F3}\\u{1F1F4}' },
  { tipo: 'time', nome: 'Real Madrid', sub: 'Espanha', emoji: '\\u{26BD}' },
  { tipo: 'time', nome: 'FC Barcelona', sub: 'Espanha', emoji: '\\u{1F535}' },
  { tipo: 'time', nome: 'Manchester City', sub: 'Inglaterra', emoji: '\\u{1F535}' },
];`
);

s = s.replace(
  /const BUSCA_COMPETICOES = \[[\s\S]*?\];/,
`const BUSCA_COMPETICOES = [
  { tipo: 'competicao', nome: 'Brasileir\\u00e3o Betano', sub: 'Brasil', emoji: '\\u{1F1E7}\\u{1F1F7}' },
  { tipo: 'competicao', nome: 'FIFA Club World Cup', sub: 'Mundo', emoji: '\\u{1F30D}' },
  { tipo: 'competicao', nome: 'Liga dos Campe\\u00f5es', sub: 'Europa', emoji: '\\u{1F3C6}' },
  { tipo: 'competicao', nome: 'UEFA Liga Europa', sub: 'Europa', emoji: '\\u{1F3C6}' },
  { tipo: 'competicao', nome: 'Premier League', sub: 'Inglaterra', emoji: '\\u{1F3F4}' },
  { tipo: 'competicao', nome: 'LaLiga', sub: 'Espanha', emoji: '\\u{1F1EA}\\u{1F1F8}' },
];`
);

// Corrige textos principais sem deixar mojibake
s = s.replace(/competiÃ§Ãµes/g, "competi\\u00e7\\u00f5es");
s = s.replace(/sÃ³/g, "s\\u00f3");
s = s.replace(/seleÃ§Ãµes/g, "sele\\u00e7\\u00f5es");
s = s.replace(/SELEÃ‡Ã•ES/g, "SELE\\u00c7\\u00d5ES");

fs.writeFileSync(file, s, "utf8");

console.log("Emojis e acentos da Pesquisa restaurados com Unicode seguro.");
