// src/services/apiFootball.js

export const buscarOddsJogo = async (fixtureId) => {
    // Futuro: await axios.get(`/api/fixture/${fixtureId}/odds`);
    return [
        { nome: 'Bet365', oddCasa: 1.82, oddEmpate: 3.50, oddFora: 4.20 },
        { nome: 'Betano', oddCasa: 1.85, oddEmpate: 3.45, oddFora: 4.10 },
        { nome: '1xBet', oddCasa: 1.87, oddEmpate: 3.40, oddFora: 4.15 }
    ];
};

export const buscarEscalacoes = async (fixtureId) => {
    // Futuro: await axios.get(`/api/fixture/${fixtureId}/lineups`);
    return {
        casa: { formacao: "4-3-3", titulares: ["Rossi", "Varela", "Fabrício B.", "Léo Pereira", "Ayrton Lucas", "Pulgar", "Gerson", "Arrascaeta", "Cebolinha", "Bruno Henrique", "Pedro"] },
        fora: { formacao: "4-2-3-1", titulares: ["Weverton", "Rocha", "Gómez", "Murilo", "Piquerez", "Zé Rafael", "Ríos", "Veiga", "Endrick", "Dudu", "Rony"] }
    };
};

export const buscarEventos = async (fixtureId) => {
    // Futuro: await axios.get(`/api/fixture/${fixtureId}/events`);
    return [
        { tempo: "15'", tipo: "Gol", time: "Flamengo", detalhe: "Pedro" },
        { tempo: "32'", tipo: "Cartão Amarelo", time: "Palmeiras", detalhe: "Zé Rafael" },
        { tempo: "45+2'", tipo: "Cartão Amarelo", time: "Flamengo", detalhe: "Pulgar" },
        { tempo: "61'", tipo: "Escanteio", time: "Flamengo", detalhe: "" },
        { tempo: "72'", tipo: "Substituição", time: "Palmeiras", detalhe: "Entra: Luis Guilherme" }
    ];
};