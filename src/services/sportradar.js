import axios from "axios";

// Busca lista de competições da Sportradar via backend
export const buscarCompeticoes = async () => {
  try {
    const { data } = await axios.get("/api/sportradar/competicoes");
    return data;
  } catch (error) {
    console.error("Erro ao conectar com o backend da Sportradar:", error);
    return null;
  }
};

// Busca jogos de hoje da Sportradar via backend
export const buscarJogosDeHoje = async () => {
  try {
    const { data } = await axios.get("/api/sportradar/jogos-hoje");
    return data;
  } catch (error) {
    console.error("Erro ao buscar jogos de hoje da Sportradar:", error);
    return null;
  }
};

export default {
  buscarCompeticoes,
  buscarJogosDeHoje
};