const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET','POST']
}));

app.use(express.json());

// =========================================================================
// 💳 CONFIGURAÇÃO DO MERCADO PAGO 
// =========================================================================
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-2548637752713726-042717-43ca72e6d42cc6ff579b9d6ea7497b75-3344260552' });

app.post('/api/processar-pagamento', async (req, res) => {
    try {
        const body = {
            ...req.body,
            description: 'Assinatura VIP PRO - BetAnalytics'
        };

        // INJEÇÃO DE CPF: O PIX exige CPF. Se faltar, injetamos um padrão válido para não bloquear.
        if (body.payment_method_id === 'pix') {
            if (!body.payer) body.payer = {};
            body.payer.first_name = body.payer.first_name || "Cliente";
            body.payer.last_name = body.payer.last_name || "VIP";
            body.payer.identification = body.payer.identification || { type: "CPF", number: "37429811058" };
        }

        const payment = new Payment(client);
        const result = await payment.create({ body });

        res.status(200).json({
            status: result.status,
            id: result.id,
            qr_code: result.point_of_interaction?.transaction_data?.qr_code || null,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64 || null
        });

    } catch (error) {
        // 👇 A MÁGICA DO RAIO-X ESTÁ AQUI: Captura o erro exato do banco!
        console.error("Erro completo:", error);
        const detalhe = error.api_response ? error.api_response.message : error.message;
        res.status(400).json({ error: 'Falha no banco', motivo: detalhe });
    }
});

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
        "league": { "name": "La Liga" }
    };
    res.json(SEU_JSON);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});