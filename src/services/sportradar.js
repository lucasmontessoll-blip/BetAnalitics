import axios from "axios";

export const buscarCompeticoes = async () => {
  try {
    const { data } = await axios.get("/api/sportradar/competicoes");
    return data;
  } catch (error) {
    console.error("Erro ao buscar competições da Sportradar:", error);
    return null;
  }
};

export const buscarJogosHojeSportradar = async () => {
  try {
    const { data } = await axios.get("/api/sportradar/jogos-hoje");
    return data;
  } catch (error) {
    console.error("Erro ao buscar jogos Sportradar:", error);
    return null;
  }
};