const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json());

// 🔥 AQUI ESTÁ A CHAVE DE TESTE PARA FORÇAR O QR CODE!
const MP_TOKEN = 'TEST-5947285218976034-050113-8141b78875423e38f63563300cc46bd5-669622996';

app.post('/api/processar-pagamento', async (req, res) => {
    try {
        // Truque para separar Nome e Sobrenome (o MP exige isso muitas vezes)
        const nomeCompleto = req.body.payer.first_name || "Cliente Teste";
        const partesNome = nomeCompleto.trim().split(' ');
        const primeiroNome = partesNome[0];
        const ultimoNome = partesNome.length > 1 ? partesNome.slice(1).join(' ') : "Silva";

        const payload = {
            transaction_amount: Number(req.body.transaction_amount || 29.90),
            description: "Assinatura VIP PRO - BetAnalytics",
            payment_method_id: req.body.payment_method_id || "pix",
            payer: {
                email: req.body.payer.email,
                first_name: primeiroNome,
                last_name: ultimoNome,
                identification: {
                    type: "CPF",
                    number: req.body.payer.identification?.number
                }
            }
        };

        if (req.body.token) payload.token = req.body.token;
        if (req.body.installments) payload.installments = Number(req.body.installments);
        if (req.body.issuer_id) payload.issuer_id = req.body.issuer_id;

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

        // Tratamento de Erro do Banco
        if (!response.ok) {
            return res.status(400).json({ error: "Recusa do Banco: " + (result.message || JSON.stringify(result)) });
        }

        // Se for PIX, vamos arrancar o QR Code à força
        if (payload.payment_method_id === 'pix') {
            if (result.point_of_interaction?.transaction_data?.qr_code_base64) {
                return res.status(200).json({
                    status: result.status,
                    id: result.id,
                    qr_code: result.point_of_interaction.transaction_data.qr_code,
                    qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
                    raw_data: result
                });
            } else {
                return res.status(400).json({ error: "O Banco não enviou a imagem. Detalhes: " + JSON.stringify(result) });
            }
        }

        // Se for Cartão
        res.status(200).json({ status: result.status, id: result.id, raw_data: result });

    } catch (error) {
        res.status(500).json({ error: "ERRO DO SERVIDOR: " + error.message });
    }
});

// POLLING - O Radar que verifica se o cliente pagou
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