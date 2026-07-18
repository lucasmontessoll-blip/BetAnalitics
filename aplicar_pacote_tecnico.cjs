const fs = require('fs');

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
  console.log('Atualizado:', file);
}

function addImportAfterLastImport(code, importLine) {
  if (code.includes(importLine)) return code;

  const matches = [...code.matchAll(/^import .+;$/gm)];
  if (!matches.length) return importLine + '\n' + code;

  const last = matches[matches.length - 1];
  const end = last.index + last[0].length;

  return code.slice(0, end) + '\n' + importLine + code.slice(end);
}

function findMatchingParen(src, openIndex) {
  let quote = null;
  let depth = 0;

  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i];
    const prev = src[i - 1];

    if (quote) {
      if (ch === quote && prev !== '\\') quote = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '(') depth++;
    if (ch === ')') depth--;

    if (depth === 0) return i;
  }

  return -1;
}

function replaceViewBlock(code, view, newBlock) {
  const marker = `{viewMode === '${view}' &&`;
  const start = code.indexOf(marker);

  if (start === -1) {
    console.log('AVISO: bloco nao encontrado:', view);
    return code;
  }

  const paren = code.indexOf('(', start);
  if (paren === -1) return code;

  const closeParen = findMatchingParen(code, paren);
  if (closeParen === -1) return code;

  let end = closeParen + 1;

  while (/\s/.test(code[end] || '')) end++;
  if (code[end] === '}') end++;

  return code.slice(0, start) + newBlock + code.slice(end);
}

// =========================
// App.jsx
// =========================
const appFile = 'src/App.jsx';

if (fs.existsSync(appFile)) {
  let app = read(appFile);

  app = addImportAfterLastImport(app, "import ConfiguracoesPro from './components/ConfiguracoesPro.jsx';");
  app = addImportAfterLastImport(app, "import ModoDemoBadge from './components/ModoDemoBadge.jsx';");
  app = addImportAfterLastImport(app, "import ModoDemoPro from './components/ModoDemoPro.jsx';");

  const configBlock = `{viewMode === 'config' && (
<ConfiguracoesPro
  userData={userData}
  setViewMode={setViewMode}
  solicitarPermissaoNotificacao={solicitarPermissaoNotificacaoApp}
  setAiOpen={setAiOpen}
  setAiQuery={setAiQuery}
  modoDemo={MODO_DEMONSTRACAO}
/>
)}
`;

  app = replaceViewBlock(app, 'config', configBlock);

  if (!app.includes("viewMode === 'modo-demo'")) {
    const modoDemoBlock = `{viewMode === 'modo-demo' && (
<ModoDemoPro setViewMode={setViewMode} />
)}
`;

    const marker = "{viewMode === 'config' &&";
    if (app.includes(marker)) {
      app = app.replace(marker, modoDemoBlock + '\n' + marker);
    } else {
      app = app.replace('<AnimatePresence>', modoDemoBlock + '\n<AnimatePresence>');
    }
  }

  if (!app.includes('<ModoDemoBadge')) {
    app = app.replace(
      '</header>',
      `</header>
<ModoDemoBadge modoDemo={MODO_DEMONSTRACAO} setViewMode={setViewMode} />`
    );
  }

  app = app.replace(/<PainelJogo\b([^>]*?)\/>/g, (match, attrs) => {
    let out = match;
    if (!out.includes('setAiOpen=')) {
      out = out.replace('/>', ' setAiOpen={setAiOpen} />');
    }
    if (!out.includes('setAiQuery=')) {
      out = out.replace('/>', ' setAiQuery={setAiQuery} />');
    }
    return out;
  });

  write(appFile, app);
}

// =========================
// main.jsx com ErrorBoundary
// =========================
const mainFile = 'src/main.jsx';

if (fs.existsSync(mainFile)) {
  let main = read(mainFile);

  main = addImportAfterLastImport(main, "import ErrorBoundary from './components/ErrorBoundary.jsx'");

  if (!main.includes('<ErrorBoundary>')) {
    main = main.replace('<App />', '<ErrorBoundary>\n      <App />\n    </ErrorBoundary>');
  }

  write(mainFile, main);
}

// =========================
// Corrige fixtureId no ApiFootballMatchCenter
// =========================
const matchCenterFile = 'src/components/apiFootball/ApiFootballMatchCenter.jsx';

if (fs.existsSync(matchCenterFile)) {
  let mc = read(matchCenterFile);

  mc = mc.replace(/fixture:\s*fixtureId/g, 'fixtureId');

  write(matchCenterFile, mc);
}

// =========================
// Perfil: liga botões para telas novas
// =========================
const perfilFile = 'src/components/Perfil.jsx';

