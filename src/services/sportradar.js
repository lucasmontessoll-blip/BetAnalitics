import axios from "axios";

export const buscarCompeticoes = async () => {
  try {
    const apiKey = import.meta.env.VITE_SPORTRADAR_KEY;
    
    // 1. Montamos a URL original da Sportradar
    const urlOriginal = `https://api.sportradar.com/soccer/trial/v4/en/competitions.json?api_key=${apiKey}`;
    
    // 2. Envolvemos a URL no Proxy para burlar o CORS no Render
    // O encodeURIComponent garante que os caracteres especiais do link não quebrem a requisição
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(urlOriginal)}`;
    
    // 3. Fazemos a chamada através do proxy
    const { data } = await axios.get(proxyUrl);
    
    return data;
  } catch (error) {
    console.error("Erro ao conectar com a Sportradar (via Proxy):", error);
    return null;
  }
};