// Ficheiro: src/services/api.js
import axios from "axios";

// Instância base para a API Football
const api = axios.create({
  baseURL: "https://v3.football.api-sports.io",
  headers: {
    "x-apisports-key": import.meta.env.VITE_API_FOOTBALL_KEY || "SUA_CHAVE_AQUI"
  }
});

export const buscarEstatisticasJogo = async (fixtureId) => {
  try {
    // Em produção real:
    // const { data } = await api.get(`/fixtures/statistics?fixture=${fixtureId}`);
    // return data.response;
    
    // Mock para simulação enquanto não tem a chave ativada:
    return [
      { shotsOnGoal: 6, ballPossession: 65, corners: 8 }, 
      { shotsOnGoal: 2, ballPossession: 35, corners: 2 }
    ];
  } catch (error) {
    console.error("Erro na API Football:", error);
    return null;
  }
};

export const analisarPartidaAoVivo = (stats) => {
  if(!stats || stats.length < 2) return { confianca: 0, recomendacao: "Aguardando dados" };
  
  const casa = stats[0];
  const fora = stats[1];
  let score = 40; // Confiança base

  if (casa.shotsOnGoal > fora.shotsOnGoal) score += 20;
  if (casa.ballPossession > fora.ballPossession) score += 15;
  if (casa.corners > fora.corners) score += 10;

  return {
    confianca: Math.min(score, 99),
    recomendacao: score > 75 ? "Forte Tendência Casa" : score > 60 ? "Over Gols Sugerido" : "Mercado Indefinido"
  };
};