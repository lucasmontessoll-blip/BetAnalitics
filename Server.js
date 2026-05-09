const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// 💰 A SUA CHAVE DE PRODUÇÃO
const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-5947285218976034-050113-a9857b202a29e411236349f75b6b25c3-669622996'
});

app.post('/api/processar-pagamento', async (req, res) => {
    try {
        const payment = new Payment(client);

        const paymentData = {
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

        if (req.body.token) paymentData.token = req.body.token;
        if (req.body.installments) paymentData.installments = Number(req.body.installments);
        if (req.body.issuer_id) paymentData.issuer_id = req.body.issuer_id;

        const result = await payment.create({ body: paymentData });

        const responseData = {
            status: result.status,
            status_detail: result.status_detail,
            id: result.id
        };

        if (req.body.payment_method_id === 'pix' && result.point_of_interaction) {
            responseData.qr_code = result.point_of_interaction.transaction_data.qr_code;
            responseData.qr_code_base64 = result.point_of_interaction.transaction_data.qr_code_base64;
        } else if (req.body.payment_method_id === 'pix') {
            // Se o banco aprovou mas não mandou o QR Code
            throw new Error("O Mercado Pago aceitou, mas não gerou a imagem do PIX. Verifique as permissões da sua conta.");
        }

        res.status(200).json(responseData);

    } catch (error) {
        console.error("❌ ERRO NO MERCADO PAGO:", JSON.stringify(error, null, 2));
        
        // 🔥 A MÁGICA DO RAIO-X: Extrair a mensagem exata do Banco!
        let mensagemErro = error.message;
        if (error.api_response && error.api_response.cause && error.api_response.cause.length > 0) {
            mensagemErro = error.api_response.cause[0].description; 
        } else if (error.api_response && error.api_response.message) {
            mensagemErro = error.api_response.message;
        }

        // Vai enviar o motivo exato para o seu pop-up no site
        res.status(400).json({ error: "Motivo da recusa do Banco: " + mensagemErro });
    }
});

// POLLING - Consulta o status
app.get('/api/status/:id', async (req, res) => {
    try {
        const payment = new Payment(client);
        const result = await payment.get({ id: req.params.id });
        res.json({ status: result.status });
    } catch (error) {
        res.status(500).json({ error: "Erro ao consultar status" });
    }
});

app.post('/api/webhook', async (req, res) => res.sendStatus(200));
app.get('/api/match', (req, res) => res.json({ fixtures: [] }));
app.get('/api/standings', (req, res) => res.json([]));

app.listen(process.env.PORT || 3000, () => {
    console.log('🚀 Servidor de Pagamentos com Raio-X Rodando!');
});