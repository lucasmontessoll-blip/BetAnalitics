const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// 💰 A SUA CHAVE DE PRODUÇÃO
const MP_TOKEN = 'APP_USR-5947285218976034-050113-a9857b202a29e411236349f75b6b25c3-669622996';

// 🔥 ROTA 1: CONEXÃO DIRETA COM O BANCO
app.post('/api/processar-pagamento', async (req, res) => {
    try {
        const payload = {
            transaction_amount: Number(req.body.transaction_amount || 29.90),
            description: "Assinatura VIP PRO - BetAnalytics",
            payment_method_id: req.body.payment_method_id,
            payer: {
                email: req.body.payer.email,
                first_name: req.body.payer.first_name,
                identification: {
                    type: "CPF",
                    number: req.body.payer.identification?.number
                }
            }
        };

        if (req.body.token) payload.token = req.body.token;
        if (req.body.installments) payload.installments = Number(req.body.installments);
        if (req.body.issuer_id) payload.issuer_id = req.body.issuer_id;

        // O Bypass: Falar direto com a API sem intermediários
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_TOKEN}`,
                'X-Idempotency-Key': Date.now().toString(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        // 🚨 SE DEU ERRO, O BANCO DIZ EXATAMENTE O PORQUÊ!
        if (!response.ok) {
            console.error("❌ ERRO DO BANCO:", result);
            return res.status(400).json({ error: JSON.stringify(result) });
        }

        const responseData = {
            status: result.status,
            status_detail: result.status_detail,
            id: result.id,
            raw_data: result 
        };

        if (req.body.payment_method_id === 'pix' && result.point_of_interaction) {
            responseData.qr_code = result.point_of_interaction.transaction_data?.qr_code;
            responseData.qr_code_base64 = result.point_of_interaction.transaction_data?.qr_code_base64;
        }

        res.status(200).json(responseData);

    } catch (error) {
        console.error("❌ ERRO INTERNO:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// POLLING - Consulta o status de pagamento
app.get('/api/status/:id', async (req, res) => {
    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${req.params.id}`, {
            headers: { 'Authorization': `Bearer ${MP_TOKEN}` }
        });
        const result = await response.json();
        res.json({ status: result.status });
    } catch (error) {
        res.status(500).json({ error: "Erro ao consultar" });
    }
});

app.post('/api/webhook', (req, res) => res.sendStatus(200));
app.get('/api/match', (req, res) => res.json({ fixtures: [] }));
app.get('/api/standings', (req, res) => res.json([]));

app.listen(process.env.PORT || 3000, () => {
    console.log('🚀 Motor Blindado (Direto na API) Rodando!');
});