import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; // Garante a leitura do arquivo .env no backend

// Configuração obrigatória para usar rotas de ficheiros locais com ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================================
// 🧠 SISTEMA DE CACHE INTELIGENTE (Para economizar requisições da API)
// ============================================================================
let cacheCompeticoes = null;
let ultimaAtualizacaoSportradar = 0;
const TRINTA_MINUTOS = 30 * 60 * 1000; // Tempo em milissegundos

// A chave é declarada aqui no topo para ser usada em todas as rotas da Sportradar
const SPORTRADAR_KEY = process.env.VITE_SPORTRADAR_KEY || process.env.SPORTRADAR_KEY || '';

// ============================================================================
// 📊 ROTA 1: SPORTRADAR - COMPETIÇÕES (Com Cache de 30 minutos)
// ============================================================================
app.get('/api/sportradar/competicoes', async (req, res) => {
  try {
    const agora = Date.now();

    if (cacheCompeticoes && (agora - ultimaAtualizacaoSportradar < TRINTA_MINUTOS)) {
      console.log("⚽ Sportradar: Devolvendo dados completos do Cache (Gasto de API: 0)");
      return res.json(cacheCompeticoes);
    }

    if (!SPORTRADAR_KEY) {
      console.error("ERRO: Chave da Sportradar não encontrada no .env");
      return res.status(500).json({ error: 'SPORTRADAR_KEY não configurada no servidor.' });
    }

    console.log("📡 Sportradar: Cache expirado ou inexistente. Buscando novos dados na API oficial...");
    
    const { data } = await axios.get(
      `https://api.sportradar.com/soccer/trial/v4/en/competitions.json?api_key=${SPORTRADAR_KEY}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );

    cacheCompeticoes = data;
    ultimaAtualizacaoSportradar = agora;

    console.log(`✅ Novas competições salvas em cache com sucesso às ${new Date().toLocaleTimeString()}`);
    return res.json(data);

  } catch (error) {
    console.error('Erro Sportradar Backend:', error.response?.data || error.message);
    
    if (cacheCompeticoes) {
      console.log("⚠️ API falhou ou bateu limite de taxa. Devolvendo cache existente por segurança.");
      return res.json(cacheCompeticoes);
    }

    return res.status(error.response?.status || 500).json({
      error: 'Falha ao consultar Sportradar',
      details: error.response?.data || error.message
    });
  }
});

// ============================================================================
// ⚽ ROTA 2: SPORTRADAR - JOGOS DE HOJE (Summaries)
// ============================================================================
app.get("/api/sportradar/jogos-hoje", async (req, res) => {
  try {
    if (!SPORTRADAR_KEY) {
      return res.status(500).json({
        error: "SPORTRADAR_KEY não configurada no servidor."
      });
    }

    const hoje = new Date().toISOString().split("T")[0];

    const { data } = await axios.get(
      `https://api.sportradar.com/soccer/trial/v4/en/schedules/${hoje}/summaries.json`,
      {
        headers: {
          "x-api-key": SPORTRADAR_KEY,
          accept: "application/json"
        }
      }
    );

    return res.json(data);
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      error: "Falha ao buscar jogos da Sportradar",
      details: error.response?.data || error.message
    });
  }
});

// ============================================================================
// 🔑 CHAVES DE ACESSO ESSENCIAIS (Supabase, Gemini, Mercado Pago)
// ============================================================================
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pztznppbmonhrrzfbnvh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dHpucHBibW9uaHJyemZibnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTcwOTIsImV4cCI6MjA5NjE5MzA5Mn0.4ztEexACzSpsa0cikJjDlniXUeCnA-DPh20LQhg9qvM';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBKlaNtj0uEAJwOReTblDcLDGfpCjYqP18';
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-5947285218976034-050113-a9857b202a29e411236349f75b6b25c3-669622996';

