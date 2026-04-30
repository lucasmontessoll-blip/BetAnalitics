const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(cors({ origin: '*', methods: ['GET','POST'] }));
app.use(express.json());

// Token de Acesso (Access Token) - Mantém este secreto!
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-2548637752713726-042717-43ca72e6d42cc6ff579b9d6ea7497b75-3344260552' });

app.post('/api/processar-pagamento', async (req, res) => {
    try {
        const { transaction_amount, payer, payment_method_id, token, installments, issuer_id } = req.body;

        // Construção base do pagamento
        const paymentData = {
            transaction_amount: Number(transaction_amount),
            description: "Assinatura VIP PRO - BetAnalytics",
            payment_method_id: payment_method_id,
            payer: {
                email: payer.email,
                identification: {
                    type: "CPF",
                    number: payer.identification?.number?.replace(/\D/g, '') // Remove pontos e traços
                }
            }
        };

        // Só adiciona dados de cartão se NÃO for PIX
        if (payment_method_id !== 'pix') {
            if (token) paymentData.token = token;
            if (installments) paymentData.installments = Number(installments);
            if (issuer_id) paymentData.issuer_id = issuer_id;
        }

        const payment = new Payment(client);
        const result = await payment.create({ body: paymentData });

        res.status(200).json({
            status: result.status,
            id: result.id,
            qr_code: result.point_of_interaction?.transaction_data?.qr_code || null,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64 || null
        });

    } catch (error) {
        // Log detalhado para veres no painel do Render
        console.error("❌ ERRO NA API DO MERCADO PAGO:", error.api_response?.data || error.message);
        res.status(400).json({ 
            error: "Falha na validação", 
            motivo: error.api_response?.data?.message || error.message 
        });
    }
});

// Rota de Estatísticas (MANTIDA 100%)
app.get('/api/match', (req, res) => {
    res.json({ fixtures: [{ id: 101, name: "Lucas vs Erro", starting_at: "2026-04-29 20:00:00", participants: [{ name: "BetAnalytics", image_path: "" }, { name: "Sucesso", image_path: "" }] }] });
});

app.listen(process.env.PORT || 3000, () => console.log(`🚀 Motor ligado!`));