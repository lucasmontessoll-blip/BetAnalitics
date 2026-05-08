const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// 💰 A SUA CHAVE DE PRODUÇÃO (É isto que liga o dinheiro à sua conta)
const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-5947285218976034-050113-a9857b202a29e411236349f75b6b25c3-669622996'
});

app.post('/api/processar-pagamento', async (req, res) => {
    try {
        const payment = new Payment(client);

        // Montamos o corpo básico que serve tanto para PIX quanto para Cartões
        const paymentData = {
            transaction_amount: Number(req.body.transaction_amount || 29.90),
            description: "Assinatura VIP PRO - BetAnalytics",
            payment_method_id: req.body.payment_method_id,
            payer: req.body.payer
        };

        // Se for Cartão, o Mercado Pago exige estes dados extras que o Frontend nos envia
        if (req.body.token) paymentData.token = req.body.token;
        if (req.body.installments) paymentData.installments = Number(req.body.installments);
        if (req.body.issuer_id) paymentData.issuer_id = req.body.issuer_id;

        const result = await payment.create({ body: paymentData });

        // Montamos a resposta padrão
        const responseData = {
            status: result.status,           // 'pending' (PIX) ou 'approved'/'rejected' (Cartões)
            status_detail: result.status_detail,
            id: result.id
        };

        // Se for PIX, enviamos a imagem do QR Code junto
        if (req.body.payment_method_id === 'pix' && result.point_of_interaction) {
            responseData.qr_code = result.point_of_interaction.transaction_data.qr_code;
            responseData.qr_code_base64 = result.point_of_interaction.transaction_data.qr_code_base64;
        }

        res.status(200).json(responseData);

    } catch (error) {
        console.error("❌ ERRO NO MERCADO PAGO:", error);
        res.status(400).json({ error: error.message || "Erro ao processar o pagamento." });
    }
});

// Mantemos as rotas antigas ativas para não quebrar o seu site
app.get('/api/match', (req, res) => res.json({ fixtures: [] }));
app.get('/api/standings', (req, res) => res.json([]));

app.listen(process.env.PORT || 3000, () => {
    console.log('🚀 Servidor de Pagamentos Profissional Rodando!');
});