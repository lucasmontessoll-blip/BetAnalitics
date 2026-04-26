const express = require('express');
const cors = require('cors');
const app = express();

// Permite que o seu Frontend converse com o Backend sem dar erro de CORS
app.use(cors({
  origin: '*',
  methods: ['GET','POST']
}));

app.use(express.json());

// =========================================================================
// ESSA É A ROTA QUE O SEU APP.JSX ESTÁ CHAMANDO!
// =========================================================================
app.get('/api/match', (req, res) => {
    
    // Aqui você pode ler a data que o Frontend mandou (opcional, se for usar na API real)
    const dataFiltro = req.query.date;

    // 1. AQUI FICA AQUELE JSON GIGANTE QUE VOCÊ ME MANDOU
    // (Eu encurtei aqui pra não ficar gigante, mas você cola ele inteiro dentro dessa variável)
    const SEU_JSON = {
        "fixtures": [
            {
                "id": 19439552,
                "name": "Celta de Vigo vs Real Oviedo",
                "starting_at": "2026-04-12 16:30:00",
                "status": "Finished",
                "result_info": "Real Oviedo won after full-time.",
                "scores": [{ "score": { "goals": 1 } }, { "score": { "goals": 2 } }],
                "odds": [
                    { "label": "Home", "value": "1.70" },
                    { "label": "Draw", "value": "3.30" },
                    { "label": "Away", "value": "4.50" }
                ],
                "participants": [
                    { "name": "Celta de Vigo", "image_path": "https://cdn.sportmonks.com/images/soccer/teams/4/36.png", "meta": { "location": "home" } },
                    { "name": "Real Oviedo", "image_path": "https://cdn.sportmonks.com/images/soccer/teams/29/93.png", "meta": { "location": "away" } }
                ]
            }
            // ... coloque o resto dos jogos da La Liga aqui ...
        ],
        "league": {
            "name": "La Liga"
        }
    };

    // 2. É AQUI QUE A MÁGICA ACONTECE!
    // O comando "res.json" pega o SEU_JSON e envia pela internet direto pro seu App.jsx
    res.json(SEU_JSON);
});

// Outras rotas do seu servidor (Login, PIX, IA)...
app.post('/api/login', (req, res) => { /* ... */ });
app.post('/api/analise-ia', (req, res) => { /* ... */ });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});