const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));

app.use(express.json());

// ⚠️ TOKEN TEST (pode falhar PIX — ideal depois usar produção)
const client = new MercadoPagoConfig({
    accessToken: 'TEST-5947285218976034-050113-8141b78875423e38f63563300cc46bd5-669622996'
});

app.post('/api/processar-pagamento', async (req, res) => {
    try {
        const {
            transaction_amount,
            payer,
            payment_method_id,
            token,
            installments,
            issuer_id
        } = req.body;

        // ✅ BASE CORRIGIDA PARA TODOS (PIX E CARTÃO)
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

        // ✅ Adiciona o CPF para TODOS (Obrigatório para PIX e Cartão)
        if (payer?.identification?.number) {
            paymentData.payer.identification = {
                type: "CPF",
                number: payer.identification.number.replace(/\D/g, '')
            };
        }

        // ✅ SE FOR PIX
        if (payment_method_id === 'pix') {
            paymentData.date_of_expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        }

        // ✅ SE FOR CARTÃO
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
        console.log("❌ ERRO COMPLETO:", error);

        const erroMsg =
            error?.cause?.[0]?.description ||
            error?.message ||
            "Erro desconhecido";

        res.status(400).json({
            erro: erroMsg
        });
    }
});

// ROTA TESTE
app.get('/api/match', (req, res) => {
    res.json({
        fixtures: [
            {
                id: 101,
                name: "Lucas vs Erro",
                starting_at: "2026-04-29 20:00:00",
                participants: [
                    { name: "BetAnalytics", image_path: "" },
                    { name: "Sucesso", image_path: "" }
                ]
            }
        ]
    });
});

// START
app.listen(process.env.PORT || 3000, () => {
    console.log('🚀 Servidor rodando!');
});