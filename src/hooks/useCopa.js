import { useEffect, useState } from 'react';
import { buscarJogosCopa } from '../services/apiFootball.js';

export function useCopa() {
    const [jogosCopa, setJogosCopa] = useState([]);
    const [loadingCopa, setLoadingCopa] = useState(true);

    useEffect(() => {
        async function carregar() {
            setLoadingCopa(true);
            const dados = await buscarJogosCopa();
            setJogosCopa(dados);
            setLoadingCopa(false);
        }
        carregar();
    }, []);

    return { jogosCopa, loadingCopa };
}