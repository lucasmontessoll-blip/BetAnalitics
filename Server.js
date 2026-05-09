const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// 💰 SUA CHAVE DE PRODUÇÃO (DINHEIRO REAL)
const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-5947285218976034-050113-a9857b202a29e411236349f75b6b25c3-669622996'
});

const payment = new Payment(client);

// ROTA 1: CRIAÇÃO DO PAGAMENTO (PIX e Cartão)
app.post('/api/processar-pagamento', async (req, res) => {
    try {
        const paymentData = {
            transaction_amount: Number(req.body.transaction_amount || 29.90),
            description: "Assinatura VIP PRO - BetAnalytics",
            payment_method_id: req.body.payment_method_id,
            payer: req.body.payer
        };

        // Se for Cartão, injeta o token seguro
        if (req.body.token) paymentData.token = req.body.token;
        if (req.body.installments) paymentData.installments = Number(req.body.installments);
        if (req.body.issuer_id) paymentData.issuer_id = req.body.issuer_id;

        const result = await payment.create({ body: paymentData });

        const responseData = {
            status: result.status, 
            status_detail: result.status_detail,
            id: result.id
        };

        // Se for PIX, envia o QR Code
        if (req.body.payment_method_id === 'pix' && result.point_of_interaction) {
            responseData.qr_code = result.point_of_interaction.transaction_data.qr_code;
            responseData.qr_code_base64 = result.point_of_interaction.transaction_data.qr_code_base64;
        }

        res.status(200).json(responseData);

    } catch (error) {
        console.error("❌ ERRO NA CRIAÇÃO:", error);
        res.status(400).json({ error: error.message || "Erro ao processar." });
    }
});

// ROTA 2: CONSULTA DE STATUS REAL (O Segredo da Aprovação Correta!)
app.get('/api/status/:id', async (req, res) => {
    try {
        const result = await payment.get({ id: req.params.id });
        res.json({ status: result.status });
    } catch (error) {
        console.error("ERRO AO CONSULTAR STATUS:", error);
        res.status(500).json({ error: "Erro ao consultar status" });
    }
});

// ROTA 3: WEBHOOK OBRIGATÓRIO (Prepara o terreno para o Mercado Pago)
app.post('/api/webhook', async (req, res) => {
    console.log("🔔 WEBHOOK DO MERCADO PAGO RECEBIDO:", req.body);
    res.sendStatus(200);
});

app.get('/api/match', (req, res) => res.json({ fixtures: [] }));
app.listen(process.env.PORT || 3000, () => console.log('🚀 Servidor Profissional com Webhook Rodando!'));