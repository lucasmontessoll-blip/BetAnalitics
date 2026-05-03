const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ USE TOKEN DE PRODUÇÃO PRA PIX FUNCIONAR
const client = new MercadoPagoConfig({
    accessToken: 'SEU_ACCESS_TOKEN_PRODUCAO'
});

app.post('/api/processar-pagamento', async (req, res) => {
    try {
        const { transaction_amount, payer, payment_method_id } = req.body;

        const paymentData = {
            transaction_amount: Number(transaction_amount),
            description: "Assinatura VIP PRO - BetAnalytics",
            payment_method_id: payment_method_id,

            payer: {
                email: payer?.email || "comprador@email.com",
                first_name: payer?.first_name || "Cliente",
                last_name: payer?.last_name || "VIP",
                identification: {
                    type: "CPF",
                    number: payer?.identification?.number?.replace(/\D/g, '') || "12345678909"
                }
            },

            notification_url: "https://seusite.com/webhook",
            statement_descriptor: "BETANALYTICS"
        };

        // PIX
        if (payment_method_id === 'pix') {
            paymentData.date_of_expiration =
                new Date(Date.now() + 30 * 60 * 1000).toISOString();
        }

        const payment = new Payment(client);
        const result = await payment.create({ body: paymentData });

        res.status(200).json({
            status: result.status,
            status_detail: result.status_detail,
            id: result.id,
            qr_code: result.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64
        });

    } catch (error) {
        console.log("❌ ERRO COMPLETO:", error);

        res.status(400).json({
            erro: error?.cause?.[0]?.description || error.message
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('🚀 Servidor rodando!');
});