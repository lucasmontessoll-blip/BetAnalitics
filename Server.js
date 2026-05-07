const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 SUA CHAVE DE PRODUÇÃO (DINHEIRO REAL)
const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-5947285218976034-050113-a9857b202a29e411236349f75b6b25c3-669622996'
});

app.post('/api/processar-pagamento', async (req, res) => {
  try {
    const payment = new Payment(client);

    const body = {
      transaction_amount: Number(req.body.transaction_amount),
      description: 'Pagamento Assinatura VIP PRO',
      payment_method_id: 'pix',
      payer: {
        email: req.body.payer.email,
        first_name: req.body.payer.first_name,
        identification: {
            type: "CPF",
            number: req.body.payer.identification.number
        }
      }
    };

    const result = await payment.create({ body });

    // Verificação Mestra: Se o Mercado Pago não enviou o link do QR, bloqueia!
    if (!result.point_of_interaction) {
        return res.status(400).json({ error: "Banco bloqueou a geração. Motivo: CPF inválido ou uso da mesma conta." });
    }

    // Retorna exatamente como a sua ideia pediu:
    res.json({
      status: result.status, // Vai voltar como "pending"
      qr_code: result.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (error) {
    console.error("ERRO DO BANCO:", error);
    res.status(500).json({ error: 'Erro interno ao gerar Pix. Verifique logs do Render.' });
  }
});

// Apenas para não quebrar o seu front-end quando carrega
app.get('/api/match', (req, res) => {
    res.json({ fixtures: [] });
});

app.listen(process.env.PORT || 3000, () => console.log('🚀 Servidor rodando'));