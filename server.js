// ============================================================================
// 🚀 SISTEMA PROFISSIONAL MERCADO PAGO - BETANALYTICS PRO
// ✅ PIX & CRÉDITO/DÉBITO
// ✅ INTEGRAÇÃO TRANSPARENTE COM O APP.JSX
// ✅ WEBHOOK & STATUS REAL
// ============================================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const mercadopago = require("mercadopago");

const app = express();

// ============================================================================
// CONFIGURAÇÕES GERAIS
// ============================================================================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// MERCADO PAGO - (Busca o Token do Render ou usa um fallback)
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN || "APP_USR-c05e91db-5e62-4838-8790-e73906d11dbc" 
});

// DATABASE FAKE MEMÓRIA
const paymentsDB = new Map();

// LOGGER PROFISSIONAL
function log(title, data) {
  console.log("\n==============================");
  console.log(title);
  console.log("==============================");
  console.log(JSON.stringify(data, null, 2));
}

function generateInternalId() {
  return crypto.randomBytes(12).toString("hex");
}

// ============================================================================
// 🌉 PONTE DE CONEXÃO COM O APP.JSX (NÃO ALTERA NADA NO FRONT-END)
// ============================================================================

// Rota unificada que o seu app.jsx já chama hoje
app.post("/api/processar-pagamento", async (req, res) => {
  try {
    const internalId = generateInternalId();
    
    // O seu app.jsx envia esses dados exatos
    const { transaction_amount, payment_method_id, payer, token, issuer_id, installments } = req.body;

    if (!transaction_amount || !payer?.email) {
      return res.status(400).json({ error: true, message: "Valor ou Email inválido" });
    }

    // Monta o payload para o Mercado Pago com base na sua lógica
    const paymentData = {
      transaction_amount: Number(transaction_amount),
      description: "Assinatura VIP PRO - BetAnalytics",
      payment_method_id: payment_method_id,
      payer: payer,
      external_reference: internalId
    };

    // Se a compra for no cartão, o app.jsx manda esses campos extras
    if (payment_method_id !== "pix") {
      paymentData.token = token;
      paymentData.issuer_id = issuer_id;
      paymentData.installments = Number(installments || 1);
    }

    const response = await mercadopago.payment.create(paymentData);
    const payment = response.body;

    paymentsDB.set(internalId, payment);
    log(`PAGAMENTO CRIADO [${payment_method_id.toUpperCase()}]`, payment);

    // O app.jsx espera essas respostas exatas para desenhar a tela
    if (payment_method_id === "pix") {
        return res.json({
            success: true,
            id: payment.id, 
            status: payment.status,
            qr_code: payment.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64
        });
    } else {
        return res.json({
            success: true,
            status: payment.status,
            status_detail: payment.status_detail
        });
    }

  } catch (error) {
    console.log("ERRO CRÍTICO:", error);
    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// Rota que o seu app.jsx acessa a cada 3 segundos para checar se o PIX foi pago
app.get("/status/:id", async (req, res) => {
  try {
    const paymentId = req.params.id;
    const response = await mercadopago.payment.findById(paymentId);
    const payment = response.body;

    return res.json({
      success: true,
      status: payment.status,
      status_detail: payment.status_detail
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// ROTAS EXTRAS DO SEU CÓDIGO COMPLEXO (Para painel admin ou Webhooks)
// ============================================================================

app.post("/api/webhook", async (req, res) => {
  try {
    log("WEBHOOK RECEBIDO", req.body);
    const paymentId = req.body?.data?.id;
    if (!paymentId) return res.sendStatus(200);

    const response = await mercadopago.payment.findById(paymentId);
    log("PAGAMENTO ATUALIZADO PELO BANCO", response.body);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

app.get("/api/payments", async (req, res) => {
  const list = [];
  for (const [key, value] of paymentsDB.entries()) {
    list.push({ internal_id: key, payment_id: value.id, status: value.status, amount: value.transaction_amount });
  }
  return res.json({ success: true, total: list.length, payments: list });
});

app.get("/", (req, res) => {
  res.send("Motor BetAnalytics rodando 100%!");
});

// ============================================================================
// START SERVER
// ============================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n===========================================\n🚀 MOTOR BETANALYTICS ONLINE\n===========================================\nPORTA: ${PORT}\nMERCADO PAGO: OK\nAMBIENTE: PRODUÇÃO\n===========================================`);
});