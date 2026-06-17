import React from 'react';
import { useCopa } from '../hooks/useCopa.js';
import { ArrowLeft, Trophy, AlertTriangle } from 'lucide-react';

export default function CopaDoMundo({ onBack }) {
    const { jogosCopa, loadingCopa } = useCopa();

    if (loadingCopa) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-yellow-500 animate-pulse">
                <Trophy className="w-12 h-12 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest">Carregando Dados da Copa 2026...</p>
            </div>
        );
    }

    return (
        <div className="p-4 animate-fade-in w-full pb-20">
            <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-[#0f172a] px-4 py-2 rounded-full border border-white/5 w-fit text-sm font-bold">
                <ArrowLeft className="w-4 h-4"/> Voltar para Radar
            </button>
            
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 p-[1px] rounded-3xl mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                <div className="bg-[#0f172a] rounded-3xl p-6 h-full w-full">
                    <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-2 uppercase tracking-tighter flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500"/> Copa do Mundo 2026
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm">Central de Análise e Inteligência Artificial Exclusiva para o Mundial.</p>
                </div>
            </div>

            {jogosCopa.length === 0 ? (
                <div className="bg-[#0f172a] border border-yellow-500/20 rounded-2xl p-6 text-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                    <p className="text-white font-bold text-sm">Os jogos oficiais de 2026 ainda não foram completamente mapeados pela FIFA na API.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {jogosCopa.map(jogo => (
                        <div key={jogo.fixture.id} className="bg-[#0f172a] border border-yellow-500/30 rounded-2xl p-5 shadow-lg transform-gpu transition-all hover:border-yellow-400/60">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs text-slate-400 font-bold bg-[#050816] px-3 py-1 rounded-full border border-white/5">
                                    {new Date(jogo.fixture.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {new Date(jogo.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest bg-yellow-500/10 px-2 py-1 rounded-md">
                                    Grupo {jogo.league.round.replace('Group ', '')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col items-center gap-2 w-1/3">
                                    <img src={jogo.teams.home.logo} alt={jogo.teams.home.name} className="w-10 h-10 object-contain drop-shadow-md"/>
                                    <span className="font-bold text-sm text-center truncate w-full">{jogo.teams.home.name}</span>
                                </div>
                                <strong className="text-yellow-500 text-sm bg-yellow-500/10 w-8 h-8 flex items-center justify-center rounded-full">VS</strong>
                                <div className="flex flex-col items-center gap-2 w-1/3">
                                    <img src={jogo.teams.away.logo} alt={jogo.teams.away.name} className="w-10 h-10 object-contain drop-shadow-md"/>
                                    <span className="font-bold text-sm text-center truncate w-full">{jogo.teams.away.name}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}