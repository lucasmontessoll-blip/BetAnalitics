import { useState, useEffect } from 'react';
import axios from 'axios';

export function useJogos(API_URL, ligaAtivaId, mockJogosData) {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarJogosDaRodada = async () => {
      setLoading(true);
      try {
        // Agora bate direto na API do backend em vez de carregar arquivo local!
        const response = await axios.get(`${API_URL}/api/dados`);
        const data = Array.isArray(response.data) ? response.data : (response.data.response || mockJogosData);
        const loadedJogos = data.filter(x => ligaAtivaId === null ? true : x.league_id === ligaAtivaId);
        setJogos(loadedJogos);
      } catch (error) {
        console.error("Erro na API, usando mock local por segurança.", error);
        const loadedJogos = mockJogosData.filter(x => ligaAtivaId === null ? true : x.league_id === ligaAtivaId);
        setJogos(loadedJogos);
      } finally {
        setLoading(false); 
      }
    };
    
    carregarJogosDaRodada();
  }, [ligaAtivaId, API_URL]);

  return { jogos, setJogos, loading };
}