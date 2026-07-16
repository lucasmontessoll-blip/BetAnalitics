const fs = require("fs");

const file = "src/App.jsx";
let s = fs.readFileSync(file, "utf8");

// Remove imports duplicados
s = s.replace(/import JogosPorPaisContinente from ['"]\.\/components\/JogosPorPaisContinente\.jsx['"];\r?\n/g, "");

// Remove blocos condicionais antigos que tenham JogosPorPaisContinente
s = s.replace(/\{\s*viewMode\s*===\s*['"][^'"]+['"][\s\S]{0,200}?\&\&\s*\(\s*<JogosPorPaisContinente\b[\s\S]*?\/>\s*\)\s*\}/g, "");

// Remove qualquer chamada solta antiga
s = s.replace(/<JogosPorPaisContinente\b[\s\S]*?\/>/g, "");

// Adiciona UM import
if (s.includes("import LegalCompliance from './components/LegalCompliance.jsx';")) {
  s = s.replace(
    "import LegalCompliance from './components/LegalCompliance.jsx';",
    "import LegalCompliance from './components/LegalCompliance.jsx';\nimport JogosPorPaisContinente from './components/JogosPorPaisContinente.jsx';"
  );
} else {
  s = s.replace(
    "import './App.css';",
    "import './App.css';\nimport JogosPorPaisContinente from './components/JogosPorPaisContinente.jsx';"
  );
}

const blocoInicio = `
{['jogos', 'inicio', 'home'].includes(String(viewMode).toLowerCase()) && (
  <JogosPorPaisContinente
    jogos={jogos}
    favoritos={favoritos}
    onToggleFavorito={toggleFavorito}
    usarDemoQuandoVazio={true}
    onAbrirJogo={(j) => {
      if (j.demo || String(j.id || '').startsWith('demo-home')) return setJogoSelecionado(j);
      if (!userData?.is_vip) return setMenuAtivo('assinar pro');
      setJogoSelecionado(j);
    }}
  />
)}
`;

// Coloca somente depois da lista principal da tela Inicio
if (s.includes("<RenderizarListaJogos />")) {
  s = s.replace("<RenderizarListaJogos />", `<RenderizarListaJogos />\n${blocoInicio}`);
} else {
  console.log("ATENCAO: nao encontrei <RenderizarListaJogos /> no App.jsx");
}

fs.writeFileSync(file, s, "utf8");

console.log("Corrigido: Outras Partidas agora fica somente na tela Inicio.");
