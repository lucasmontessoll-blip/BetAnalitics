import axios from "axios";

export const buscarCompeticoes = async () => {
  try {
    const { data } = await axios.get("/api/sportradar/competicoes");
    return data;
  } catch (error) { return null; }
};

// Nova função para buscar as partidas!
export const buscarJogosDeHoje = async () => {
  try {
    const { data } = await axios.get("/api/sportradar/jogos-hoje");
    return data;
  } catch (error) {
    console.error("Erro ao buscar jogos do dia:", error);
    return null;
  }
};