const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// 🔥 CHAVE DE TESTE FORÇADA (Para garantir que o QR Code é gerado sempre)
const client = new MercadoPagoConfig({
    accessToken: 'TEST-5947285218976034-050113-8141b78875423e38f63563300cc46bd5-669622996'
});

app.post('/api/processar-pagamento', async (req, res) => {
    try {
        console.log("Recebendo pedido de PIX...", req.body); // Log para vermos no Render

        const { transaction_amount, payer, payment_method_id } = req.body;

        const paymentData = {
            transaction_amount: Number(transaction_amount),
            description: "Assinatura VIP PRO - BetAnalytics",
            payment_method_id: payment_method_id,
            payer: {
                email: payer?.email || "teste@teste.com",
                first_name: payer?.first_name || "Cliente",
                last_name: payer?.last_name || "VIP"
            }
        };

        if (payer?.identification?.number) {
            paymentData.payer.identification = {
                type: "CPF",
                number: payer.identification.number.replace(/\D/g, '')
            };
        }

        if (payment_method_id === 'pix') {
            paymentData.date_of_expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        }

        const payment = new Payment(client);
        const result = await payment.create({ body: paymentData });

        console.log("Resposta do Mercado Pago:", result.id); // Confirmação

        // Envia de volta para o App.jsx
        res.status(200).json({
            status: result.status,
            id: result.id,
            qr_code: result.point_of_interaction?.transaction_data?.qr_code || null,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64 || null
        });

    } catch (error) {
        console.error("❌ ERRO NO MERCADO PAGO:", error);
        res.status(400).json({ erro: error?.message || "Erro ao processar pagamento" });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('🚀 Servidor rodando!');
});