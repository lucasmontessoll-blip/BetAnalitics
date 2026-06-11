import React, { useMemo, useState, lazy, Suspense } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { User, Settings, Bell, Award, Trophy, Target, DollarSign, BrainCircuit, ShieldAlert, Globe, PieChart, Clock, TrendingUp, Zap, ChevronRight } from 'lucide-react';

// Lazy loading para manter o telemóvel super rápido
const GestaoBanca = lazy(() => import('./GestaoBanca.jsx'));
const SimuladorStake = lazy(() => import('./SimuladorStake.jsx'));
const Historico = lazy(() => import('./Historico.jsx'));
const EstatisticasAvancadas = lazy(() => import('./EstatisticasAvancadas.jsx'));

export default function Perfil({ 
    userData, form, setForm, nivelUsuario, xp, solicitarPermissaoNotificacao, 
    setViewMode, apostas, bancaInicial, metaMensal, setMenuAtivo,
    calcularDrawdown, executarBacktest 
}) {
    const [stopWin, setStopWin] = useState(200);
    const [stopLoss, setStopLoss] = useState(100);
    const [simOdd, setSimOdd] = useState('');
    const [simStake, setSimStake] = useState('');
    const [filtroResultado, setFiltroResultado] = useState('todos');
    const [filtroLiga, setFiltroLiga] = useState('todas');

    // ============================================================================
    // ⚡ CÁLCULOS OTIMIZADOS (Protegidos pelo useMemo)
    // ============================================================================
    const lucroAcumulado = useMemo(() => apostas.reduce((acc, a) => a.resultado === "green" ? acc + ((a.stake * a.odd) - a.stake) : acc - a.stake, 0), [apostas]);
    const atingiuStopWin = lucroAcumulado >= stopWin;
    const atingiuStopLoss = lucroAcumulado <= -stopLoss;

    const dadosGraficoBanca = useMemo(() => {
        let banca = bancaInicial || 1000;
        return apostas.map((a, index) => {
            if(a.resultado === "green") banca += (a.stake * a.odd) - a.stake; else banca -= a.stake;
            return { aposta: `Bet ${index+1}`, banca: Number(banca.toFixed(2)) };
        });
    }, [apostas, bancaInicial]);

    const roiSemanal = useMemo(() => {
        const hoje = new Date();
        const ultimaSemana = apostas.filter(a => (hoje - new Date(a.data)) / (1000 * 60 * 60 * 24) <= 7);
        const investido = ultimaSemana.reduce((acc,a)=>acc+a.stake, 0);
        const lucro = ultimaSemana.reduce((acc,a) => a.resultado==="green" ? acc + ((a.stake*a.odd)-a.stake) : acc-a.stake, 0);
        return investido ? (lucro/investido)*100 : 0;
    }, [apostas]);

    const roiMensal = useMemo(() => {
        const mesAtual = new Date().getMonth();
        const apostasMes = apostas.filter(a => new Date(a.data).getMonth() === mesAtual);
        const investido = apostasMes.reduce((acc,a)=>acc+a.stake, 0);
        const lucro = apostasMes.reduce((acc,a)=> a.resultado==="green" ? acc + ((a.stake*a.odd)-a.stake) : acc-a.stake, 0);
        return investido ? (lucro/investido)*100 : 0;
    }, [apostas]);

    const roiAnual = useMemo(() => {
        const ano = new Date().getFullYear();
        const apostasAno = apostas.filter(a => new Date(a.data).getFullYear() === ano);
        const investido = apostasAno.reduce((acc,a)=>acc+a.stake, 0);
        const lucro = apostasAno.reduce((acc,a)=> a.resultado==="green" ? acc + ((a.stake*a.odd)-a.stake) : acc-a.stake, 0);
        return investido ? (lucro/investido)*100 : 0;
    }, [apostas]);

    const crescimentoBancaCalc = useMemo(() => bancaInicial === 0 ? 0 : (lucroAcumulado / bancaInicial) * 100, [lucroAcumulado, bancaInicial]);
    const progressoMetaCalc = useMemo(() => Math.min((lucroAcumulado / (metaMensal || 1)) * 100, 100), [lucroAcumulado, metaMensal]);

    const topMercados = useMemo(() => {
        const mercados = {};
        apostas.forEach(a => {
            if(!mercados[a.mercado]) mercados[a.mercado] = 0;
            if(a.resultado === "green") mercados[a.mercado] += ((a.stake * a.odd) - a.stake); else mercados[a.mercado] -= a.stake;
        });
        const sorted = Object.entries(mercados).sort((a,b)=>b[1]-a[1]);
        return sorted.length > 0 ? sorted : [['N/A', 0]];
    }, [apostas]);

    const topHorario = useMemo(() => {
        const horarios = {};
        apostas.forEach(a => {
            const hora = a.hora ? a.hora.split(":")[0] + "h" : "N/A";
            if(!horarios[hora]) horarios[hora] = 0;
            if(a.resultado === "green") horarios[hora] += ((a.stake * a.odd) - a.stake); else horarios[hora] -= a.stake;
        });
        const sorted = Object.entries(horarios).sort((a,b)=>b[1]-a[1]);
        return sorted.length > 0 ? sorted[0] : ['N/A', 0];
    }, [apostas]);

    const topTimes = useMemo(() => {
        const times = {};
        apostas.forEach(a => {
            if(!times[a.time]) times[a.time] = 0;
            if(a.resultado === "green") times[a.time] += ((a.stake * a.odd) - a.stake); else times[a.time] -= a.stake;
        });
        return Object.entries(times).sort((a,b)=>b[1]-a[1]).slice(0,5);
    }, [apostas]);

    const topLigas = useMemo(() => {
        const ligas = {};
        apostas.forEach(a => {
            if(!ligas[a.liga]) ligas[a.liga] = 0;
            if(a.resultado === "green") ligas[a.liga] += ((a.stake * a.odd) - a.stake); else ligas[a.liga] -= a.stake;
        });
        return Object.entries(ligas).sort((a,b)=>b[1]-a[1]).slice(0,5);
    }, [apostas]);

    const relatorioIACalc = useMemo(() => {
        const mercadoNome = topMercados[0][0] || 'N/A';
        if(roiMensal > 20) return `🔥 ROI excelente de ${Number(roiMensal||0).toFixed(1)}%.\nO mercado mais lucrativo é ${mercadoNome}.\nConsidere escalar os lucros de forma moderada.`;
        if(roiMensal > 5) return `✅ Desempenho sólido e positivo.\nContinue a manter uma gestão disciplinada.`;
        return `⚠️ Atenção à sua gestão.\nO seu ROI está abaixo do ideal.\nReduza as stakes temporariamente.`;
    }, [roiMensal, topMercados]);

    const listaConquistasCalc = useMemo(() => {
        const lista = [];
        if(apostas.length >= 1) lista.push("🥉 1ª Aposta");
        if(lucroAcumulado >= 500) lista.push("🥈 Lucro R$ 500");
        if(roiMensal >= 10) lista.push("🥇 ROI > 10%");
        if(apostas.length >= 50) lista.push("🏆 Veterano (50+)");
        return lista;
    }, [apostas.length, lucroAcumulado, roiMensal]);

    const lucroSimulado = (Number(simStake||0) * Number(simOdd||0)) - Number(simStake||0);
    const retornoTotal = Number(simStake||0) * Number(simOdd||0);

    const apostasFiltradas = apostas.filter(a => {
        const resultadoOk = filtroResultado === 'todos' || a.resultado === filtroResultado;
        const ligaOk = filtroLiga === 'todas' || a.liga === filtroLiga;
        return resultadoOk && ligaOk;
    });

    const fallbackSpinner = <div className="p-10 text-center text-blue-500 font-black animate-pulse text-xs uppercase tracking-widest">A carregar módulo...</div>;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black flex items-center gap-2"><User className="w-6 h-6 text-blue-500"/> Meu Perfil</h2>
                <div className="flex gap-2">
                    <button onClick={solicitarPermissaoNotificacao} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg transition-colors uppercase tracking-widest flex-shrink-0"><Bell className="w-3 h-3"/> Alertas</button>
                    
                    {/* 🔒 BOTÃO ADMIN COM DUPLA PROTEÇÃO (Email autorizado + Senha) */}
                    {userData?.is_admin && (
                        <button onClick={() => {
                            const pwd = window.prompt("Acesso Restrito. Digite a senha do Administrador:");
                            // Pode trocar 'lucasadmin2026' pela senha que quiser
                            if(pwd === "lucasadmin2026") { 
                                setViewMode('admin');
                            } else if (pwd !== null) {
                                alert("Senha Incorreta! Acesso negado.");
                            }
                        }} className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg transition-colors uppercase tracking-widest flex-shrink-0">
                            <Settings className="w-3 h-3"/> Admin
                        </button>
                    )}
                </div>
            </div>
            
            <div className="bg-[#0f172a] border border-blue-500/20 p-6 rounded-3xl shadow-xl flex flex-col items-center text-center mb-6 transform-gpu">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(37,99,235,0.4)]"><User className="w-10 h-10 text-white"/></div>
                <h2 className="text-xl font-black text-white mb-1">{form.nome || userData?.nome}</h2>
                <div className="bg-[#111827] p-4 rounded-xl border border-white/5 w-full mt-4 shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Award className="w-4 h-4 text-yellow-500"/> Nível Atual:</span>
                        <strong className="text-sm font-black text-green-400 uppercase tracking-widest">{nivelUsuario}</strong>
                    </div>
                    <div className="bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full" style={{width: `${(xp/5000)*100}%`}}></div>
                    </div>
                    <div className="text-[9px] text-right font-bold text-slate-500 mt-1.5 uppercase tracking-widest">{xp} / 5000 XP</div>
                </div>
            </div>

            <Suspense fallback={fallbackSpinner}>
                <GestaoBanca stopWin={stopWin} setStopWin={setStopWin} stopLoss={stopLoss} setStopLoss={setStopLoss} atingiuStopWin={atingiuStopWin} atingiuStopLoss={atingiuStopLoss} calcularDrawdown={calcularDrawdown} apostas={apostas} bancaInicial={bancaInicial} handleRunBacktest={() => executarBacktest(apostas, bancaInicial)}/>
            </Suspense>

            <div className="bg-[#0f172a] p-4 sm:p-5 rounded-3xl mb-6 shadow-lg border border-white/5 w-full transform-gpu">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2"><Target className="w-4 h-4 text-green-500"/> Meta Mensal</span>
                    <span className="text-xs font-bold text-slate-300">R$ {Number(lucroAcumulado || 0).toFixed(2)} <span className="text-slate-500">/ R$ {Number(metaMensal || 0).toFixed(2)}</span></span>
                </div>
                <div className="bg-slate-800 h-4 rounded-full overflow-hidden mt-3 shadow-inner">
                    <div className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full" style={{width: `${progressoMetaCalc}%`}}></div>
                </div>
            </div>

            <div className="mb-6 w-full transform-gpu">
                <h3 className="text-sm font-black text-white mb-3 uppercase tracking-wider flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500"/> Conquistas Desbloqueadas</h3>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {listaConquistasCalc.map((c, index)=>(
                        <div key={index} className="bg-[#0f172a] border border-yellow-500/20 text-yellow-500 text-xs font-black px-4 py-2.5 rounded-xl whitespace-nowrap shadow-sm">{c}</div>
                    ))}
                </div>
            </div>

            <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500"/> Retorno Sobre Investimento</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 w-full">
                <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg transform-gpu min-w-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 truncate">ROI Semanal</div>
                    <div className={`text-xl font-black truncate ${roiSemanal >= 0 ? 'text-green-400' : 'text-red-400'}`}>{Number(roiSemanal || 0).toFixed(1)}%</div>
                </div>
                <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg transform-gpu min-w-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 truncate">ROI Mensal</div>
                    <div className={`text-xl font-black truncate ${roiMensal >= 0 ? 'text-green-400' : 'text-red-400'}`}>{Number(roiMensal || 0).toFixed(1)}%</div>
                </div>
                <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg transform-gpu min-w-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 truncate">ROI Anual</div>
                    <div className={`text-xl font-black truncate ${roiAnual >= 0 ? 'text-green-400' : 'text-red-400'}`}>{Number(roiAnual || 0).toFixed(1)}%</div>
                </div>
                <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg transform-gpu min-w-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 truncate">Lucro Total</div>
                    <div className={`text-xl font-black truncate ${lucroAcumulado >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {Number(lucroAcumulado || 0).toFixed(2)}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 w-full">
                <div className="bg-[#0f172a] p-4 sm:p-5 rounded-3xl border border-white/5 shadow-lg transform-gpu min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2 truncate">Crescimento da Banca</div>
                    <div className={`text-2xl sm:text-3xl font-black truncate ${crescimentoBancaCalc >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {crescimentoBancaCalc >= 0 ? '+' : ''}{Number(crescimentoBancaCalc || 0).toFixed(2)}%
                    </div>
                </div>
                <div className="bg-[#0f172a] p-4 sm:p-5 rounded-3xl border border-blue-500/20 shadow-lg transform-gpu min-w-0">
                    <div className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-2 flex items-center gap-1.5 truncate"><BrainCircuit className="w-3 h-3 flex-shrink-0"/> IA Analista Pro</div>
                    <div className="text-xs text-slate-300 font-medium whitespace-pre-line leading-relaxed break-words">{relatorioIACalc}</div>
                </div>
            </div>

            <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500"/> Onde você mais lucra</h3>
            <div className="bg-[#0f172a] p-4 sm:p-5 rounded-3xl border border-white/5 shadow-lg transform-gpu min-w-0 mb-3 w-full">
                <h3 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2 truncate"><PieChart className="w-3 h-3 text-blue-400 flex-shrink-0"/> Top Estratégias (Mercados)</h3>
                <div className="flex flex-col gap-1">
                    {topMercados.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                            <span className="text-xs font-bold text-white truncate pr-2">{index + 1}. {item[0]}</span>
                            <span className={`text-xs font-black whitespace-nowrap flex-shrink-0 ${item[1] >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {Number(item[1]||0).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 w-full">
                <div className="bg-[#0f172a] p-4 sm:p-5 rounded-3xl border border-white/5 shadow-lg transform-gpu min-w-0">
                    <h3 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2 truncate"><ShieldAlert className="w-3 h-3 text-orange-400 flex-shrink-0"/> Top 5 Equipas</h3>
                    <div className="flex flex-col gap-1">
                        {topTimes.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                                <span className="text-xs font-bold text-white truncate pr-2">{index + 1}. {item[0]}</span>
                                <span className={`text-xs font-black whitespace-nowrap flex-shrink-0 ${item[1] >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {Number(item[1]||0).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-[#0f172a] p-4 sm:p-5 rounded-3xl border border-white/5 shadow-lg transform-gpu min-w-0">
                    <h3 className="text-xs font-black text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2 truncate"><Globe className="w-3 h-3 text-purple-400 flex-shrink-0"/> Top 5 Ligas</h3>
                    <div className="flex flex-col gap-1">
                        {topLigas.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                                <span className="text-xs font-bold text-white truncate pr-2">{index + 1}. {item[0]}</span>
                                <span className={`text-xs font-black whitespace-nowrap flex-shrink-0 ${item[1] >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {Number(item[1]||0).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 w-full">
                <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg flex flex-col gap-1 transform-gpu min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 truncate"><PieChart className="w-3 h-3 text-blue-400 flex-shrink-0"/> Top Mercado</span>
                    <strong className="text-sm font-black text-white truncate">{topMercados[0][0]}</strong>
                </div>
                <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 shadow-lg flex flex-col gap-1 transform-gpu min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 truncate"><Clock className="w-3 h-3 text-red-400 flex-shrink-0"/> Top Horário</span>
                    <strong className="text-sm font-black text-white truncate">{topHorario[0]}</strong>
                </div>
            </div>

            <Suspense fallback={fallbackSpinner}>
                <SimuladorStake simStake={simStake} setSimStake={setSimStake} simOdd={simOdd} setSimOdd={setSimOdd} lucroSimulado={lucroSimulado} retornoTotal={retornoTotal} />
            </Suspense>

            {/* GRÁFICO DA BANCA TOTALMENTE BLOQUEADO DE REDIMENSIONAMENTO */}
            <div className="bg-[#0f172a] border border-green-500/20 rounded-3xl p-4 sm:p-6 mb-6 shadow-lg transform-gpu w-full">
                <h2 className="text-sm font-black text-green-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><TrendingUp className="w-5 h-5"/> Evolução da Banca</h2>
                <div className="w-full h-[250px] overflow-hidden">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={dadosGraficoBanca}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="aposta" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff'}} />
                            <Line type="monotone" dataKey="banca" stroke="#22c55e" strokeWidth={4} dot={{r:5, fill:"#22c55e", stroke:"#fff", strokeWidth:2}} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <Suspense fallback={fallbackSpinner}>
                <EstatisticasAvancadas apostas={apostas} isPro={userData?.is_vip} onUnlockPro={() => setMenuAtivo('assinar pro')} />
            </Suspense>

            <Suspense fallback={fallbackSpinner}>
                <Historico filtroResultado={filtroResultado} setFiltroResultado={setFiltroResultado} filtroLiga={filtroLiga} setFiltroLiga={setFiltroLiga} apostasFiltradas={apostasFiltradas} />
            </Suspense>

            <div className="flex flex-col gap-3 mb-6 w-full transform-gpu">
                <button onClick={() => setViewMode('ia_center')} className="w-full bg-[#0f172a] border border-blue-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:bg-[#1e293b] transition-colors">
                    <div className="bg-blue-500/10 p-2.5 rounded-xl flex-shrink-0"><Zap className="w-5 h-5 text-blue-500"/></div>
                    <span className="font-black text-sm uppercase tracking-wider text-white truncate">Central IA</span>
                    <ChevronRight className="w-5 h-5 text-slate-600 ml-auto flex-shrink-0"/>
                </button>
            </div>
        </div>
    );
}