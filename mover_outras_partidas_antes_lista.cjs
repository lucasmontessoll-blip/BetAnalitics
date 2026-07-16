const fs = require("fs");

const file = "src/App.jsx";
let s = fs.readFileSync(file, "utf8");

// Garante import
if (!s.includes("import JogosPorPaisContinente")) {
  s = s.replace(
    "import LegalCompliance from './components/LegalCompliance.jsx';",
    "import LegalCompliance from './components/LegalCompliance.jsx';\nimport JogosPorPaisContinente from './components/JogosPorPaisContinente.jsx';"
  );
}

// Remove chamadas antigas do componente para nao duplicar
s = s.replace(/<JogosPorPaisContinente\b[\s\S]*?\/>/g, "");

// Bloco fixo da tela Inicio
const bloco = `
<JogosPorPaisContinente
  jogos={jogos}
  favoritos={favoritos}
  onToggleFavorito={toggleFavorito}
  onAbrirJogo={(j) => {
    if (j.demo || String(j.id || '').startsWith('demo-home')) return setJogoSelecionado(j);
    if (!userData?.is_vip) return setMenuAtivo('assinar pro');
    setJogoSelecionado(j);
  }}
/>
`;

// Coloca SOMENTE na aba Inicio, antes do RenderizarListaJogos da tela viewMode === 'jogos'
const alvo = /(\{viewMode === 'jogos' && \([\s\S]*?<div className="px-4 w-full">)(\s*<RenderizarListaJogos \/>)/;

if (alvo.test(s)) {
  s = s.replace(alvo, "$1\n" + bloco + "\n$2");
  console.log("Outras partidas colocado antes da mensagem vazia na tela Inicio.");
} else {
  console.log("NAO ENCONTREI O BLOCO DA TELA INICIO.");
}

fs.writeFileSync(file, s, "utf8");
