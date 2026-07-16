const fs = require("fs");

const file = "src/App.jsx";
let s = fs.readFileSync(file, "utf8");

// Remove qualquer bloco antigo do componente
s = s.replace(/\{?\s*\[?['"]jogos['"],\s*['"]inicio['"],\s*['"]home['"][\s\S]*?<JogosPorPaisContinente\b[\s\S]*?\/>\s*\)?\s*\}?/g, "");
s = s.replace(/<JogosPorPaisContinente\b[\s\S]*?\/>/g, "");

// Bloco correto: aparece somente na tela Inicio
const bloco = `
{String(viewMode).toLowerCase() === 'jogos' && String(menuAtivo || '').toLowerCase() !== 'copa' && (
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

// Insere logo depois da lista principal da tela Inicio
s = s.replace("<RenderizarListaJogos />", `<RenderizarListaJogos />\n${bloco}`);

fs.writeFileSync(file, s, "utf8");

console.log("Bloco Outras Partidas corrigido para aparecer somente no Inicio.");
