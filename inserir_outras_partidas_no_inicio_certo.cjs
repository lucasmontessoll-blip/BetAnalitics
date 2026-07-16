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

// Remove chamadas antigas para nao duplicar
s = s.replace(/\{String\(viewMode\)[\s\S]*?<JogosPorPaisContinente\b[\s\S]*?\/>\s*\)\}/g, "");
s = s.replace(/<div className="px-4 mt-8">[\s\S]*?<JogosPorPaisContinente\b[\s\S]*?<\/div>/g, "");
s = s.replace(/<div className="px-4 mt-6">[\s\S]*?<JogosPorPaisContinente\b[\s\S]*?<\/div>/g, "");
s = s.replace(/<JogosPorPaisContinente\b[\s\S]*?\/>/g, "");

// Bloco que vai aparecer dentro do Inicio
const outrasPartidas = `
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

// Insere exatamente dentro da div da tela Inicio, depois de RenderizarListaJogos
const alvo = '<div className="px-4 w-full"><RenderizarListaJogos />';
const troca = '<div className="px-4 w-full"><RenderizarListaJogos />\n' + outrasPartidas;

if (!s.includes(alvo)) {
  console.log("NAO ENCONTREI O PONTO EXATO: <div className=\"px-4 w-full\"><RenderizarListaJogos />");
} else {
  s = s.replace(alvo, troca);
  console.log("Outras partidas inserido dentro da tela Inicio.");
}

fs.writeFileSync(file, s, "utf8");
