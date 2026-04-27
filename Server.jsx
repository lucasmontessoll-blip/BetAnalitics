const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago'); // IMPORTAÇÃO DA BIBLIOTECA

const app = express();

// Permite que o seu Frontend converse com o Backend sem dar erro de CORS
app.use(cors({
  origin: '*',
  methods: ['GET','POST']
}));

app.use(express.json());

// =========================================================================
// 💳 CONFIGURAÇÃO DO MERCADO PAGO 
// A Public Key (APP_USR-4fa18e00-642d-4369-bc77-e8c68ed9c2a0) será usada no App.jsx!
// =========================================================================
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-2548637752713726-042717-43ca72e6d42cc6ff579b9d6ea7497b75-3344260552' });


// =========================================================================
// 🚀 NOVA ROTA: PROCESSAR PAGAMENTOS (CARTÃO E PIX)
// =========================================================================
app.post('/api/processar-pagamento', async (req, res) => {
    try {
        const body = {
            transaction_amount: req.body.transaction_amount,
            token: req.body.token, // O token seguro gerado pelo React
            description: 'Assinatura VIP PRO - BetAnalytics', // Nome que aparece na fatura do cliente
            installments: req.body.installments,
            payment_method_id: req.body.payment_method_id,
            issuer_id: req.body.issuer_id,
            payer: {
                email: req.body.payer.email,
            }
        };

        const payment = new Payment(client);
        const result = await payment.create({ body });

        // Devolvemos o status para o site saber se o banco aprovou ou recusou
        res.status(200).json({
            status: result.status,
            status_detail: result.status_detail,
            id: result.id
        });

    } catch (error) {
        console.error("Erro no pagamento:", error);
        res.status(500).json({ error: 'Falha ao processar o pagamento' });
    }
});


// =========================================================================
// ROTA DO SEU JSON DE ESTATÍSTICAS (MANTIDA 100% INTACTA)
// =========================================================================
app.get('/api/match', (req, res) => {
    
    // Aqui você pode ler a data que o Frontend mandou (opcional, se for usar na API real)
    const dataFiltro = req.query.date;

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
            // ... resto dos jogos da La Liga ...
        ],
        "league": {
            "name": "La Liga"
        }
    };

    res.json(SEU_JSON);
});

// Outras rotas do seu servidor (Login, PIX, IA)...
app.post('/api/login', (req, res) => { /* ... */ });
app.post('/api/analise-ia', (req, res) => { /* ... */ });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});