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
// ⚠️ ALERTA DE SEGURANÇA: Mais tarde, deves colocar este Token nas 
// Variáveis de Ambiente (Environment Variables) do Render!
// =========================================================================
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-2548637752713726-042717-43ca72e6d42cc6ff579b9d6ea7497b75-3344260552' });

// =========================================================================
// 🚀 PROCESSAMENTO DE PAGAMENTOS (NÍVEL PROFISSIONAL)
// =========================================================================
app.post('/api/processar-pagamento', async (req, res) => {
    try {
        const { transaction_amount, payer, payment_method_id, token, installments, issuer_id } = req.body;

        // 1. Validações Iniciais Rigorosas
        if (!transaction_amount) return res.status(400).json({ error: "Valor obrigatório", motivo: "Falta o valor da transação." });
        if (!payer || !payer.email) return res.status(400).json({ error: "Email obrigatório", motivo: "O e-mail do pagador está ausente." });

        // 2. Validação Exclusiva para PIX (CPF Obrigatório Real)
        if (payment_method_id === 'pix') {
            if (!payer.identification || !payer.identification.number) {
                return res.status(400).json({ error: "CPF obrigatório para PIX", motivo: "O Banco Central exige um CPF válido para gerar o PIX." });
            }
        }

        // 3. Montagem do Pacote Seguro (Sem espalhar lixo do Frontend)
        const paymentData = {
            transaction_amount: Number(transaction_amount),
            description: "Assinatura VIP PRO - BetAnalytics",
            payment_method_id: payment_method_id,
            payer: {
                email: payer.email,
                first_name: payer.first_name || "Cliente",
                last_name: payer.last_name || "VIP",
                identification: payer.identification
            }
        };

        // 4. Adiciona dados específicos se for Cartão de Crédito/Débito
        if (token) paymentData.token = token;
        if (installments) paymentData.installments = Number(installments);
        if (issuer_id) paymentData.issuer_id = issuer_id;

        const payment = new Payment(client);
        const result = await payment.create({ body: paymentData });

        // 5. Devolve o sucesso e o QR Code (se existir)
        res.status(200).json({
            status: result.status,
            id: result.id,
            qr_code: result.point_of_interaction?.transaction_data?.qr_code || null,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64 || null
        });

    } catch (error) {
        console.error("🔥 ERRO REAL NO BANCO:", error);
        res.status(400).json({ 
            error: "Falha no pagamento", 
            motivo: error.api_response?.message || error.message 
        });
    }
});

// =========================================================================
// ROTA DO SEU JSON DE ESTATÍSTICAS
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
        "league": { "name": "La Liga" }
    };
    res.json(SEU_JSON);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});