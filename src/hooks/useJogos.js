import { useState, useEffect } from 'react';

export function useJogos(apiUrl, ligaAtivaId, mockJogosData) {
    const [jogos, setJogos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        
        // Simula o tempo de resposta de um servidor (500ms) e carrega os dados
        // sem tentar aceder à rota /api/dados inexistente.
        const timer = setTimeout(() => {
            try {
                const todosJogos = mockJogosData || [];
                
                // Filtra os jogos de acordo com a liga clicada no topo do App.jsx
                const jogosFiltrados = ligaAtivaId === null 
                    ? todosJogos 
                    : todosJogos.filter(j => j.league_id === ligaAtivaId);
                
                setJogos(jogosFiltrados);
            } catch (erro) {
                console.error("Erro ao carregar jogos:", erro);
                setJogos([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [ligaAtivaId, mockJogosData]);

    return { jogos, loading };
}