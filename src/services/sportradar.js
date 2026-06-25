import axios from "axios";

export const buscarCompeticoes = async () => {
  try {
    // Faz a chamada direta para a rota segura criada no seu server.js
    const { data } = await axios.get("/api/sportradar/competicoes");
    return data;
  } catch (error) {
    console.error("Erro ao conectar com o backend da Sportradar:", error);
    return null;
  }
};

export default buscarCompeticoes;