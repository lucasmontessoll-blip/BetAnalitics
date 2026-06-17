import { useState } from 'react';
import axios from 'axios';

export function useIA(API_URL, jogos, setJogoSelecionado) {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ role: 'assistant', text: "Olá! Sou o motor IA do BetAnalytics. Qual é a sua dúvida?" }]);

  const handleAskAI = async (e) => {
    e?.preventDefault();
    if(!aiQuery.trim() || aiLoading) return;
    setAiMessages(prev => [...prev, { role: 'user', text: aiQuery }]);
    const perguntaAtual = aiQuery; 
    setAiQuery(''); 
    setAiLoading(true);
    try {
        const resumoJogos = jogos.map(j => `${j.home_team} vs ${j.away_team}`).join(", ");
        const resposta = await axios.post(`${API_URL}/api/chat-ia`, { pergunta: perguntaAtual, dadosDaRodada: resumoJogos || "Sem jogos no momento" });
        setAiMessages(prev => [...prev, { role: 'assistant', text: resposta.data.resposta }]);
    } catch (error) { 
        setAiMessages(prev => [...prev, { role: 'assistant', text: "Falha de comunicação." }]); 
    } finally { 
        setAiLoading(false); 
    }
  };

  const gerarExplicacaoIA = async (jogo) => {
    setJogoSelecionado(prev => ({...prev, is_loading_explanation: true}));
    const promptGemini = `Você é um analista profissional.\nJogo: ${jogo.home_team} x ${jogo.away_team}\nConfiança: ${jogo.confianca_ia}%\nOdd: ${jogo.odd_principal}\nExplique:\n1 Motivos da entrada\n2 Riscos\n3 Melhor mercado\n4 Gestão recomendada\n5 Conclusão final\nResposta curta e estruturada em tópicos.`;
    try {
        const resposta = await axios.post(`${API_URL}/api/chat-ia`, { pergunta: promptGemini, dadosDaRodada: jogo });
        setJogoSelecionado(prev => ({...prev, explanation: resposta.data.resposta, is_loading_explanation: false}));
    } catch (e) { 
        setJogoSelecionado(prev => ({...prev, explanation: "Análise forte indica superioridade e EV+ no mercado.", is_loading_explanation: false})); 
    }
  };

  return { aiOpen, setAiOpen, aiQuery, setAiQuery, aiLoading, aiMessages, handleAskAI, gerarExplicacaoIA };
}