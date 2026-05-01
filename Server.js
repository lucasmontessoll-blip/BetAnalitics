const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();

app.use(cors({ origin: '*', methods: ['GET','POST'] }));
app.use(express.json());

// 🔥 TOKEN DE PRODUÇÃO (OBRIGATÓRIO PRA PIX FUNCIONAR)
const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-c05e91db-5e62-4838-8790-e73906d11dbc'
});

// 🚀 CRIAR PAGAMENTO PIX
app.post('/api/pix', async (req, res) => {
    try {
        const payment = new Payment(client);

        const result = await payment.create({
            body: {
                transaction_amount: Number(req.body.amount),
                description: "Plano VIP BetAnalytics",
                payment_method_id: "pix",
                payer: {
                    email: req.body.email
                },
                date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString()
            }
        });

        res.json({
            id: result.id,
            status: result.status,
            qr_code: result.point_of_interaction.transaction_data.qr_code,
            qr_base64: result.point_of_interaction.transaction_data.qr_code_base64
        });

    } catch (error) {
        console.log("ERRO:", error);
        res.status(500).json({ error: error.message });
    }
});


// 🔎 CONSULTAR STATUS DO PAGAMENTO
app.get('/api/status/:id', async (req, res) => {
    try {
        const payment = new Payment(client);
        const result = await payment.get({ id: req.params.id });

        res.json({
            status: result.status,
            status_detail: result.status_detail
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log("🚀 PIX rodando na porta 3000"));