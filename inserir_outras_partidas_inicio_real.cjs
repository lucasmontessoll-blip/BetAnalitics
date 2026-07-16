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

// Remove chamadas antigas para evitar duplicidade
s = s.replace(/\{String\(viewMode\)[\s\S]*?<JogosPorPaisContinente\b[\s\S]*?\/>\s*\)\}/g, "");
s = s.replace(/<div className="px-4 mt-8">\s*<JogosPorPaisContinente\b[\s\S]*?<\/div>/g, "");
s = s.replace(/<div className="px-4 mt-6">\s*\{String\(viewMode\)[\s\S]*?<JogosPorPaisContinente\b[\s\S]*?<\/div>/g, "");
s = s.replace(/<JogosPorPaisContinente\b[\s\S]*?\/>/g, "");

const bloco = `
<div className="px-4 mt-6">
  {String(viewMode).toLowerCase() === 'jogos' && (
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
  )}
</div>
`;

let colocou = false;

// Caso 1: texto dentro de uma tag normal
const padroes = [
  /Nenhuma oportunidade encontrada com estes filtros\.(?:'|"|`)?\s*\}?\s*<\/p>/,
  /Nenhuma oportunidade encontrada com estes filtros\.(?:'|"|`)?\s*\}?\s*<\/h[1-6]>/,
  /Nenhuma oportunidade encontrada com estes filtros\.(?:'|"|`)?\s*\}?\s*<\/div>/,
  /Nenhuma oportunidade encontrada com estes filtros\.(?:'|"|`)?\s*\}?\s*<\/span>/,
];

for (const padrao of padroes) {
  if (padrao.test(s)) {
    s = s.replace(padrao, (m) => m + "\n" + bloco);
    colocou = true;
    break;
  }
}

// Fallback: antes do rodape fixo, mas ainda fora do rodape
if (!colocou) {
  const rodape = /(<(?:div|nav)\s+className=["'][^"']*fixed[^"']*bottom-0[^"']*["'])/;

  if (rodape.test(s)) {
    s = s.replace(rodape, bloco + "\n$1");
    colocou = true;
  }
}

fs.writeFileSync(file, s, "utf8");

console.log(colocou ? "Outras partidas inserido na tela Inicio." : "NAO ENCONTREI O PONTO CERTO.");
