const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();

// Permite que o seu Frontend converse com o Backend
app.use(cors({
  origin: '*',
  methods: ['GET','POST']
}));

app.use(express.json());

// =========================================================================
// 💳 CONFIGURAÇÃO DO MERCADO PAGO 
// =========================================================================
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-2548637752713726-042717-43ca72e6d42cc6ff579b9d6ea7497b75-3344260552' });

// =========================================================================
// 🚀 ROTA DE PAGAMENTOS (AGORA COM CAPTURA DE QR CODE PIX)
// =========================================================================
app.post('/api/processar-pagamento', async (req, res) => {
    try {
        const body = {
            transaction_amount: req.body.transaction_amount,
            token: req.body.token, 
            description: 'Assinatura VIP PRO - BetAnalytics', 
            installments: req.body.installments,
            payment_method_id: req.body.payment_method_id,
            issuer_id: req.body.issuer_id,
            payer: {
                email: req.body.payer.email,
            }
        };

        const payment = new Payment(client);
        const result = await payment.create({ body });

        // 👇 A MÁGICA ACONTECE AQUI: Capturamos o QR Code do PIX se ele existir
        let qr_code = null;
        let qr_code_base64 = null;
        
        if (result.point_of_interaction && result.point_of_interaction.transaction_data) {
            qr_code = result.point_of_interaction.transaction_data.qr_code;
            qr_code_base64 = result.point_of_interaction.transaction_data.qr_code_base64;
        }

        // Devolvemos tudo mastigado para o React
        res.status(200).json({
            status: result.status,
            status_detail: result.status_detail,
            id: result.id,
            qr_code: qr_code,
            qr_code_base64: qr_code_base64
        });

    } catch (error) {
        console.error("Erro no pagamento:", error);
        res.status(500).json({ error: 'Falha ao processar o pagamento' });
    }
});

// =========================================================================
// ROTA DO SEU JSON DE ESTATÍSTICAS (MANTIDA INTACTA)
// =========================================================================
app.get('/api/match', (req, res) => {
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
        ],
        "league": {
            "name": "La Liga"
        }
    };
    res.json(SEU_JSON);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});