import React, { useState, useEffect } from 'react';
import { X, Crosshair, Zap, Radio, AlertTriangle, ShieldAlert, Target, Flame, DollarSign, Clock, Users } from 'lucide-react';
import { buscarOddsJogo, buscarEscalacoes, buscarEventos } from '../services/apiFootball';

export default function PainelJogo({ jogo, setJogoSelecionado, bancaInicial, gerarExplicacaoIA, calcularStake, calcularKelly }) {
    const [odds, setOdds] = useState([]);
    const [escalacoes, setEscalacoes] = useState(null);
    const [eventos, setEventos] = useState([]);
    const [carregandoDados, setCarregandoDados] = useState(true);

    useEffect(() => {
        const carregarAPI = async () => {
            const [dadosOdds, dadosEscalacoes, dadosEventos] = await Promise.all([
                buscarOddsJogo(jogo.id),
                buscarEscalacoes(jogo.id),
                buscarEventos(jogo.id)
            ]);
            setOdds(dadosOdds);
            setEscalacoes(dadosEscalacoes);
            setEventos(dadosEventos);
            setCarregandoDados(false);
        };
        carregarAPI();
    }, [jogo.id]);

    // Cálculo do Radar de Pressão Mágico da IA
    const calcularPressao = (stats) => {
        if(!stats || stats.length < 2) return { h: 50, a: 50 }; // Proteção extra caso stats venha incompleto
        const pressaoCasa = (stats[0].shotsOnGoal * 3) + (stats[0].corners * 2) + (stats[0].ballPossession * 0.2);
        const pressaoFora = (stats[1].shotsOnGoal * 3) + (stats[1].corners * 2) + (stats[1].ballPossession * 0.2);
        const total = pressaoCasa + pressaoFora;
        return { 
            h: total > 0 ? Math.round((pressaoCasa / total) * 100) : 50, 
            a: total > 0 ? Math.round((pressaoFora / total) * 100) : 50 
        };
    };

    const pressao = jogo.stats_reais ? calcularPressao([{shotsOnGoal: 15, corners: 7, ballPossession: 58}, {shotsOnGoal: 8, corners: 3, ballPossession: 42}]) : {h:50, a:50};
    const timeDominante = pressao.h > 60 ? jogo.home_team : pressao.a > 60 ? jogo.away_team : null;

    // Cálculo de Value Bet Real
    const melhorOddCasa = odds.length > 0 ? Math.max(...odds.map(o => o.oddCasa)) : (jogo.odd_principal || 1.85);
    const probMercado = 100 / melhorOddCasa;
    const isValueBet = (jogo.confianca_ia || 50) > probMercado;
    const valueEdge = (jogo.confianca_ia || 50) - probMercado;

    return (
        <div className="px-4 mt-4 pb-20 animate-fade-in w-full">
            <button onClick={() => setJogoSelecionado(null)} className="text-slate-400 text-xs font-bold flex items-center gap-1 mb-6 bg-[#0f172a] border border-white/10 px-4 py-2 rounded-xl uppercase tracking-wider"><X className="w-4 h-4"/> Voltar</button>
            
            <div className="bg-[#0f172a] rounded-3xl p-4 sm:p-6 border border-blue-500/30 shadow-2xl shadow-blue-500/10 mb-6 transform-gpu">
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex flex-col items-center w-1/3 min-w-0"><img src={jogo.home_image} className="w-12 h-12 sm:w-16 sm:h-16 mb-2 drop-shadow-lg" alt=""/><span className="font-black text-[10px] sm:text-xs text-center truncate w-full">{jogo.home_team}</span></div>
                    <div className="w-1/3 text-center"><div className="text-3xl sm:text-4xl font-black mb-1 tracking-tighter truncate">{jogo.status === 'Not Started' ? 'VS' : `${jogo.scoreHome} - ${jogo.scoreAway}`}</div></div>
                    <div className="flex flex-col items-center w-1/3 min-w-0"><img src={jogo.away_image} className="w-12 h-12 sm:w-16 sm:h-16 mb-2 drop-shadow-lg" alt=""/><span className="font-black text-[10px] sm:text-xs text-center truncate w-full">{jogo.away_team}</span></div>
                </div>

                {carregandoDados ? (
                    <div className="text-center p-10 font-black text-blue-500 animate-pulse text-xs uppercase tracking-widest">A carregar API-Football...</div>
                ) : (
                    <>
                        {/* 1. RADAR DE PRESSÃO E EVENTOS IA */}
                        {jogo.status === 'Live' && (
                            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mb-5 shadow-inner">
                                <h4 className="font-black text-[10px] text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Flame className="w-3 h-3 animate-pulse"/> Radar de Pressão Ao Vivo</h4>
                                <div className="flex justify-between text-xs font-bold text-white mb-1">
                                    <span>{jogo.home_team} {pressao.h}%</span><span>{pressao.a}% {jogo.away_team}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                                    <div className="bg-red-500 h-full" style={{width: `${pressao.h}%`}}></div>
                                    <div className="bg-blue-500 h-full" style={{width: `${pressao.a}%`}}></div>
                                </div>
                                {timeDominante && pressao.h > 70 && (
                                    <p className="mt-3 text-xs text-red-300 font-bold bg-red-500/20 p-2 rounded-lg text-center">🚨 ALERTA IA: {timeDominante} sufocando! Possível GOL iminente.</p>
                                )}
                            </div>
                        )}

                        {/* 2. VALUE BET REAL */}
                        <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 mb-5 shadow-inner flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div>
                                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Target className="w-3 h-3 text-green-500"/> Value Bet Detector</h4>
                                <p className="text-xs text-slate-300 font-bold">Prob. IA: <span className="text-white">{jogo.confianca_ia || 50}%</span> | Prob. Mercado: <span className="text-white">{probMercado.toFixed(1)}%</span></p>
                            </div>
                            {isValueBet ? (
                                <div className="bg-green-500/20 border border-green-500/50 text-green-400 font-black text-xs px-4 py-2 rounded-xl whitespace-nowrap">💰 VALUE BET (+{valueEdge.toFixed(1)}%)</div>
                            ) : (
                                <div className="bg-orange-500/20 border border-orange-500/50 text-orange-400 font-black text-xs px-4 py-2 rounded-xl whitespace-nowrap">⚠️ Sem Valor (-{Math.abs(valueEdge).toFixed(1)}%)</div>
                            )}
                        </div>

                        {/* 3. COMPARAÇÃO DE ODDS */}
                        <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 mb-5 shadow-inner">
                            <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><DollarSign className="w-3 h-3 text-yellow-500"/> Comparação de Casas</h4>
                            <div className="overflow-x-auto no-scrollbar pb-2">
                                <div className="flex gap-3">
                                    {odds.length > 0 ? odds.map((casa, i) => (
                                        <div key={i} className="bg-[#050816] p-3 rounded-xl border border-white/5 min-w-[120px] flex-shrink-0 text-center">
                                            <span className="text-[10px] font-bold text-white block mb-1">{casa.nome}</span>
                                            <span className={`text-sm font-black ${casa.oddCasa === melhorOddCasa ? 'text-green-400' : 'text-slate-300'}`}>@{casa.oddCasa.toFixed(2)}</span>
                                        </div>
                                    )) : (
                                        <span className="text-xs text-slate-500 italic">Buscando odds no mercado...</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 4. DISCIPLINA E ESTATÍSTICAS AVANÇADAS */}
                        {jogo.status === 'Live' && jogo.stats_reais && (
                            <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 mb-5 shadow-inner">
                                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldAlert className="w-3 h-3 text-red-500"/> Disciplina & Estatísticas</h4>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                     <div className="bg-[#050816] p-2 rounded-xl text-center border border-yellow-500/20">
                                         <span className="text-[9px] text-yellow-400 font-bold uppercase tracking-widest block mb-1">Amarelos</span>
                                         <div className="flex justify-center gap-2 text-sm font-black text-white"><span>{jogo.amarelosCasa || 2}</span> <span className="text-slate-600">-</span> <span>{jogo.amarelosFora || 4}</span></div>
                                     </div>
                                     <div className="bg-[#050816] p-2 rounded-xl text-center border border-red-500/20">
                                         <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest block mb-1">Vermelhos</span>
                                         <div className="flex justify-center gap-2 text-sm font-black text-white"><span>{jogo.vermelhosCasa || 0}</span> <span className="text-slate-600">-</span> <span>{jogo.vermelhosFora || 1}</span></div>
                                     </div>
                                     <div className="bg-[#050816] p-2 rounded-xl text-center border border-orange-500/20">
                                         <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest block mb-1">Faltas</span>
                                         <div className="flex justify-center gap-2 text-sm font-black text-white"><span>{jogo.faltasCasa || 12}</span> <span className="text-slate-600">-</span> <span>{jogo.faltasFora || 15}</span></div>
                                     </div>
                                </div>
                                {jogo.stats_reais.map((stat, i) => (
                                    <div key={i} className="flex justify-between items-center mb-2 text-xs font-bold text-white">
                                        <span className="w-8 text-center bg-[#050816] py-1 rounded">{stat.h}</span><span className="text-[10px] text-slate-500 uppercase tracking-widest">{stat.type}</span><span className="w-8 text-center bg-[#050816] py-1 rounded">{stat.a}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 5. TIMELINE E ESCALAÇÕES BLINDADAS CONTRA ERROS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                            <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-inner">
                                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Clock className="w-3 h-3 text-blue-500"/> Timeline do Jogo</h4>
                                <div className="flex flex-col gap-2 h-40 overflow-y-auto custom-scrollbar pr-2">
                                    {eventos.length > 0 ? eventos.map((ev, i) => (
                                        <div key={i} className="flex gap-3 items-center text-xs">
                                            <span className="font-black text-blue-400 w-8">{ev.tempo}</span>
                                            <div className="bg-[#050816] p-2 rounded-lg border border-white/5 flex-1 font-bold text-slate-200">
                                                {ev.tipo}: {ev.time} {ev.detalhe && <span className="text-slate-400 font-normal">({ev.detalhe})</span>}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-xs text-slate-500 italic mt-2">Sem eventos registrados até o momento.</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-inner">
                                {/* 🔥 AQUI ESTAVA O ERRO PRINCIPAL: Adicionado ? de segurança */}
                                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Users className="w-3 h-3 text-purple-500"/> Escalações ({escalacoes?.casa?.formacao || "N/A"})
                                </h4>
                                <div className="flex gap-4 h-40 overflow-y-auto custom-scrollbar text-xs text-slate-300 font-semibold">
                                    <div className="w-1/2 border-r border-white/5 pr-2">
                                        <div className="text-white font-black mb-2 truncate">{jogo.home_team}</div>
                                        {/* 🔥 BLINDAGEM NOS TITULARES DA CASA */}
                                        {escalacoes?.casa?.titulares?.length > 0 ? (
                                            escalacoes.casa.titulares.map((j, i) => <div key={i} className="mb-1 truncate">{j}</div>)
                                        ) : (
                                            <div className="text-slate-600 text-[10px] italic">Escalação indisponível</div>
                                        )}
                                    </div>
                                    <div className="w-1/2 pl-2">
                                        <div className="text-white font-black mb-2 truncate">{jogo.away_team}</div>
                                        {/* 🔥 BLINDAGEM NOS TITULARES DE FORA */}
                                        {escalacoes?.fora?.titulares?.length > 0 ? (
                                            escalacoes.fora.titulares.map((j, i) => <div key={i} className="mb-1 truncate">{j}</div>)
                                        ) : (
                                            <div className="text-slate-600 text-[10px] italic">Escalação indisponível</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STAKE E IA */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-center min-w-0">
                                <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest block mb-1 truncate">Stake Recomendada</span>
                                <strong className="text-lg sm:text-xl font-black text-white truncate block">R$ {Number(calcularStake(bancaInicial, jogo.confianca_ia)||0).toFixed(2)}</strong>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl text-center min-w-0">
                                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block mb-1 truncate">🧠 Kelly Criterion</span>
                                <strong className="text-lg sm:text-xl font-black text-white truncate block">{Number(calcularKelly(melhorOddCasa, jogo.confianca_ia)||0).toFixed(1)}%</strong>
                            </div>
                        </div>
                        
                        <div className="bg-[#050816] rounded-2xl p-4 sm:p-5 border border-slate-800/80 relative overflow-hidden flex flex-col items-start mb-4">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-xl rounded-full"></div>
                            <div className="flex items-center gap-2 mb-3 relative z-10"><Crosshair className="w-5 h-5 text-blue-500 flex-shrink-0" /><h4 className="font-black text-xs text-blue-400 uppercase tracking-widest truncate">Relatório IA</h4></div>
                            {jogo.explanation ? (
                                <div className="text-slate-300 text-xs leading-relaxed relative z-10 font-semibold whitespace-pre-line">{jogo.explanation}</div>
                            ) : (
                                <button onClick={() => gerarExplicacaoIA(jogo)} disabled={jogo.is_loading_explanation} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 relative z-10">
                                   {jogo.is_loading_explanation ? <span className="animate-pulse truncate">A calcular motivos...</span> : <><Zap className="w-4 h-4 flex-shrink-0"/> <span className="truncate">Gerar Relatório Profissional</span></>}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}