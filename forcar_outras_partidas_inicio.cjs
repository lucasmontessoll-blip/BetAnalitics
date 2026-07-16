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

// Remove chamadas antigas
s = s.replace(/\{String\(viewMode\)[\s\S]*?<JogosPorPaisContinente\b[\s\S]*?\/>\s*\)\}/g, "");
s = s.replace(/<div className="px-4 mt-8">\s*<JogosPorPaisContinente\b[\s\S]*?<\/div>/g, "");
s = s.replace(/<JogosPorPaisContinente\b[\s\S]*?\/>/g, "");

// Bloco fixo de outras partidas
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

// Tenta inserir logo depois da mensagem vazia da tela Inicio
let colocou = false;

const padroes = [
  /(<[^>]+>\s*Nenhuma oportunidade encontrada com estes filtros\.\s*<\/[^>]+>)/,
  /(<[^>]+>\s*Nenhum jogo retornado pela API-Football com estes filtros\.\s*<\/[^>]+>)/,
  /(Nenhuma oportunidade encontrada com estes filtros\.)/,
];

for (const p of padroes) {
  if (p.test(s)) {
    s = s.replace(p, "$1\n" + bloco);
    colocou = true;
    break;
  }
}

// Se nao encontrou a frase, coloca logo apos os filtros da tela Inicio
if (!colocou && s.includes("<RenderizarListaJogos />")) {
  s = s.replace("<RenderizarListaJogos />", "<RenderizarListaJogos />\n" + bloco);
  colocou = true;
}

// Ultimo recurso: coloca antes da renderizacao das outras abas
if (!colocou && s.includes("{viewMode === 'copa'")) {
  s = s.replace("{viewMode === 'copa'", bloco + "\n{viewMode === 'copa'");
  colocou = true;
}

fs.writeFileSync(file, s, "utf8");

console.log(colocou ? "Outras partidas inserido na tela Inicio." : "Nao consegui encontrar o ponto da tela Inicio.");
