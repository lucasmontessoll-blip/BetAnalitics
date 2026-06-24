// src/services/sportradar.js
import axios from "axios";

// Configuração base da API
const api = axios.create({
  baseURL: "https://api.sportradar.com",
  headers: {
    "x-api-key": import.meta.env.VITE_SPORTRADAR_KEY,
    accept: "application/json"
  }
});

// Função pronta para ser exportada e usada em qualquer lugar do App
export const buscarCompeticoes = async () => {
  try {
    const { data } = await api.get("/soccer/trial/v4/en/competitions.json");
    return data;
  } catch (error) {
    console.error("Erro ao conectar com a Sportradar:", error);
    return null;
  }
};

export default api;