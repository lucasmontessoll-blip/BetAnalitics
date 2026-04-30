const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(cors({ origin: '*', methods: ['GET','POST'] }));
app.use(express.json());

const client = new MercadoPagoConfig({ accessToken: 'APP_USR-2548637752713726-042717-43ca72e6d42cc6ff579b9d6ea7497b75-3344260552' });

app.post('/api/processar-pagamento', async (req, res) => {
    try {
        const { transaction_amount, payer, payment_method_id, token, installments, issuer_id } = req.body;

        const paymentData = {
            transaction_amount: Number(transaction_amount),
            description: "Assinatura VIP PRO - BetAnalytics",
            payment_method_id: payment_method_id,
            payer: {
                email: payer.email,
                first_name: payer.first_name || "Cliente",
                last_name: payer.last_name || "VIP",
                identification: {
                    type: "CPF",
                    number: payer.identification?.number?.replace(/\D/g, '')
                }
            }
        };

        // Adiciona dados de cartão apenas se não for PIX
        if (payment_method_id !== 'pix') {
            paymentData.token = token;
            paymentData.installments = Number(installments);
            paymentData.issuer_id = issuer_id;
        }

        const payment = new Payment(client);
        const result = await payment.create({ body: paymentData });

        res.status(200).json({
            status: result.status,
            status_detail: result.status_detail,
            id: result.id,
            qr_code: result.point_of_interaction?.transaction_data?.qr_code || null,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64 || null
        });

    } catch (error) {
        const erroMsg = error.api_response?.message || error.message;
        console.error("❌ ERRO NO BANCO:", erroMsg);
        res.status(400).json({ motivo: erroMsg });
    }
});

app.get('/api/match', (req, res) => {
    res.json({ fixtures: [{ id: 101, name: "Lucas vs Erro", starting_at: "2026-04-29 20:00:00", participants: [{ name: "BetAnalytics", image_path: "" }, { name: "Sucesso", image_path: "" }] }] });
});

app.listen(process.env.PORT || 3000, () => console.log(`🚀 Motor ligado!`));