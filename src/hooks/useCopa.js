import { useEffect, useState } from 'react';
import { buscarJogosCopa } from '../services/apiFootball.js';

const CACHE_KEY = 'bet_analytics_copa_dados';
const CACHE_TIME_KEY = 'bet_analytics_copa_timestamp';
const QUATRO_HORAS = 4 * 60 * 60 * 1000; // Tempo em milissegundos

export function useCopa() {
    const [jogosCopa, setJogosCopa] = useState([]);
    const [loadingCopa, setLoadingCopa] = useState(true);

    useEffect(() => {
        async function carregar() {
            setLoadingCopa(true);
            
            const cacheSalvo = localStorage.getItem(CACHE_KEY);
            const tempoDoCache = localStorage.getItem(CACHE_TIME_KEY);
            const agora = Date.now();

            // 🛡️ ENGENHARIA DE CACHE: Se o cache existir e tiver menos de 4 horas, usa-o imediatamente!
            if (cacheSalvo && tempoDoCache && (agora - Number(tempoDoCache) < QUATRO_HORAS)) {
                console.log("⚡ [BetAnalytics] Copa do Mundo carregada do Cache Local (0 requisições gastas)");
                setJogosCopa(JSON.parse(cacheSalvo));
                setLoadingCopa(false);
                return; // Bloqueia a chamada de API desnecessária
            }

            // 🌐 Se o cache expirou ou não existe, faz a chamada real à API-Sports
            console.log("🌐 [BetAnalytics] Buscando dados reais na API-Sports... (1 requisição gasta)");
            const dados = await buscarJogosCopa();
            
            if (dados && dados.length > 0) {
                setJogosCopa(dados);
                // Guarda no LocalStorage para blindar as próximas consultas
                localStorage.setItem(CACHE_KEY, JSON.stringify(dados));
                localStorage.setItem(CACHE_TIME_KEY, agora.toString());
            } else if (cacheSalvo) {
                // Fallback de Segurança: Se a API falhar ou bater no limite do plano Free,
                // recupera o último cache salvo para o ecrã não ficar em branco.
                setJogosCopa(JSON.parse(cacheSalvo));
            }

            setLoadingCopa(false);
        }

        carregar();
    }, []);

    return { jogosCopa, loadingCopa };
}