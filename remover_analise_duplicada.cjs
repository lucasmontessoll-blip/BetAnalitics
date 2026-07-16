const fs = require("fs");

const arquivos = [
  "src/App.jsx",
  "src/components/PainelJogo.jsx",
  "src/components/MercadosIACard.jsx"
].filter(fs.existsSync);

let totalRemovidos = 0;

for (const file of arquivos) {
  let s = fs.readFileSync(file, "utf8");
  const original = s;

  const regex = /<AnaliseRigorosaCard\b[\s\S]*?\/>/g;
  const matches = [...s.matchAll(regex)];

  if (matches.length > 1) {
    let contador = 0;

    s = s.replace(regex, (m) => {
      contador++;
      if (contador === 1) return m;
      totalRemovidos++;
      return "";
    });
  }

  if (s !== original) {
    fs.writeFileSync(file, s, "utf8");
    console.log("Corrigido:", file);
  }
}

console.log("Chamadas duplicadas removidas:", totalRemovidos);
