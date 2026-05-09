const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// 💰 A SUA CHAVE DE PRODUÇÃO
const MP_TOKEN = 'APP_USR-5947285218976034-050113-a9857b202a29e411236349f75b6b25c3-669622996';

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

        // Conexão pura e direta com o Mercado Pago
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_TOKEN}`,
                'X-Idempotency-Key': Math.random().toString(), 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        // Se o banco rejeitou de cara (Ex: CPF falso)
        if (!response.ok) {
            return res.status(400).json({ error: "RECUSA DO BANCO: " + (result.message || JSON.stringify(result)) });
        }

        const responseData = {
            status: result.status,
            id: result.id,
            raw_data: result
        };

        // Se for PIX, tem de ter QR Code obrigatoriamente
        if (req.body.payment_method_id === 'pix') {
            if (result.point_of_interaction && result.point_of_interaction.transaction_data) {
                responseData.qr_code = result.point_of_interaction.transaction_data.qr_code;
                responseData.qr_code_base64 = result.point_of_interaction.transaction_data.qr_code_base64;
            } else {
                return res.status(400).json({ error: "A sua conta do Mercado Pago não tem o PIX ativado para receber pagamentos ou exige configurações extras. Resposta do banco: " + JSON.stringify(result) });
            }
        }

        res.status(200).json(responseData);

    } catch (error) {
        res.status(500).json({ error: "ERRO INTERNO NO SERVIDOR: " + error.message });
    }
});

// POLLING - Para aprovação automática
app.get('/api/status/:id', async (req, res) => {
    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${req.params.id}`, {
            headers: { 'Authorization': `Bearer ${MP_TOKEN}` }
        });
        const result = await response.json();
        res.json({ status: result.status });
    } catch (error) {
        res.status(500).json({ error: "Erro ao consultar status" });
    }
});

app.get('/api/match', (req, res) => res.json({ fixtures: [] }));
app.get('/api/standings', (req, res) => res.json([]));

app.listen(process.env.PORT || 3000, () => console.log('🚀 Motor Definitivo Rodando!'));