if (fs.existsSync(perfilFile)) {
  let perfil = read(perfilFile);

  perfil = perfil.replace(
    /acao:\s*\(\)\s*=>\s*setViewMode\?\.\('jogos'\)/g,
    "acao: () => setViewMode?.('favoritos')"
  );

  perfil = perfil.replace(
    /acao:\s*solicitarPermissaoNotificacao/g,
    "acao: () => setViewMode?.('config')"
  );

  perfil = perfil.replace(
    /const abrirPlanoPro = \(\) => \{[\s\S]*?\n  \};/,
    `const abrirPlanoPro = () => {
    setViewMode?.('vip-pro');
  };`
  );

  perfil = perfil.replace(/setViewMode\?\.\('assinar-pro'\)/g, "setViewMode?.('vip-pro')");

  write(perfilFile, perfil);
}

// =========================
// Padroniza e-mail suporte
// =========================
const legalFile = 'src/components/LegalCompliance.jsx';

if (fs.existsSync(legalFile)) {
  let legal = read(legalFile);

  legal = legal.replace(/seuemail@exemplo\.com/g, 'betanlyticspro@gmail.com');
  legal = legal.replace(/betanalyticspro@gmail\.com/g, 'betanlyticspro@gmail.com');

  write(legalFile, legal);
}

// =========================
// Server: remove fallback duplicado e deixa rotas reais responderem demo sem chave
// =========================
const serverFile = 'server.js';

if (fs.existsSync(serverFile)) {
  let server = read(serverFile);

  server = server.replace(
    /\/\/ ===== ROTA_FALLBACK_API_FOOTBALL_SEM_404 =====[\s\S]*?\/\/ ===== FIM ROTA_FALLBACK_API_FOOTBALL_SEM_404 =====\s*/g,
    ''
  );

  function insertAfterTry(routeStart, marker, snippet) {
    const routePos = server.indexOf(routeStart);
    if (routePos === -1) return;

    const routeEnd = server.indexOf('\n});', routePos);
    const routeText = routeEnd !== -1 ? server.slice(routePos, routeEnd) : server.slice(routePos, routePos + 1500);

    if (routeText.includes(marker)) return;

    const tryPos = server.indexOf('try {', routePos);
    if (tryPos === -1) return;

    const insertPos = tryPos + 'try {'.length;
    server = server.slice(0, insertPos) + '\n' + snippet + server.slice(insertPos);
  }

  insertAfterTry(
    "app.get('/api/football/jogos'",
    'MODO_DEMO_SEM_CHAVE_JOGOS',
    `    // MODO_DEMO_SEM_CHAVE_JOGOS
    if (!API_FOOTBALL_KEY) {
      return res.json({
        ok: true,
        fonte: 'api-football',
        modo: 'demo',
        count: 0,
        jogos: [],
        response: []
      });
    }
`
  );

  insertAfterTry(
    "app.get('/api/football/jogo/:fixtureId'",
    'MODO_DEMO_SEM_CHAVE_JOGO',
    `    // MODO_DEMO_SEM_CHAVE_JOGO
    if (!API_FOOTBALL_KEY) {
      return res.json({
        ok: true,
        fonte: 'api-football',
        modo: 'demo',
        fixture: null,
        statistics: [],
        events: [],
        lineups: [],
        players: [],
        odds: [],
        oddsLive: [],
        injuries: [],
        h2h: [],
        predictions: null
      });
    }
`
  );

  insertAfterTry(
    "app.get('/api/football/pacote-completo/:fixtureId'",
    'MODO_DEMO_SEM_CHAVE_PACOTE',
    `    // MODO_DEMO_SEM_CHAVE_PACOTE
    if (!API_FOOTBALL_KEY) {
      return res.json({
        ok: true,
        fonte: 'api-football',
        modo: 'demo',
        fixture: null,
        statistics: [],
        events: [],
        lineups: [],
        players: [],
        injuries: [],
        predictions: null,
        odds: [],
        oddsLive: [],
        h2h: []
      });
    }
`
  );

  insertAfterTry(
    "app.get('/api/football/classificacao'",
    'MODO_DEMO_SEM_CHAVE_CLASSIFICACAO',
    `    // MODO_DEMO_SEM_CHAVE_CLASSIFICACAO
    if (!API_FOOTBALL_KEY) {
      return res.json({
        ok: true,
        fonte: 'api-football',
        modo: 'demo',
        standings: []
      });
    }
`
  );

  write(serverFile, server);
}

console.log('');
console.log('OK: pacote tecnico aplicado.');
console.log('Agora o build sera executado pelo PowerShell.');
