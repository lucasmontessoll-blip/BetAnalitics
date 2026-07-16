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
s = s.replace(/<JogosPorPaisContinente\b[\s\S]*?\/>/g, "");

// Bloco que deve aparecer na tela Inicio
const bloco = `
<div className="px-4 mt-8">
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
</div>
`;

// Coloca exatamente depois da mensagem da tela Inicio
const padrao = /(<[^>]*>\s*Nenhuma oportunidade encontrada com estes filtros\.\s*<\/[^>]*>)/;

if (padrao.test(s)) {
  s = s.replace(padrao, `$1\n${bloco}`);
  console.log("Outras partidas inserido depois da mensagem da tela Inicio.");
} else if (s.includes("Nenhuma oportunidade encontrada com estes filtros.")) {
  s = s.replace(
    "Nenhuma oportunidade encontrada com estes filtros.",
    `Nenhuma oportunidade encontrada com estes filtros.\n${bloco}`
  );
  console.log("Outras partidas inserido por texto direto.");
} else {
  console.log("ATENCAO: nao encontrei a frase da tela Inicio.");
}

fs.writeFileSync(file, s, "utf8");