// Inicializar Supabase e Gemini
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
let genAI;
if (GEMINI_API_KEY !== 'AIzaSyBKlaNtj0uEAJwOReTblDcLDGfpCjYqP18') {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// ============================================================================
// 💰 ROTA 3: GERAR PAGAMENTO PIX (E CRIAR USUÁRIO NO SUPABASE)
// ============================================================================
app.post('/api/processar-pagamento', async (req, res) => {
    const { payer, transaction_amount } = req.body;

    try {
        const { data: userExistente } = await supabase.from('usuarios').select('*').eq('email', payer.email).single();
        if (!userExistente) {
            await supabase.from('usuarios').insert([{ 
                nome: payer.first_name, 
                email: payer.email, 
                cpf: payer.identification?.number || '00000000000', 
                is_vip: false 
            }]);
        }

        const mpResponse = await axios.post('https://api.mercadopago.com/v1/payments', {
            transaction_amount: Number(transaction_amount),
            payment_method_id: 'pix',
            payer: payer,
            description: 'Assinatura VIP PRO - BetAnalytics'
        }, {
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'X-Idempotency-Key': Date.now().toString()
            }
        });

        res.json({
            id: mpResponse.data.id,
            qr_code: mpResponse.data.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: mpResponse.data.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (error) {
        console.error('Erro ao gerar pagamento:', error.response?.data || error.message);
        res.status(500).json({ error: 'Falha ao processar pagamento.' });
    }
});

// ============================================================================
// 🔔 ROTA 4: WEBHOOK DO MERCADO PAGO (ATIVA O VIP AUTOMATICAMENTE)
// ============================================================================
app.post('/api/webhook', async (req, res) => {
    const { type, data } = req.body;
    
    if (type === 'payment') {
        try {
            const paymentInfo = await axios.get(`https://api.mercadopago.com/v1/payments/${data.id}`, {
                headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
            });

            if (paymentInfo.data.status === 'approved') {
                const emailPagador = paymentInfo.data.payer.email;
                await supabase.from('usuarios').update({ is_vip: true }).eq('email', emailPagador);
                console.log(`🎉 VIP ATIVADO COM SUCESSO PARA: ${emailPagador}`);
            }
        } catch (err) {
            console.error("Erro no webhook:", err.message);
        }
    }
    res.status(200).send('OK');
});

// ============================================================================
// 🤖 ROTA 5: CÉREBRO DA IA (CHATBOT COM GEMINI)
// ============================================================================
app.post('/api/chat-ia', async (req, res) => {
    const { pergunta, dadosDaRodada } = req.body;

    if (!genAI) {
        return res.status(500).json({ resposta: "Erro: A chave da API do Gemini não está configurada no servidor." });
    }

    try {
        const promptMestre = `
        Tu és o Analista-Chefe de Inteligência Artificial do BetAnalytics PRO.
        És direto, profissional, falas com confiança e dás dicas de apostas baseadas em EV+ (Valor Esperado).
        
        Aqui estão os dados resumidos da rodada de hoje (Equipas e Odds):
        ${JSON.stringify(dadosDaRodada)}
        
        Responde à seguinte pergunta do utilizador de forma curta, analítica e indicando sempre que a decisão final é do utilizador. Usa no máximo 3 frases curtas.
        
        Pergunta do utilizador: "${pergunta}"
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(promptMestre);
        const respostaDaIA = result.response.text();

        res.json({ resposta: respostaDaIA });
    } catch (error) {
        console.error("Erro na IA:", error);
        res.status(500).json({ resposta: "O radar IA está a processar demasiados dados. Tente novamente em 5 segundos." });
    }
});

// ============================================================================
// ⚽ ROTA 6: LEITURA RÁPIDA DE JOGOS AO VIVO (CONSUMINDO DO SUPABASE)
// ============================================================================
app.get('/api/jogos-ao-vivo', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('jogos_ao_vivo')
            .select('*')
            .order('status', { ascending: true }) 
            .order('ultima_atualizacao', { ascending: false });

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error("Erro ao buscar jogos no Supabase:", error.message);
        res.status(500).json({ error: "Falha ao carregar jogos ao vivo." });
    }
});

// ============================================================================
// 🌐 ROTAS DE FRONTEND E ARQUIVOS ESTÁTICOS
// ============================================================================

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============================================================================
// 🚀 INICIALIZAR SERVIDOR
// ============================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Motor BetAnalytics PRO a correr na porta ${PORT}`);
});